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


def _send_email(to, subject, html_body):
    """Send email via Django SMTP."""
    from django.core.mail import EmailMultiAlternatives
    import os

    from_email = os.getenv('EMAIL_HOST_USER', 'rohanlangar31@gmail.com')
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body="Please view this email in an HTML-compatible client.",
        from_email=from_email,
        to=[to],
    )
    msg.attach_alternative(html_body, "text/html")

    try:
        msg.send()
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Email send failed to {to}: {e}")
        return False

@shared_task(name='notifications.tasks.send_booking_confirmation', bind=True, max_retries=3)
def send_booking_confirmation(self, booking_id: str):
    """
    Send confirmation email for a newly created / just-paid booking.
    """
    logger.info(f'[notifications] send_booking_confirmation → booking_id={booking_id}')
    try:
        from bookings_customer.models import Booking, Service, UserProfile
        booking = Booking.objects.get(id=booking_id)
        service = Service.objects.filter(id=booking.service_id).first()
        customer = UserProfile.objects.filter(id=booking.customer_id).first()
        
        intro_html = f"<p><em>{service.intro_message}</em></p>" if service and getattr(service, 'intro_message', None) else ""
        conf_html = f"<p><strong>{service.confirmation_message}</strong></p>" if service and getattr(service, 'confirmation_message', None) else ""

        html_body = f"""
        {intro_html}
        <h2>Booking Confirmed</h2>
        <p>Your appointment for <strong>{service.title if service else 'your service'}</strong> is confirmed.</p>
        <p><strong>Date:</strong> {booking.slot_date}</p>
        <p><strong>Time:</strong> {booking.slot_start} - {booking.slot_end}</p>
        <p><strong>Location:</strong> {service.location or 'Online' if service and hasattr(service, 'location') else 'TBD'}</p>
        <p>Reference: {booking.confirmation_token}</p>
        {conf_html}
        """

        subject = f"Booking Confirmed — {service.title if service else 'Appointment'}"
        if customer and customer.email:
            success = _send_email(customer.email, subject, html_body)
            return {'sent': success, 'booking_id': booking_id}
        else:
            return {'sent': False, 'booking_id': booking_id, 'reason': 'no_email'}
    except Exception as e:
        logger.error(f"send_booking_confirmation failed: {e}")
        self.retry(exc=e)


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
