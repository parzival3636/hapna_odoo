"""
Profile Autofill models — managed=False.
"""
import uuid
from django.db import models


class CustomerProfile(models.Model):
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
        managed = False
        db_table = 'customer_profiles'

    def to_field_map(self) -> dict:
        """
        Returns a flat dict of profile field name → value.
        Used to match service_questions.maps_to_profile_field.
        """
        return {
            'full_name': self.full_name,
            'date_of_birth': str(self.date_of_birth) if self.date_of_birth else None,
            'gender': self.gender,
            'address': self.address,
            'city': self.city,
            'pincode': self.pincode,
            'preferred_language': self.preferred_language,
            'emergency_contact': self.emergency_contact,
            'medical_notes': self.medical_notes,
        }


class ServiceQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    question_text = models.TextField()
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    question_type = models.TextField(default='text')
    options = models.JSONField(null=True, blank=True)
    maps_to_profile_field = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'service_questions'
        ordering = ['display_order']


class BookingAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_id = models.UUIDField()
    question_id = models.UUIDField()
    answer_text = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'booking_answers'
