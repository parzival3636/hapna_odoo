import uuid
from django.db import models

class WhatsappSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    phone_number = models.TextField()
    session_state = models.JSONField(default=dict)
    last_active = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'whatsapp_sessions'
        indexes = [
            models.Index(fields=['phone_number']),
        ]

class VoiceSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    call_sid = models.TextField(unique=True)
    phone_number = models.TextField()
    language = models.TextField(default='en')
    session_state = models.JSONField(default=dict)
    current_step = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'voice_sessions'
        indexes = [
            models.Index(fields=['call_sid']),
        ]
