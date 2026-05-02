import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Organization(models.Model):
    """An organization created by an Admin."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Custom User model with role and organization."""
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('pending_organiser', 'Pending Organiser'),
        ('organiser', 'Organiser'),
        ('admin', 'Admin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    
    # Optional fields from previous schema
    whatsapp_opted_in = models.BooleanField(default=False)
    google_calendar_connected = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class GoogleCredential(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_creds')
    token = models.TextField()
    refresh_token = models.TextField()
    token_uri = models.TextField()
    client_id = models.TextField()
    client_secret = models.TextField()
    scopes = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Google Credentials for {self.user.username}"
