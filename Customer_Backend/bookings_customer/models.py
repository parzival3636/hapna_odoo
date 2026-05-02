"""
Bookings Customer models — managed=False, reads/writes existing Supabase tables.
"""
import uuid
from django.db import models


class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user_id = models.TextField(unique=True)
    role = models.TextField(default='customer')
    is_active = models.BooleanField(default=True)
    timezone = models.TextField(default='Asia/Kolkata')
    phone_number = models.TextField(null=True, blank=True)
    full_name = models.TextField(null=True, blank=True)
    avatar_url = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user_id} ({self.role})"


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    organiser_id = models.TextField()
    title = models.TextField()
    duration_minutes = models.IntegerField()
    appointment_type = models.TextField(default='user')
    manual_confirmation = models.BooleanField(default=False)
    advance_payment_required = models.BooleanField(default=False)
    max_capacity = models.IntegerField(null=True, blank=True)
    timezone = models.TextField(default='Asia/Kolkata')
    confirmation_message = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'services'

    def __str__(self):
        return self.title


class ServiceQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    question_text = models.TextField()
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    question_type = models.TextField(default='text')
    options = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'service_questions'
        ordering = ['display_order']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('pending_payment', 'Pending Payment'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('whatsapp', 'WhatsApp'),
        ('voice', 'Voice'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    customer_id = models.TextField()
    resource_id = models.UUIDField(null=True, blank=True)
    slot_date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    status = models.TextField(choices=STATUS_CHOICES, default='pending')
    capacity_booked = models.IntegerField(default=1)
    payment_status = models.TextField(choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    booking_channel = models.TextField(choices=CHANNEL_CHOICES, default='web')
    notes = models.TextField(null=True, blank=True)
    confirmation_token = models.TextField(unique=True, null=True, blank=True)
    google_calendar_event_id = models.TextField(null=True, blank=True)
    no_show_risk_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    assigned_user_id = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.confirmation_token} ({self.status})"


class BookingAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    question_id = models.UUIDField()
    answer_text = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'booking_answers'

    def __str__(self):
        return f"Answer {self.id} for booking {self.booking_id}"
