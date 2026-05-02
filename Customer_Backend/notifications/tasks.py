"""
Async notification tasks for the Customer Backend.

These are Celery task stubs that:
  - Log the action to confirm the task pipeline works
  - Provide the correct task signatures so Person B can extend them
    (e.g. wire up Resend emails, WhatsApp, etc.)

Tasks defined here:
  send_booking_confirmation(booking_id)     — fired on booking creation / payment
  send_booking_cancellation(booking_id)     — fired on customer cancel
  check_waitlist_for_slot(service_id, slot_date, slot_start)  — fired on slot freed
"""
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name='notifications.tasks.send_booking_confirmation', bind=True, max_retries=3)
def send_booking_confirmation(self, booking_id: str):
    """
    Send confirmation email/WhatsApp for a newly created / just-paid booking.

    TODO (Person B): implement real Resend email here.
    """
    logger.info(f'[notifications] send_booking_confirmation → booking_id={booking_id}')
    # Stub: just log. Replace with:
    #   booking = Booking.objects.get(id=booking_id)
    #   resend.Emails.send({ "to": customer_email, ... })
    return {'sent': False, 'booking_id': booking_id, 'reason': 'stub'}


@shared_task(name='notifications.tasks.send_booking_cancellation', bind=True, max_retries=3)
def send_booking_cancellation(self, booking_id: str):
    """
    Send cancellation confirmation to the customer.

    TODO (Person B): implement real notification here.
    """
    logger.info(f'[notifications] send_booking_cancellation → booking_id={booking_id}')
    return {'sent': False, 'booking_id': booking_id, 'reason': 'stub'}


@shared_task(name='notifications.tasks.check_waitlist_for_slot', bind=True, max_retries=3)
def check_waitlist_for_slot(self, service_id: str, slot_date: str, slot_start: str):
    """
    When a slot is freed (cancel / reject), check if anyone is on the waitlist
    for this service+date+time and send them a notification with a claim link.

    TODO (Person B): implement waitlist notification logic here.
    """
    logger.info(
        f'[notifications] check_waitlist_for_slot → '
        f'service={service_id} date={slot_date} start={slot_start}'
    )
    return {
        'notified': False,
        'service_id': service_id,
        'slot_date': slot_date,
        'slot_start': slot_start,
        'reason': 'stub',
    }
