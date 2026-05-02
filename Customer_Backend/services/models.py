"""
Services app — A1 Service Browsing.
Models are managed=False (Supabase owns the tables).
"""
import uuid
from django.db import models


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    organization_id = models.TextField()
    title = models.TextField()
    description = models.TextField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=30)
    appointment_type = models.TextField(default='user')  # 'user' | 'resource'
    location = models.TextField(null=True, blank=True)
    venue_address = models.TextField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    approval_status = models.TextField(default='pending')
    advance_payment_required = models.BooleanField(default=False)
    manual_confirmation = models.BooleanField(default=False)
    manual_confirmation_percent = models.IntegerField(null=True, blank=True)
    max_capacity = models.IntegerField(null=True, blank=True)
    booking_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cancellation_hours = models.IntegerField(default=1)
    resource_assignment = models.TextField(default='manual')
    google_calendar_block_enabled = models.BooleanField(default=False)
    timezone = models.TextField(default='Asia/Kolkata')
    intro_message = models.TextField(null=True, blank=True)
    confirmation_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'services_service'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ServiceQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    question_text = models.TextField()
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    question_type = models.TextField(default='text')  # 'text' | 'select' | 'boolean'
    options = models.JSONField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'services_servicequestion'
        ordering = ['display_order']

    def __str__(self):
        return self.question_text


class Resource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    name = models.TextField()
    resource_type = models.TextField(default='user')  # 'user' | 'room' | 'equipment'
    google_calendar_id = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'services_resource'

    def __str__(self):
        return self.name


class Schedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    schedule_type = models.TextField(default='weekly')  # 'weekly' | 'flexible'
    timezone = models.TextField(default='Asia/Kolkata')

    class Meta:
        managed = False
        db_table = 'services_schedule'

    def __str__(self):
        return f"Schedule({self.schedule_type}) for service {self.service_id}"


class WeeklySlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    schedule_id = models.UUIDField()
    day_of_week = models.SmallIntegerField()  # 0=Sun ... 6=Sat
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        managed = False
        db_table = 'services_weeklyslot'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"Day {self.day_of_week} {self.start_time}–{self.end_time}"


class FlexibleSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    schedule_id = models.UUIDField()
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        managed = False
        db_table = 'services_flexibleslot'
        ordering = ['start_date', 'start_time']

    def __str__(self):
        return f"{self.start_date} to {self.end_date} {self.start_time}–{self.end_time}"
