"""
Waitlist models — managed=False.
Maps to bookings_waitlist table in the database.
"""
import uuid
from django.db import models


class Waitlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    customer_id = models.UUIDField()
    resource_id = models.UUIDField(null=True, blank=True)
    slot_date = models.DateField()
    slot_start = models.TimeField()
    notify_token = models.TextField(unique=True, null=True, blank=True)
    notify_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'bookings_waitlist'
        ordering = ['created_at']

    def __str__(self):
        return f"Waitlist {self.id} for service {self.service_id}"
