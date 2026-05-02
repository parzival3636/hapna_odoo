"""
Celery tasks — Person 2 owns all notification + ML tasks.
8 event-triggered tasks + 4 periodic tasks + waitlist chain.
"""
import os
import uuid
import logging
from datetime import datetime, timedelta
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


# ============================================================
# EMAIL HELPERS
# ============================================================

def _send_email(to, subject, html_body, ics_bytes=None):
    """Send email via Resend API."""
    import resend
    resend.api_key = os.getenv('RESEND_API_KEY')

    params = {
        'from': 'Hapna Bookings <bookings@hapna.app>',
        'to': [to],
        'subject': subject,
        'html': html_body,
    }

    if ics_bytes:
        import base64
        params['attachments'] = [{
            'filename': 'appointment.ics',
            'content': base64.b64encode(ics_bytes).decode(),
            'type': 'text/calendar',
        }]

    try:
        resend.Emails.send(params)
        logger.info(f"Email sent to {to}: {subject}")
    except Exception as e:
        logger.error(f"Email send failed to {to}: {e}")
        raise


def _get_booking(booking_id):
    """Fetch booking with related data."""
    from bookings.models import Booking
    return Booking.objects.get(id=booking_id)


def _generate_ics(booking):
    """Generate ICS calendar attachment bytes."""
    try:
        from notifications.ics_generator import generate_ics
        return generate_ics(booking)
    except Exception as e:
        logger.warning(f"ICS generation failed: {e}")
        return None


def _generate_ai_email_body(booking):
    """Call Grok to generate a personalized email body. Falls back to template."""
    try:
        from notifications.grok_emails import generate_email_body
        return generate_email_body(booking)
    except Exception as e:
        logger.warning(f"Grok email generation failed, using template: {e}")
        service = booking.service
        meeting_html = ""
        if booking.meeting_link:
            provider = "Jitsi Meet" if booking.meeting_provider == 'jitsi' else "Zoom"
            meeting_html = f"""
            <p><strong>📹 {provider} Meeting:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>
            <p><strong>Meeting ID:</strong> {booking.meeting_id}</p>
            """

        return f"""
        <h2>Booking Confirmed</h2>
        <p>Your appointment for <strong>{service.title if service else 'your service'}</strong> is confirmed.</p>
        <p><strong>Date:</strong> {booking.slot_date}</p>
        <p><strong>Time:</strong> {booking.slot_start} - {booking.slot_end}</p>
        <p><strong>Location:</strong> {service.location or 'Online' if service else 'TBD'}</p>
        {meeting_html}
        <p>Reference: {booking.confirmation_token}</p>
        """


