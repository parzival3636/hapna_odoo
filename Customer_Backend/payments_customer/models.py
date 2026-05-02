"""
Payments Customer models — managed=False.
"""
import uuid
from django.db import models


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('paypal', 'PayPal'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.TextField(default='INR')
    payment_method = models.TextField(choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    payment_status = models.TextField(choices=PAYMENT_STATUS_CHOICES, default='pending_payment')
    gateway_reference = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'payments'

    def __str__(self):
        return f"Payment {self.id} ({self.payment_status})"


class Booking(models.Model):
    """Read/write reference — needed to update payment_status + booking status."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    customer_id = models.TextField()
    slot_date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    status = models.TextField(default='pending')
    payment_status = models.TextField(default='unpaid')
    confirmation_token = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'bookings'


class Service(models.Model):
    """Read-only — to check advance_payment_required and payment_amount."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    advance_payment_required = models.BooleanField(default=False)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    title = models.TextField()

    class Meta:
        managed = False
        db_table = 'services'
