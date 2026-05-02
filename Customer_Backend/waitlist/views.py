"""
Waitlist views — B3 Waitlist System.

POST   /api/waitlist/                     Join waitlist
GET    /api/waitlist/mine/                Customer's waitlist entries
DELETE /api/waitlist/<id>/                Leave waitlist
GET    /api/waitlist/claim/<token>/       Claim a waitlisted slot (from email link)
"""
import uuid
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Waitlist
from .serializers import WaitlistCreateSerializer, WaitlistResponseSerializer


class WaitlistJoinView(APIView):
    """
    POST /api/waitlist/
    Body: { service_id, slot_date, slot_start, resource_id? }

    Adds customer to the waitlist for a specific slot.
    """

    def post(self, request):
        serializer = WaitlistCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service_id = str(data['service_id'])
        slot_date = data['slot_date']
        slot_start = data['slot_start']
        resource_id = str(data['resource_id']) if data.get('resource_id') else None

        # Check if already on waitlist for this slot
        existing = Waitlist.objects.filter(
            service_id=service_id,
            customer_id=request.user.user_id,
            slot_date=slot_date,
            slot_start=slot_start,
        ).first()

        if existing:
            return Response(
                {'error': True, 'code': 'ALREADY_WAITLISTED',
                 'message': 'You are already on the waitlist for this slot.'},
                status=status.HTTP_409_CONFLICT,
            )

        # Create waitlist entry
        entry = Waitlist.objects.create(
            service_id=service_id,
            customer_id=request.user.user_id,
            resource_id=resource_id,
            slot_date=slot_date,
            slot_start=slot_start,
            notify_token=uuid.uuid4().hex[:12],
        )

        # Calculate position
        position = Waitlist.objects.filter(
            service_id=service_id,
            slot_date=slot_date,
            slot_start=slot_start,
            created_at__lte=entry.created_at,
        ).count()

        return Response({
            'id': str(entry.id),
            'service_id': service_id,
            'slot_date': str(slot_date),
            'slot_start': str(slot_start)[:5],
            'resource_id': resource_id,
            'notify_token': entry.notify_token,
            'position': position,
            'created_at': entry.created_at,
            'message': f'You are #{position} on the waitlist.',
        }, status=status.HTTP_201_CREATED)


class WaitlistMyEntriesView(APIView):
    """
    GET /api/waitlist/mine/
    Returns customer's current waitlist entries with position.
    """

    def get(self, request):
        entries = Waitlist.objects.filter(
            customer_id=request.user.user_id,
        ).order_by('-created_at')

        result = []
        for entry in entries:
            position = Waitlist.objects.filter(
                service_id=entry.service_id,
                slot_date=entry.slot_date,
                slot_start=entry.slot_start,
                created_at__lte=entry.created_at,
            ).count()

            # Get service title
            from django.db import connection
            service_title = None
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT title FROM services_service WHERE id = %s",
                    [str(entry.service_id)],
                )
                row = cur.fetchone()
                if row:
                    service_title = row[0]

            result.append({
                'id': str(entry.id),
                'service_id': str(entry.service_id),
                'service_title': service_title,
                'slot_date': str(entry.slot_date),
                'slot_start': str(entry.slot_start)[:5],
                'resource_id': str(entry.resource_id) if entry.resource_id else None,
                'position': position,
                'created_at': entry.created_at,
            })

        return Response(result)


class WaitlistLeaveView(APIView):
    """
    DELETE /api/waitlist/<id>/
    Customer leaves the waitlist.
    """

    def delete(self, request, pk):
        try:
            entry = Waitlist.objects.get(id=pk)
        except Waitlist.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

        if str(entry.customer_id) != str(request.user.user_id):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WaitlistClaimView(APIView):
    """
    GET /api/waitlist/claim/<token>/
    Unauthenticated — claim a slot from waitlist notification email.

    Validates token + expiry → auto-books the slot.
    """
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            entry = Waitlist.objects.get(notify_token=token)
        except Waitlist.DoesNotExist:
            return Response(
                {'error': True, 'code': 'INVALID_TOKEN',
                 'message': 'This waitlist claim link is invalid.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if expired
        if entry.notify_expires_at and entry.notify_expires_at < timezone.now():
            return Response(
                {'error': True, 'code': 'TOKEN_EXPIRED',
                 'message': 'This link has expired. You\'ll be notified if another slot opens.'},
                status=status.HTTP_410_GONE,
            )

        # Check slot is still available
        from services.availability import compute_slot_availability
        slots = compute_slot_availability(
            str(entry.service_id), entry.slot_date,
            str(entry.resource_id) if entry.resource_id else None,
        )
        start_str = str(entry.slot_start)[:5]
        matching = [s for s in slots if s['start'] == start_str]

        if not matching or matching[0]['remaining'] < 1:
            return Response(
                {'error': True, 'code': 'SLOT_NO_LONGER_AVAILABLE',
                 'message': 'Sorry, this slot has already been filled.'},
                status=status.HTTP_409_CONFLICT,
            )

        # Auto-book
        from django.db import connection
        import uuid as uuid_mod
        booking_id = uuid_mod.uuid4()
        confirmation_token = uuid_mod.uuid4().hex[:12]

        with transaction.atomic():
            with connection.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO bookings_booking
                    (id, service_id, customer_id, resource_id, slot_date, slot_start, slot_end,
                     status, capacity_booked, payment_status, booking_channel, confirmation_token,
                     created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, %s, %s, %s, %s)
                    """,
                    [
                        str(booking_id),
                        str(entry.service_id),
                        str(entry.customer_id),
                        str(entry.resource_id) if entry.resource_id else None,
                        entry.slot_date,
                        entry.slot_start,
                        matching[0]['end'] + ':00' if matching else entry.slot_start,
                        'confirmed',
                        'unpaid',
                        'web',
                        confirmation_token,
                        timezone.now(),
                    ],
                )

            # Remove from waitlist
            entry.delete()

        return Response({
            'booking_id': str(booking_id),
            'status': 'confirmed',
            'confirmation_token': confirmation_token,
            'message': 'Slot claimed successfully! Your booking is confirmed.',
        })
