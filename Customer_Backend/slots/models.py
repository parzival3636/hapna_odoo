"""
SlotHold model — soft reservation preventing double-booking during checkout.
Maps to the slot_holds table created by 002_slot_holds_migration.sql.
"""
import uuid
from django.db import models


class SlotHold(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    service_id = models.UUIDField()
    resource_id = models.UUIDField(null=True, blank=True)
    slot_date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    session_token = models.TextField()
    capacity_held = models.IntegerField(default=1)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'slot_holds'
        ordering = ['slot_date', 'slot_start']

    def __str__(self):
        return (
            f"Hold {self.id} | service={self.service_id} "
            f"| {self.slot_date} {self.slot_start}–{self.slot_end} "
            f"| expires={self.expires_at}"
        )

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expires_at <= timezone.now()
