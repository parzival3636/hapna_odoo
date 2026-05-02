"""
Profile Autofill models — managed=False.

Maps to the actual database tables as defined in the schema (backup.txt).
users_user columns: id, password, last_login, is_superuser, username,
  first_name, last_name, email, is_staff, is_active, date_joined,
  role, phone_number, timezone, whatsapp_opted_in,
  google_calendar_connected, organization_id
"""
import uuid
from django.db import models


class UserProfile(models.Model):
    """
    Maps to users_user table.
    Only the columns that actually exist in the DB schema are defined here.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.TextField(unique=True)
    first_name = models.TextField(default='')
    last_name = models.TextField(default='')
    email = models.TextField(default='')
    role = models.TextField(default='customer')
    phone_number = models.TextField(null=True, blank=True)
    timezone = models.TextField(default='Asia/Kolkata')
    whatsapp_opted_in = models.BooleanField(default=False)
    google_calendar_connected = models.BooleanField(default=False)
    organization_id = models.UUIDField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'users_user'

    def get_full_name(self):
        """Combine first_name + last_name."""
        parts = [self.first_name or '', self.last_name or '']
        return ' '.join(p for p in parts if p).strip()

    def to_field_map(self) -> dict:
        """
        Returns a flat dict of profile field name → value.
        Used to match service_questions autofill.
        """
        return {
            'full_name': self.get_full_name() or None,
            'first_name': self.first_name or None,
            'last_name': self.last_name or None,
            'email': self.email or None,
            'phone_number': self.phone_number,
            'timezone': self.timezone,
        }


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
        db_table = 'services_servicequestion'
        ordering = ['display_order']


class BookingAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    question_id = models.UUIDField()
    answer_text = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'bookings_bookinganswer'


class CustomerProfile(models.Model):
    """
    Maps to customer_profiles table defined in 001_schema.sql.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user_id = models.TextField(unique=True)
    full_name = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.TextField(null=True, blank=True)
    pincode = models.TextField(null=True, blank=True)
    preferred_language = models.TextField(default='en')
    emergency_contact = models.TextField(null=True, blank=True)
    medical_notes = models.TextField(null=True, blank=True)
    custom_fields = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customer_profiles'
