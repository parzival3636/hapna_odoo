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

import stripe
from django.conf import settings
from .models import Payment, Booking, Service

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeCheckoutView(APIView):
    """
    POST /api/payments/<booking_id>/checkout-session/
    Create a Stripe Hosted Checkout Session.
    """
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if str(booking.customer_id) != str(request.user.user_id):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        if booking.payment_status == 'paid':
            return Response({'error': True, 'code': 'ALREADY_PAID'}, status=400)

        try:
            service = Service.objects.get(id=booking.service_id)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'SERVICE_NOT_FOUND'}, status=404)

        amount = service.booking_fee or 0
        
        # Success and Cancel URLs
        # In a real app, these should be configurable. 
        # For now, we point back to the booking page with query params.
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        success_url = f"{frontend_url}/book/{booking.service_id}?success=true&booking_id={booking.id}&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/book/{booking.service_id}?cancelled=true"

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': f"Booking: {service.title}",
                            'description': f"Appointment booking fee",
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={'booking_id': str(booking.id)}
            )
            
            # Record the session ID in the gateway_reference
            Payment.objects.update_or_create(
                booking_id=booking.id,
                defaults={
                    'amount': amount,
                    'currency': 'INR',
                    'payment_method': 'stripe_checkout',
                    'payment_status': 'pending_payment',
                    'gateway_reference': session.id
                }
            )
            
            return Response({'url': session.url})
        except Exception as e:
            return Response({'error': True, 'message': str(e)}, status=500)


class PaymentConfirmView(APIView):
    """
    POST /api/payments/<booking_id>/confirm/
    Verify with Stripe that the checkout session succeeded.
    """
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if str(booking.customer_id) != str(request.user.user_id):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        payment = Payment.objects.filter(booking_id=booking.id, payment_status='pending_payment').first()
        if not payment or not payment.gateway_reference:
            return Response({'error': True, 'code': 'NO_PENDING_PAYMENT'}, status=400)

        try:
            # Check session status
            session = stripe.checkout.Session.retrieve(payment.gateway_reference)
            if session.payment_status == 'paid':
                with transaction.atomic():
                    payment.payment_status = 'paid'
                    payment.save(update_fields=['payment_status'])

                    booking.payment_status = 'paid'
                    booking.status = 'confirmed'
                    booking.confirmed_at = timezone.now()
                    booking.save(update_fields=['payment_status', 'status', 'confirmed_at'])

                try:
                    from notifications.tasks import send_booking_confirmation
                    send_booking_confirmation.delay(str(booking.id))
                except Exception:
                    pass

                return Response({'success': True})
            else:
                return Response({'error': True, 'code': 'PAYMENT_NOT_PAID', 'status': session.payment_status}, status=400)
        except Exception as e:
            return Response({'error': True, 'message': str(e)}, status=500)


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

        if str(booking.customer_id) != str(request.user.user_id):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        serializer = PaymentStatusSerializer(data={
            'booking_id': str(booking.id),
            'payment_status': booking.payment_status,
            'booking_status': booking.status,
            'confirmation_token': booking.confirmation_token,
        })
        serializer.is_valid()
        return Response(serializer.data)
