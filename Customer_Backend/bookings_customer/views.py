"""
Bookings Customer views — A2 Booking Flow backend.

POST   /api/bookings/                         Create booking (atomic)
GET    /api/bookings/<id>/                    Customer's booking detail
GET    /api/bookings/mine/                    Customer's bookings (date filter for conflict check)
GET    /api/bookings/<id>/status/             Lightweight poll for payment timer
POST   /api/bookings/<id>/cancel/             Customer cancels own booking
GET    /api/bookings/cancel/<token>/          Unauthenticated cancel via email link
"""
from datetime import datetime
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Booking, BookingAnswer, Service
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingListSerializer,
    BookingStatusSerializer,
)
from slots.models import SlotHold
from services.availability import compute_slot_availability


def _assert_owns_booking(booking, request):
    """Returns True if the requesting customer owns this booking."""
    return booking.customer_id == request.user.user_id


class CustomerBookingCreateView(APIView):
    """
    POST /api/bookings/
    Atomic booking creation:
      1. Validate hold exists, is not expired, matches the requested slot
      2. Re-check capacity (race-condition guard)
      3. BEGIN TRANSACTION
         a. Create bookings row
         b. Bulk-create booking_answers
         c. Delete hold
      4. COMMIT
      5. Fire async notification
    """

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service_id = str(data['service_id'])
        slot_date = data['slot_date']
        slot_start = data['slot_start']
        slot_end = data['slot_end']
        hold_id = data['hold_id']
        capacity_booked = data['capacity_booked']
        resource_id = str(data['resource_id']) if data.get('resource_id') else None
        answers_data = data.get('answers', [])
        notes = data.get('notes', '')

        # ── 1. Validate hold ─────────────────────────────────────────────────
        try:
            hold = SlotHold.objects.get(id=hold_id)
        except SlotHold.DoesNotExist:
            return Response(
                {'error': True, 'code': 'HOLD_NOT_FOUND',
                 'message': 'Slot hold not found. Please re-select your slot.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hold.is_expired:
            hold.delete()
            return Response(
                {'error': True, 'code': 'HOLD_EXPIRED',
                 'message': 'Your slot reservation expired. Please start over.'},
                status=status.HTTP_410_GONE,
            )

        # Ensure hold matches the submitted slot
        if (
            str(hold.service_id) != service_id
            or str(hold.slot_date) != str(slot_date)
            or str(hold.slot_start)[:5] != str(slot_start)[:5]
            or str(hold.slot_end)[:5] != str(slot_end)[:5]
        ):
            return Response(
                {'error': True, 'code': 'HOLD_MISMATCH',
                 'message': 'Hold does not match the submitted slot details.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. Validate service exists ───────────────────────────────────────
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'SERVICE_NOT_FOUND'}, status=404)

        # ── 3. Race-condition capacity guard ─────────────────────────────────
        slots = compute_slot_availability(service_id, slot_date, resource_id)
        start_str = str(slot_start)[:5]
        end_str = str(slot_end)[:5]
        matching = [s for s in slots if s['start'] == start_str and s['end'] == end_str]

        if not matching or matching[0]['remaining'] < capacity_booked:
            remaining = matching[0]['remaining'] if matching else 0
            return Response(
                {'error': True, 'code': 'SLOT_FULL',
                 'message': f'Slot no longer has enough capacity. {remaining} seat(s) left.'},
                status=status.HTTP_409_CONFLICT,
            )

        # ── 4. Determine initial status ──────────────────────────────────────
        # pending_payment   → if advance payment required
        # pending           → if manual confirmation required
        # confirmed         → auto-confirm everything else
        if service.advance_payment_required:
            initial_status = 'pending'
            initial_payment_status = 'unpaid'
        elif service.manual_confirmation:
            initial_status = 'pending'
            initial_payment_status = 'unpaid'
        else:
            initial_status = 'confirmed'
            initial_payment_status = 'unpaid'

        # ── 5. Atomic transaction ────────────────────────────────────────────
        with transaction.atomic():
            booking = Booking.objects.create(
                service_id=service_id,
                customer_id=request.user.user_id,
                resource_id=resource_id,
                slot_date=slot_date,
                slot_start=slot_start,
                slot_end=slot_end,
                status=initial_status,
                capacity_booked=capacity_booked,
                payment_status=initial_payment_status,
                booking_channel='web',
                notes=notes,
                confirmed_at=timezone.now() if initial_status == 'confirmed' else None,
            )

            # Bulk-create answers
            if answers_data:
                BookingAnswer.objects.bulk_create([
                    BookingAnswer(
                        booking_id=booking.id,
                        question_id=ans['question_id'],
                        answer_text=ans['value'],
                    )
                    for ans in answers_data
                ])

            # Release the hold
            hold.delete()

        # ── 6. Async notification ────────────────────────────────────────────
        try:
            from notifications.tasks import send_booking_confirmation
            send_booking_confirmation.delay(str(booking.id))
        except Exception:
            pass  # never fail the booking because of notification failure

        return Response(
            BookingDetailSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class CustomerBookingDetailView(APIView):
    """GET /api/bookings/<id>/ — Full booking detail for the owning customer."""

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if not _assert_owns_booking(booking, request):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        return Response(BookingDetailSerializer(booking).data)


class CustomerBookingsByDateView(APIView):
    """
    GET /api/bookings/mine/?date=YYYY-MM-DD
    Returns customer's bookings on a given date.
    Used by Confirmation step to detect scheduling conflicts.
    """

    def get(self, request):
        bookings = Booking.objects.filter(
            customer_id=request.user.user_id,
            status__in=['pending', 'confirmed'],
        )

        date_str = request.query_params.get('date')
        if date_str:
            try:
                target = datetime.strptime(date_str, '%Y-%m-%d').date()
                bookings = bookings.filter(slot_date=target)
            except ValueError:
                return Response(
                    {'error': True, 'code': 'INVALID_DATE'}, status=400
                )

        return Response(BookingListSerializer(bookings, many=True).data)


class CustomerBookingStatusView(APIView):
    """
    GET /api/bookings/<id>/status/
    Lightweight poll endpoint used by the payment countdown timer (every 30s).
    Returns only id, status, payment_status, confirmation_token.
    """

    def get(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if not _assert_owns_booking(booking, request):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        return Response(BookingStatusSerializer(booking).data)


class CustomerBookingCancelView(APIView):
    """
    POST /api/bookings/<id>/cancel/
    Customer cancels their own booking.
    Only allowed for status in ('pending', 'confirmed').
    Triggers waitlist check async.
    """

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if not _assert_owns_booking(booking, request):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        if booking.status not in ('pending', 'confirmed'):
            return Response(
                {'error': True, 'code': 'INVALID_STATUS',
                 'message': f'Cannot cancel a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=['status', 'cancelled_at'])

        # Notify waitlist (stub — Person B extends)
        try:
            from notifications.tasks import check_waitlist_for_slot
            check_waitlist_for_slot.delay(
                str(booking.service_id),
                str(booking.slot_date),
                str(booking.slot_start),
            )
        except Exception:
            pass

        return Response({
            'id': str(booking.id),
            'status': 'cancelled',
            'message': 'Your booking has been cancelled.',
        })


class CustomerBookingCancelByTokenView(APIView):
    """
    GET /api/bookings/cancel/<token>/
    Unauthenticated cancel via email link.
    Validates confirmation_token, cancels the booking.
    """
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            booking = Booking.objects.get(confirmation_token=token)
        except Booking.DoesNotExist:
            return Response(
                {'error': True, 'code': 'INVALID_TOKEN',
                 'message': 'Cancellation link is invalid or has already been used.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status == 'cancelled':
            return Response({
                'id': str(booking.id),
                'status': 'cancelled',
                'message': 'This booking was already cancelled.',
            })

        if booking.status in ('completed', 'no_show'):
            return Response(
                {'error': True, 'code': 'CANNOT_CANCEL',
                 'message': 'This appointment has already been completed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=['status', 'cancelled_at'])

        try:
            from notifications.tasks import check_waitlist_for_slot
            check_waitlist_for_slot.delay(
                str(booking.service_id),
                str(booking.slot_date),
                str(booking.slot_start),
            )
        except Exception:
            pass

        return Response({
            'id': str(booking.id),
            'status': 'cancelled',
            'message': 'Your appointment has been cancelled successfully.',
        })