# ============================================================
# EVENT-TRIGGERED TASKS
# ============================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_booking_confirmation(self, booking_id):
    """Auto-confirmed booking → AI-generated email + ICS to customer."""
    try:
        booking = _get_booking(booking_id)
        body = _generate_ai_email_body(booking)
        ics = _generate_ics(booking)
        service = booking.service
        _send_email(
            to=booking.customer.email,
            subject=f"Booking Confirmed — {service.title if service else 'Appointment'}",
            html_body=body,
            ics_bytes=ics,
        )
    except Exception as e:
        logger.error(f"send_booking_confirmation failed: {e}")
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_booking_reserved(self, booking_id):
    """Manual-confirm booking → pending approval email to customer."""
    try:
        booking = _get_booking(booking_id)
        service = booking.service
        meeting_html = ""
        if booking.meeting_link:
            provider = "Jitsi Meet" if booking.meeting_provider == "jitsi" else "Zoom"
            meeting_html = f"""
            <p><strong>📹 {provider} Meeting:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>
            <p><strong>Meeting ID:</strong> {booking.meeting_id}</p>
            """

        body = f"""
        <h2>Booking Request Received</h2>
        <p>Your booking request for <strong>{service.title if service else 'Appointment'}</strong> has been received.</p>
        <p><strong>Date:</strong> {booking.slot_date}</p>
        <p><strong>Time:</strong> {booking.slot_start} - {booking.slot_end}</p>
        {meeting_html}
        <p>The organiser will review and confirm your appointment. You'll receive another email once approved.</p>
        <p>Reference: {booking.confirmation_token}</p>
        """
        _send_email(
            to=booking.customer.email,
            subject=f"Booking Request — {service.title if service else 'Appointment'}",
            html_body=body,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_organiser_new_booking(self, booking_id):
    """Notify organiser about a new booking."""
    try:
        booking = _get_booking(booking_id)
        service = booking.service
        if not service:
            return

        meeting_html = ""
        if booking.meeting_link:
            provider = "Jitsi Meet" if booking.meeting_provider == "jitsi" else "Zoom"
            meeting_html = f"""
            <p><strong>📹 {provider} Meeting:</strong> <a href="{booking.meeting_link}">{booking.meeting_link}</a></p>
            <p><strong>Meeting ID:</strong> {booking.meeting_id}</p>
            """

        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        body = f"""
        <h2>New Booking Received</h2>
        <p><strong>Service:</strong> {service.title}</p>
        <p><strong>Customer:</strong> {booking.customer.email}</p>
        <p><strong>Date:</strong> {booking.slot_date} at {booking.slot_start}</p>
        {meeting_html}
        <p><strong>Status:</strong> {booking.status}</p>
        <p>
            <a href="{frontend_url}/dashboard/bookings">View in Dashboard</a>
        </p>
        """
        organiser = service.organization.members.filter(role='organiser').first()
        if organiser and organiser.email:
            _send_email(
                to=organiser.email,
                subject=f"New Booking — {service.title}",
                html_body=body,
            )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_booking_approved(self, booking_id):
    """Organiser confirmed a pending booking → approval email + ICS."""
    try:
        booking = _get_booking(booking_id)
        body = _generate_ai_email_body(booking)
        ics = _generate_ics(booking)
        service = booking.service
        _send_email(
            to=booking.customer.email,
            subject=f"Booking Approved — {service.title if service else 'Appointment'}",
            html_body=body,
            ics_bytes=ics,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_booking_rejected(self, booking_id, reason=''):
    """Organiser rejected a booking → rejection email with reason."""
    try:
        booking = _get_booking(booking_id)
        service = booking.service
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        body = f"""
        <h2>Booking Not Approved</h2>
        <p>Unfortunately, your booking for <strong>{service.title if service else 'Appointment'}</strong>
           on {booking.slot_date} at {booking.slot_start} was not approved.</p>
        {f'<p><strong>Reason:</strong> {reason}</p>' if reason else ''}
        <p>You can book a different time slot:</p>
        <p><a href="{frontend_url}/services/{service.id if service else ''}">Book Again</a></p>
        """
        _send_email(
            to=booking.customer.email,
            subject=f"Booking Not Approved — {service.title if service else 'Appointment'}",
            html_body=body,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_cancellation(self, booking_id):
    """Booking cancelled → confirmation email."""
    try:
        booking = _get_booking(booking_id)
        service = booking.service
        body = f"""
        <h2>Booking Cancelled</h2>
        <p>Your booking for <strong>{service.title if service else 'Appointment'}</strong>
           on {booking.slot_date} at {booking.slot_start} has been cancelled.</p>
        <p>Reference: {booking.confirmation_token}</p>
        """
        _send_email(
            to=booking.customer.email,
            subject=f"Booking Cancelled — {service.title if service else 'Appointment'}",
            html_body=body,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_waitlist_notification(self, waitlist_id):
    """Slot freed → notify first waitlisted customer with claim link."""
    try:
        from bookings.models import Waitlist
        entry = Waitlist.objects.get(id=waitlist_id)
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

        body = f"""
        <h2>A Slot Just Opened Up!</h2>
        <p>A slot on {entry.slot_date} at {entry.slot_start} is now available.</p>
        <p>You have 30 minutes to claim it:</p>
        <p><a href="{frontend_url}/book/claim/{entry.notify_token}"
              style="background:#22c55e;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">
              Claim This Slot
           </a></p>
        <p><small>This link expires in 30 minutes.</small></p>
        """
        _send_email(
            to=entry.customer.email,
            subject="A slot opened up — claim it now!",
            html_body=body,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def run_no_show_prediction(self, booking_id):
    """Run ML model on a booking and write the risk score."""
    try:
        booking = _get_booking(booking_id)
        from ai_engine.no_show_model import predict_no_show
        score = predict_no_show(booking)
        if score >= 0:
            booking.no_show_risk_score = score
            booking.save()
            logger.info(f"No-show prediction for {booking_id}: {score:.2f}")
    except Exception as e:
        logger.error(f"No-show prediction failed for {booking_id}: {e}")


# ============================================================
# WAITLIST CHAIN & RESOURCES
# ============================================================

@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_resource_assignment_notification(self, booking_id):
    """Notify assigned human resource about a booking."""
    try:
        booking = _get_booking(booking_id)
        if not booking.resource or not booking.resource.user or not booking.resource.user.email:
            return

        service = booking.service
        body = f"""
        <h2>New Appointment Assigned to You</h2>
        <p>You have been assigned to a new appointment.</p>
        <p><strong>Service:</strong> {service.title if service else 'Appointment'}</p>
        <p><strong>Date:</strong> {booking.slot_date}</p>
        <p><strong>Time:</strong> {booking.slot_start} - {booking.slot_end}</p>
        <p><strong>Customer:</strong> {booking.customer.get_full_name() or booking.customer.username}</p>
        """
        _send_email(
            to=booking.resource.user.email,
            subject=f"New Assignment — {service.title if service else 'Appointment'}",
            html_body=body,
        )
    except Exception as e:
        self.retry(exc=e)


@shared_task
def check_waitlist_for_slot(service_id, slot_date, slot_start):
    """After cancellation, find first waitlisted person and notify."""
    from bookings.models import Waitlist

    entry = Waitlist.objects.filter(
        service_id=service_id,
        slot_date=slot_date,
        slot_start=slot_start,
        notify_token__isnull=True,
    ).order_by('created_at').first()

    if not entry:
        return  # No one waiting

    # Generate claim token + expiry
    entry.notify_token = str(uuid.uuid4())
    entry.notify_expires_at = timezone.now() + timedelta(minutes=30)
    entry.save()

    # Send notification
    send_waitlist_notification.delay(str(entry.id))

    # Schedule expiry check in 30 min
    check_waitlist_expiry.apply_async(
        args=[str(entry.id)],
        countdown=1800,
    )


@shared_task
def check_waitlist_expiry(waitlist_id):
    """After 30 min, check if waitlist entry was claimed. If not, notify next."""
    from bookings.models import Waitlist, Booking

    try:
        entry = Waitlist.objects.get(id=waitlist_id)
    except Waitlist.DoesNotExist:
        return

    # Check if someone actually booked this slot
    booked = Booking.objects.filter(
        service_id=entry.service_id,
        slot_date=entry.slot_date,
        slot_start=entry.slot_start,
        customer=entry.customer,
        status__in=['pending', 'confirmed'],
    ).exists()

    if booked:
        entry.delete()  # Claimed successfully
        return

    # Not claimed — clear token and try next person
    entry.notify_token = None
    entry.notify_expires_at = None
    entry.save()

    # Notify next person in queue
    check_waitlist_for_slot.delay(
        str(entry.service_id), str(entry.slot_date), str(entry.slot_start),
    )


# ============================================================
# CELERY BEAT PERIODIC TASKS
# ============================================================

@shared_task
def expire_unpaid_bookings():
    """Every 5 min: Cancel bookings stuck in pending_payment > 15 min."""
    from bookings.models import Booking
    cutoff = timezone.now() - timedelta(minutes=15)
    expired = Booking.objects.filter(
        payment_status='pending_payment',
        created_at__lt=cutoff,
        status='pending',
    )
    count = expired.count()
    expired.update(status='cancelled', cancelled_at=timezone.now())
    if count:
        logger.info(f"Expired {count} unpaid bookings")


@shared_task
def send_appointment_reminders():
    """Every 30 min: Send reminder for bookings 24h away."""
    from bookings.models import Booking
    now = timezone.now()
    reminder_window_start = now + timedelta(hours=23, minutes=30)
    reminder_window_end = now + timedelta(hours=24, minutes=30)

    bookings = Booking.objects.filter(
        status='confirmed',
        slot_date=reminder_window_start.date(),
    )

    for booking in bookings:
        from datetime import datetime as dt
        booking_dt = dt.combine(booking.slot_date, booking.slot_start)
        if reminder_window_start.replace(tzinfo=None) <= booking_dt <= reminder_window_end.replace(tzinfo=None):
            service = booking.service
            body = f"""
            <h2>Appointment Reminder</h2>
            <p>This is a reminder that you have an appointment tomorrow:</p>
            <p><strong>{service.title if service else 'Appointment'}</strong></p>
            <p><strong>Date:</strong> {booking.slot_date}</p>
            <p><strong>Time:</strong> {booking.slot_start}</p>
            <p><strong>Location:</strong> {service.location or 'Online' if service else 'TBD'}</p>
            """
            try:
                _send_email(
                    to=booking.customer.email,
                    subject=f"Reminder: {service.title if service else 'Appointment'} tomorrow",
                    html_body=body,
                )
            except Exception as e:
                logger.error(f"Reminder email failed for {booking.id}: {e}")


@shared_task
def mark_completed_bookings():
    """Daily: Mark confirmed bookings past their end time as completed."""
    from bookings.models import Booking
    today = timezone.now().date()
    completed = Booking.objects.filter(
        status='confirmed',
        slot_date__lt=today,
    )
    count = completed.count()
    completed.update(status='completed')
    if count:
        logger.info(f"Marked {count} bookings as completed")


@shared_task
def cleanup_expired_sessions():
    """Hourly: Delete expired WhatsApp and voice sessions."""
    from bookings.models import Waitlist
    now = timezone.now()

    # Clean expired waitlist tokens
    Waitlist.objects.filter(
        notify_expires_at__lt=now,
        notify_token__isnull=False,
    ).update(notify_token=None, notify_expires_at=None)

    logger.info("Cleaned up expired sessions")
