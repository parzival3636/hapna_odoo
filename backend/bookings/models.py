import uuid
from django.db import models
from django.contrib.auth import get_user_model
from services.models import Service, Resource, ServiceQuestion

User = get_user_model()

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('whatsapp', 'WhatsApp'),
        ('voice', 'Voice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_bookings')
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bookings')
    
    slot_date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    capacity_booked = models.IntegerField(default=1)
    payment_status = models.CharField(max_length=20, default='unpaid')
    booking_channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    
    notes = models.TextField(null=True, blank=True)
    confirmation_token = models.CharField(max_length=100, unique=True, null=True)
    google_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    no_show_risk_score = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['slot_date', 'slot_start']

    def __str__(self):
        return f"Booking {self.confirmation_token} - {self.status}"

class BookingAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ServiceQuestion, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Answer for booking {self.booking_id}"

class Waitlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='waitlist')
    resource = models.ForeignKey(Resource, on_delete=models.SET_NULL, null=True, blank=True, related_name='waitlist')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_waitlist')
    
    slot_date = models.DateField()
    slot_start = models.TimeField()
    
    notify_token = models.CharField(max_length=100, unique=True, null=True)
    notify_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    payment_status = models.CharField(max_length=50, default='pending_payment')
    gateway_reference = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class NoShowModelFeature(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='ml_features')
    lead_time_hours = models.FloatField()
    day_of_week = models.SmallIntegerField()
    time_of_day_bucket = models.CharField(max_length=20)
    customer_booking_count = models.IntegerField(default=0)
    customer_cancellation_rate = models.FloatField(default=0)
    customer_no_show_rate = models.FloatField(default=0)
    service_cancellation_rate = models.FloatField(default=0)
    booking_channel = models.CharField(max_length=20, default='web')
    payment_status = models.CharField(max_length=20, default='unpaid')
    outcome = models.SmallIntegerField(null=True, blank=True)
