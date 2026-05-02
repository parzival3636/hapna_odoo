"""
Celery tasks for the slots app.

cleanup_expired_holds: runs every 60 seconds (configured in settings.CELERY_BEAT_SCHEDULE)
Deletes all slot_holds rows where expires_at < now().
"""
from celery import shared_task
from django.utils import timezone


@shared_task(name='slots.tasks.cleanup_expired_holds')
def cleanup_expired_holds():
    """
    Purge expired holds so their capacity is freed immediately for other users.
    Returns count of deleted rows for logging.
    """
    from .models import SlotHold
    now = timezone.now()
    expired_qs = SlotHold.objects.filter(expires_at__lt=now)
    count, _ = expired_qs.delete()
    return {'deleted_holds': count}
