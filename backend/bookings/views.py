"""
Booking management views — Person 2.
Organiser: list, detail, confirm, reject, calendar view.
"""
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .models import Booking, Service
from .serializers import (
    BookingListSerializer, BookingDetailSerializer,
    CalendarEventSerializer, StatusUpdateSerializer, RejectSerializer,
)


class IsOrganiser:
    """Check that request user is an organiser."""
    def check(self, request):
        if request.user.role != 'organiser':
            return False
        return True


def get_organiser_services(user):
    """Get all service IDs belonging to this organiser."""
    return Service.objects.filter(
        organiser_id=user.user_id
    ).values_list('id', flat=True)


class BookingListView(APIView):
    """
    GET /api/bookings/?service=<id>&status=<s>&date_from=<d>&date_to=<d>&page=<n>
    List bookings for the organiser's services with filters.
    """

    def get(self, request):
        if request.user.role not in ('organiser', 'admin'):
            return Response(
                {'error': True, 'code': 'FORBIDDEN', 'message': 'Organiser access required'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get organiser's service IDs
        if request.user.role == 'admin':
            service_ids = Service.objects.values_list('id', flat=True)
        else:
            service_ids = get_organiser_services(request.user)

        bookings = Booking.objects.filter(service_id__in=list(service_ids))

        # Filters
        service_filter = request.query_params.get('service')
        if service_filter:
            bookings = bookings.filter(service_id=service_filter)

        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)

        date_from = request.query_params.get('date_from')
        if date_from:
            bookings = bookings.filter(slot_date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            bookings = bookings.filter(slot_date__lte=date_to)

        channel_filter = request.query_params.get('channel')
        if channel_filter:
            bookings = bookings.filter(booking_channel=channel_filter)

        # Sort
        sort = request.query_params.get('sort', 'slot_date')
        bookings = bookings.order_by(sort)

        # Simple pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        total = bookings.count()
        start = (page - 1) * page_size
        bookings = bookings[start:start + page_size]

        serializer = BookingListSerializer(bookings, many=True)
        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        })


class BookingDetailView(APIView):
    """GET /api/bookings/<id>/ — Single booking with answers."""

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': True, 'code': 'NOT_FOUND', 'message': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ownership check
        service = booking.service
        if not service:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if request.user.role == 'organiser' and service.organiser_id != request.user.user_id:
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)


class BookingConfirmView(APIView):
    """
    POST /api/bookings/<id>/confirm/
    Flip status to confirmed. Trigger email + calendar + no-show prediction.
    """

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        # Ownership
        service = booking.service
        if request.user.role == 'organiser' and service.organiser_id != request.user.user_id:
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        # Validate transition
        if booking.status not in ('pending',):
            return Response({
                'error': True,
                'code': 'INVALID_STATUS_TRANSITION',
                'message': f'Cannot confirm a booking with status "{booking.status}"',
            }, status=status.HTTP_400_BAD_REQUEST)

        # Re-check capacity before confirming
        if service.max_capacity:
            booked_count = Booking.objects.filter(
                service_id=booking.service_id,
                slot_date=booking.slot_date,
                slot_start=booking.slot_start,
                status__in=['confirmed'],
            ).count()
            if booked_count >= service.max_capacity:
                return Response({
                    'error': True,
                    'code': 'CAPACITY_EXCEEDED',
                    'message': 'Slot is now at full capacity',
                }, status=status.HTTP_409_CONFLICT)

        # Update status
        booking.status = 'confirmed'
        booking.confirmed_at = datetime.now()
        booking.save()

        # Trigger async tasks
        from notifications.tasks import (
            send_booking_approved, run_no_show_prediction,
        )
        send_booking_approved.delay(str(booking.id))
        run_no_show_prediction.delay(str(booking.id))

        return Response({
            'id': str(booking.id),
            'status': 'confirmed',
            'message': 'Booking confirmed successfully',
        })


class BookingRejectView(APIView):
    """
    POST /api/bookings/<id>/reject/
    Cancel with reason. Trigger rejection email + waitlist check.
    """

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        service = booking.service
        if request.user.role == 'organiser' and service.organiser_id != request.user.user_id:
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        if booking.status in ('cancelled', 'completed'):
            return Response({
                'error': True,
                'code': 'INVALID_STATUS_TRANSITION',
                'message': f'Cannot reject a booking with status "{booking.status}"',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = RejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data.get('reason', '')

        booking.status = 'cancelled'
        booking.cancelled_at = datetime.now()
        booking.notes = f"Rejected by organiser: {reason}" if reason else 'Rejected by organiser'
        booking.save()

        # Trigger async tasks
        from notifications.tasks import send_booking_rejected, check_waitlist_for_slot
        send_booking_rejected.delay(str(booking.id), reason)
        check_waitlist_for_slot.delay(
            str(booking.service_id), str(booking.slot_date), str(booking.slot_start),
        )

        return Response({
            'id': str(booking.id),
            'status': 'cancelled',
            'message': 'Booking rejected',
        })


class BookingStatusUpdateView(APIView):
    """PATCH /api/bookings/<id>/status/ — Quick status change."""

    VALID_TRANSITIONS = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled', 'no_show'],
        'rescheduled': ['confirmed', 'cancelled'],
    }

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        valid_next = self.VALID_TRANSITIONS.get(booking.status, [])
        if new_status not in valid_next:
            return Response({
                'error': True,
                'code': 'INVALID_STATUS_TRANSITION',
                'message': f'Cannot change from "{booking.status}" to "{new_status}". '
                           f'Valid transitions: {valid_next}',
            }, status=status.HTTP_400_BAD_REQUEST)

        booking.status = new_status
        if new_status == 'confirmed':
            booking.confirmed_at = datetime.now()
        elif new_status == 'cancelled':
            booking.cancelled_at = datetime.now()
        booking.save()

        return Response({'id': str(booking.id), 'status': new_status})


class BookingCalendarView(APIView):
    """
    GET /api/bookings/calendar/?service=<id>&month=2026-05
    Returns FullCalendar.js formatted events.
    """

    def get(self, request):
        service_id = request.query_params.get('service')
        month = request.query_params.get('month')  # format: 2026-05

        if request.user.role == 'organiser':
            service_ids = get_organiser_services(request.user)
        else:
            service_ids = Service.objects.values_list('id', flat=True)

        bookings = Booking.objects.filter(service_id__in=list(service_ids))

        if service_id:
            bookings = bookings.filter(service_id=service_id)

        if month:
            try:
                year, mo = month.split('-')
                bookings = bookings.filter(
                    slot_date__year=int(year),
                    slot_date__month=int(mo),
                )
            except ValueError:
                pass

        bookings = bookings.exclude(status='cancelled')
        serializer = CalendarEventSerializer(bookings, many=True)
        return Response(serializer.data)
