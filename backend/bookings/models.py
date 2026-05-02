"""
Booking models — managed=False, pointing to existing Supabase tables.
Person 2 owns: bookings, booking_answers, waitlist, payments.
Person 1's models (services, schedules etc.) are imported when needed.
"""
import uuid
from django.db import models


class UserProfile(models.Model):
    """Read-only reference to user_profiles table."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user_id = models.TextField(unique=True)
    role = models.TextField(default='customer')
    is_active = models.BooleanField(default=True)
    timezone = models.TextField(default='Asia/Kolkata')
    phone_number = models.TextField(null=True, blank=True)
    whatsapp_opted_in = models.BooleanField(default=False)
    google_calendar_connected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user_id} ({self.role})"


class CustomerProfile(models.Model):
    """Read-only reference — used for booking detail display."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user_id = models.TextField(unique=True)
    full_name = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.TextField(null=True, blank=True)
    city = models.TextField(null=True, blank=True)
    preferred_language = models.TextField(default='en')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'customer_profiles'

    def __str__(self):
        return self.full_name or self.user_id


class Service(models.Model):
    """Read-only reference — Person 1 owns this table's CRUD."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    organiser_id = models.TextField()
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    duration_minutes = models.IntegerField()
    appointment_type = models.TextField(default='user')
    location = models.TextField(null=True, blank=True)
    venue_address = models.TextField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    manual_confirmation = models.BooleanField(default=False)
    max_capacity = models.IntegerField(null=True, blank=True)
    advance_payment_required = models.BooleanField(default=False)
    timezone = models.TextField(default='Asia/Kolkata')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'services'

    def __str__(self):
        return self.title


class Resource(models.Model):
    """Read-only reference to resources table."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    name = models.TextField()
    resource_type = models.TextField(default='user')
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'resources'

    def __str__(self):
        return self.name


class Booking(models.Model):
    """Main bookings table — Person 2 reads + updates status."""
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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    customer_id = models.TextField()
    resource_id = models.UUIDField(null=True, blank=True)
    slot_date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    status = models.TextField(choices=STATUS_CHOICES, default='pending')
    capacity_booked = models.IntegerField(default=1)
    payment_status = models.TextField(default='unpaid')
    booking_channel = models.TextField(choices=CHANNEL_CHOICES, default='web')
    notes = models.TextField(null=True, blank=True)
    confirmation_token = models.TextField(unique=True, null=True)
    google_calendar_event_id = models.TextField(null=True, blank=True)
    no_show_risk_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'bookings'
        ordering = ['slot_date', 'slot_start']

    def __str__(self):
        return f"Booking {self.confirmation_token} - {self.status}"

    @property
    def service(self):
        try:
            return Service.objects.get(id=self.service_id)
        except Service.DoesNotExist:
            return None

    @property
    def customer_profile(self):
        try:
            return CustomerProfile.objects.get(user_id=self.customer_id)
        except CustomerProfile.DoesNotExist:
            return None

    @property
    def resource(self):
        if not self.resource_id:
            return None
        try:
            return Resource.objects.get(id=self.resource_id)
        except Resource.DoesNotExist:
            return None


class BookingAnswer(models.Model):
    """Intake form answers for a booking."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    question_id = models.UUIDField()
    answer_text = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'booking_answers'

    def __str__(self):
        return f"Answer for booking {self.booking_id}"


class ServiceQuestion(models.Model):
    """Read-only — needed to display question text alongside answers."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    question_text = models.TextField()
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    question_type = models.TextField(default='text')

    class Meta:
        managed = False
        db_table = 'service_questions'
        ordering = ['display_order']


class Waitlist(models.Model):
    """Waitlist entries for full slots."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    resource_id = models.UUIDField(null=True, blank=True)
    slot_date = models.DateField()
    slot_start = models.TimeField()
    customer_id = models.TextField()
    notify_token = models.TextField(unique=True, null=True)
    notify_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'waitlist'
        ordering = ['created_at']


class Payment(models.Model):
    """Payment records for paid bookings."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.TextField(default='INR')
    payment_method = models.TextField(null=True, blank=True)
    payment_status = models.TextField(default='pending_payment')
    gateway_reference = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'payments'


class NoShowModelFeature(models.Model):
    """ML training data table — Person 2 writes predictions here."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    lead_time_hours = models.FloatField()
    day_of_week = models.SmallIntegerField()
    time_of_day_bucket = models.TextField()
    customer_booking_count = models.IntegerField(default=0)
    customer_cancellation_rate = models.FloatField(default=0)
    customer_no_show_rate = models.FloatField(default=0)
    service_cancellation_rate = models.FloatField(default=0)
    booking_channel = models.TextField(default='web')
    payment_status = models.TextField(default='unpaid')
    outcome = models.SmallIntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'no_show_model_features'
