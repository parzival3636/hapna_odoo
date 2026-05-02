import uuid
from django.db import models
from django.contrib.auth import get_user_model
from users.models import Organization

User = get_user_model()

class Service(models.Model):
    APPROVAL_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=30)
    appointment_type = models.CharField(max_length=50, default='user')
    location = models.CharField(max_length=255, null=True, blank=True)
    venue_address = models.TextField(null=True, blank=True)
    
    # Booking Rules
    is_published = models.BooleanField(default=False)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='pending')
    manual_confirmation = models.BooleanField(default=False)
    max_capacity = models.IntegerField(null=True, blank=True)
    advance_payment_required = models.BooleanField(default=False)
    google_calendar_block_enabled = models.BooleanField(default=False)
    resource_assignment = models.CharField(max_length=20, default='manual') # manual or auto
    
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Schedule(models.Model):
    SCHEDULE_TYPES = [
        ('weekly', 'Weekly'),
        ('flexible', 'Flexible'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='schedules')
    schedule_type = models.CharField(max_length=20, choices=SCHEDULE_TYPES, default='weekly')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')

class WeeklySlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='weekly_slots')
    day_of_week = models.IntegerField() # 0 = Monday, 6 = Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()

class FlexibleSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='flexible_slots')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

class ServiceQuestion(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('single_line', 'Single line text'),
        ('multi_line', 'Multi-line text'),
        ('phone', 'Phone Number'),
        ('radio', 'Radio (One Answer)'),
        ('checkbox', 'Checkboxes (Multiple Answers)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPE_CHOICES, default='single_line')
    options = models.JSONField(null=True, blank=True)  # for radio / checkbox types

class Resource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='resources')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_resources')
    name = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=50, default='user')
    google_calendar_id = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
