"""
Payments Customer views — A2 Step 5 Mock Payment.

POST  /api/payments/<booking_id>/          Initiate + process payment
GET   /api/payments/<booking_id>/status/   Poll payment state
"""
import uuid
import time
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status

from .models import Payment, Booking, Service
from .serializers import PaymentInitiateSerializer, PaymentStatusSerializer


def _luhn_check(card_number: str) -> bool:
    """Standard Luhn algorithm for card number validation."""
    digits = [int(d) for d in card_number.replace(' ', '') if d.isdigit()]
    if len(digits) < 13:
        return False
    checksum = 0
    for i, digit in enumerate(reversed(digits)):
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def _validate_expiry(expiry: str) -> bool:
    """Validates MM/YY expiry — card must not be expired."""
    try:
        month, year = expiry.strip().split('/')
        month, year = int(month), int(year) + 2000
        now = timezone.now()
        return (year > now.year) or (year == now.year and month >= now.month)
    except Exception:
        return False


class PaymentInitiateView(APIView):
    """
    POST /api/payments/<booking_id>/

    Mock payment flow:
      1. Validate booking ownership + payment eligibility
      2. Validate payment details (Luhn for card, UPI format)
      3. Create payments row (pending_payment)
      4. Simulate processing delay (1.5s)
      5. Mark payment paid + confirm booking (atomic)
      6. Fire confirmation notification
    """

    def post(self, request, booking_id):
        # ── Load booking ─────────────────────────────────────────────────────
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if booking.customer_id != request.user.user_id:
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        if booking.payment_status == 'paid':
            return Response(
                {'error': True, 'code': 'ALREADY_PAID',
                 'message': 'This booking has already been paid.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        if booking.status == 'cancelled':
            return Response(
                {'error': True, 'code': 'BOOKING_CANCELLED',
                 'message': 'Cannot pay for a cancelled booking.'},
                status=http_status.HTTP_400_BAD_REQUEST,
            )

        # ── Load service amount ──────────────────────────────────────────────
        try:
            service = Service.objects.get(id=booking.service_id)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'SERVICE_NOT_FOUND'}, status=404)

        # ── Validate payment details ─────────────────────────────────────────
        serializer = PaymentInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        method = data['payment_method']

        # Card-specific validation
        if method == 'card':
            raw_number = data.get('card_number', '').replace(' ', '')
            if not _luhn_check(raw_number):
                return Response(
                    {'error': True, 'code': 'INVALID_CARD_NUMBER',
                     'message': 'Card number is invalid.'},
                    status=http_status.HTTP_400_BAD_REQUEST,
                )
            if not _validate_expiry(data.get('card_expiry', '')):
                return Response(
                    {'error': True, 'code': 'CARD_EXPIRED',
                     'message': 'Card has expired or expiry date is invalid.'},
                    status=http_status.HTTP_400_BAD_REQUEST,
                )

        # ── Create payment record ────────────────────────────────────────────
        payment = Payment.objects.create(
            booking_id=booking.id,
            amount=service.payment_amount,
            currency='INR',
            payment_method=method,
            payment_status='pending_payment',
            gateway_reference=f'MOCK-{uuid.uuid4().hex[:12].upper()}',
        )

        # ── Simulate 1.5s gateway processing ────────────────────────────────
        time.sleep(1.5)

        # ── Atomic: mark paid + confirm booking ──────────────────────────────
        with transaction.atomic():
            payment.payment_status = 'paid'
            payment.save(update_fields=['payment_status'])

            booking.payment_status = 'paid'
            booking.status = 'confirmed'
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=['payment_status', 'status', 'confirmed_at'])

        # ── Notify ───────────────────────────────────────────────────────────
        try:
            from notifications.tasks import send_booking_confirmation
            send_booking_confirmation.delay(str(booking.id))
        except Exception:
            pass

        return Response({
            'payment_id': str(payment.id),
            'booking_id': str(booking.id),
            'payment_status': 'paid',
            'booking_status': 'confirmed',
            'gateway_reference': payment.gateway_reference,
            'amount': str(payment.amount),
            'currency': payment.currency,
            'confirmation_token': booking.confirmation_token,
        })


class PaymentStatusView(APIView):
    """
    GET /api/payments/<booking_id>/status/
    Lightweight poll. Returns combined payment + booking status.
    Used by the 15-min countdown timer on Step 5.
    """

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if booking.customer_id != request.user.user_id:
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        serializer = PaymentStatusSerializer(data={
            'booking_id': str(booking.id),
            'payment_status': booking.payment_status,
            'booking_status': booking.status,
            'confirmation_token': booking.confirmation_token,
        })
        serializer.is_valid()
        return Response(serializer.data)
