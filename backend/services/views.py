import uuid
from datetime import datetime, timedelta, date as date_type, time as time_type
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Service, Schedule, WeeklySlot, FlexibleSlot, ServiceQuestion, Resource
from .serializers import (
    ServiceSerializer, ScheduleSerializer, WeeklySlotSerializer,
    FlexibleSlotSerializer, ServiceQuestionSerializer, ResourceSerializer
)
from .calendar_service import get_busy_slots
from bookings.models import Booking


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    lookup_value_regex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

    def get_permissions(self):
        # Allow public browsing of published services
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        qs = Service.objects.all().order_by('-created_at')  # Professional ordering

        if not user.is_authenticated or user.role == 'customer':
            return qs.filter(is_published=True, approval_status='approved')
        
        if user.role == 'admin':
            return qs
            
        if user.role in ['organiser', 'pending_organiser']:
            return qs.filter(created_by=user)
            
        if user.organization:
            return qs.filter(organization=user.organization)
            
        return Service.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.organization:
            raise serializers.ValidationError("You must belong to an organization to create a service.")
        serializer.save(
            organization=user.organization, 
            created_by=user,
            approval_status='pending'
        )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        service = self.get_object()
        if service.approval_status != 'approved':
            return Response({'error': True, 'message': 'Service must be approved by admin before publishing'}, status=status.HTTP_400_BAD_REQUEST)
        service.is_published = True
        service.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        service = self.get_object()
        service.is_published = False
        service.save()
        return Response({'status': 'unpublished'})

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def preview(self, request, pk=None):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
        
        # Don't require approval for preview if we have token, but since we use pk directly, 
        # let's just return it. In real app, check a share token.
        serializer = self.get_serializer(service)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='shared/(?P<token>[^/.]+)')
    def share_by_token(self, request, token=None):
        """
        GET /api/services/shared/<token>/
        Public endpoint: returns the service matching the share token.
        Bypasses is_published — anyone with the link can book.
        """
        try:
            service = Service.objects.get(share_token=token)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND', 'message': 'Invalid or expired share link'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(service)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='regenerate-token')
    def regenerate_share_token(self, request, pk=None):
        """
        POST /api/services/<id>/regenerate-token/
        Generates a new share token, invalidating the old link.
        """
        import secrets
        service = self.get_object()
        service.share_token = secrets.token_urlsafe(32)
        service.save(update_fields=['share_token'])
        return Response({'share_token': service.share_token})

    # ── Helper: compute valid date range for a service ─────────
    def _get_valid_dates(self, service):
        """Return list of valid booking dates based on service schedule config."""
        start = service.schedule_start_date or date_type.today()
        num_days = service.schedule_days or 7
        excluded = service.excluded_days or []

        valid = []
        for i in range(num_days):
            d = start + timedelta(days=i)
            # Python weekday: 0=Mon .. 6=Sun
            if d.weekday() not in excluded and d >= date_type.today():
                valid.append(d)
        return valid

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='available-dates')
    def available_dates(self, request, pk=None):
        """
        GET /api/services/<id>/available-dates/
        Returns list of valid booking dates (YYYY-MM-DD strings).
        """
        service = self.get_object()
        valid = self._get_valid_dates(service)
        return Response([d.isoformat() for d in valid])

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def slots(self, request, pk=None):
        """
        GET /api/services/<id>/slots/?date=YYYY-MM-DD
        Returns list of available {start_time, end_time, remaining_capacity} slots.
        """
        service = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date parameter is required'}, status=400)
        
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'invalid date format, use YYYY-MM-DD'}, status=400)

        # 1. Validate date is within the service's scheduling window
        valid_dates = self._get_valid_dates(service)
        if target_date not in valid_dates:
            return Response([])  # Date not in valid range or is an excluded day

        # 2. Determine working hours
        work_start = service.working_start_time or time_type(9, 0)
        work_end = service.working_end_time or time_type(17, 0)
        duration = timedelta(minutes=service.duration_minutes or 30)

        # 3. Generate time chunks from working_start to working_end
        slot_start_dt = datetime.combine(target_date, work_start)
        slot_end_dt = datetime.combine(target_date, work_end)

        all_chunks = []
        current = slot_start_dt
        while current + duration <= slot_end_dt:
            all_chunks.append({
                'start': current,
                'end': current + duration
            })
            current += duration

        if not all_chunks:
            return Response([])

        # 4. Filter based on capacity — a slot is available if bookings < capacity_per_slot
        capacity = service.capacity_per_slot or 1
        existing_bookings = Booking.objects.filter(
            service=service,
            slot_date=target_date,
            status__in=['pending', 'confirmed']
        )

        available_chunks = []
        for chunk in all_chunks:
            chunk_start_time = chunk['start'].time()
            chunk_end_time = chunk['end'].time()

            # Count bookings that overlap with this chunk
            overlap_count = 0
            for b in existing_bookings:
                b_start = datetime.combine(target_date, b.slot_start)
                b_end = datetime.combine(target_date, b.slot_end)
                if chunk['start'] < b_end and chunk['end'] > b_start:
                    overlap_count += 1

            if overlap_count < capacity:
                available_chunks.append({
                    **chunk,
                    'remaining': capacity - overlap_count
                })

        # 5. Filter out Google Calendar busy slots (if organiser connected)
        organiser = service.created_by
        if organiser and hasattr(organiser, 'google_creds'):
            try:
                busy_slots = get_busy_slots(organiser, target_date, target_date)
                final_available = []
                for chunk in available_chunks:
                    is_busy = False
                    for busy in busy_slots:
                        try:
                            busy_start = datetime.fromisoformat(busy['start'].replace('Z', '+00:00'))
                            busy_end = datetime.fromisoformat(busy['end'].replace('Z', '+00:00'))
                            busy_start = busy_start.replace(tzinfo=None)
                            busy_end = busy_end.replace(tzinfo=None)
                            
                            if chunk['start'] < busy_end and chunk['end'] > busy_start:
                                is_busy = True
                                break
                        except:
                            continue
                    if not is_busy:
                        final_available.append(chunk)
                available_chunks = final_available
            except Exception as e:
                print(f"Google Calendar busy check failed: {e}")

        return Response([
            {
                'start_time': c['start'].strftime('%H:%M'),
                'end_time': c['end'].strftime('%H:%M'),
                'remaining_capacity': c.get('remaining', 1),
            }
            for c in available_chunks
        ])

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Schedule.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)

class WeeklySlotViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklySlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeeklySlot.objects.filter(schedule__service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        schedule_id = self.request.data.get('schedule_id')
        schedule = Schedule.objects.get(id=schedule_id, service__organization=self.request.user.organization)
        serializer.save(schedule=schedule)

class FlexibleSlotViewSet(viewsets.ModelViewSet):
    serializer_class = FlexibleSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FlexibleSlot.objects.filter(schedule__service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        schedule_id = self.request.data.get('schedule_id')
        schedule = Schedule.objects.get(id=schedule_id, service__organization=self.request.user.organization)
        serializer.save(schedule=schedule)

class ServiceQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceQuestion.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)

