"""
No-show prediction model — loaded once as singleton.
Predicts probability (0.0-1.0) that a customer will no-show.
"""
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_model = None
_model_loaded = False


def _load_model():
    """Load the pre-trained sklearn model from .pkl file."""
    global _model, _model_loaded

    if _model_loaded:
        return _model

    model_path = Path(__file__).parent / 'no_show_model.pkl'
    if not model_path.exists():
        logger.warning(f"No-show model not found at {model_path}. Predictions will return -1.")
        _model_loaded = True
        return None

    try:
        import joblib
        _model = joblib.load(model_path)
        _model_loaded = True
        logger.info("No-show prediction model loaded successfully")
        return _model
    except Exception as e:
        logger.error(f"Failed to load no-show model: {e}")
        _model_loaded = True
        return None


def _get_time_bucket(time_obj):
    """Convert time to bucket: morning(0), afternoon(1), evening(2)."""
    hour = time_obj.hour
    if hour < 12:
        return 0  # morning
    elif hour < 17:
        return 1  # afternoon
    else:
        return 2  # evening


def _extract_features(booking):
    """Extract 8 ML features from a booking."""
    from datetime import datetime
    from bookings.models import Booking

    # Lead time in hours
    created = booking.created_at or datetime.now()
    if hasattr(created, 'replace'):
        created = created.replace(tzinfo=None)
    appointment_dt = datetime.combine(booking.slot_date, booking.slot_start)
    lead_time = max(0, (appointment_dt - created).total_seconds() / 3600)

    # Day of week
    day_of_week = booking.slot_date.weekday()

    # Time bucket
    time_bucket = _get_time_bucket(booking.slot_start)

    # Customer history
    customer_bookings = Booking.objects.filter(customer_id=booking.customer_id)
    total_bookings = customer_bookings.count()
    cancelled_bookings = customer_bookings.filter(status='cancelled').count()
    no_show_bookings = customer_bookings.filter(status='no_show').count()

    customer_cancel_rate = cancelled_bookings / max(total_bookings, 1)
    customer_no_show_rate = no_show_bookings / max(total_bookings, 1)

    # Service cancellation rate
    service_bookings = Booking.objects.filter(service_id=booking.service_id)
    service_total = service_bookings.count()
    service_cancelled = service_bookings.filter(status='cancelled').count()
    service_cancel_rate = service_cancelled / max(service_total, 1)

    # Channel encoding: web=0, whatsapp=1, voice=2
    channel_map = {'web': 0, 'whatsapp': 1, 'voice': 2}
    channel = channel_map.get(booking.booking_channel, 0)

    # Payment: paid=1, unpaid=0
    paid = 1 if booking.payment_status == 'paid' else 0

    return [
        lead_time,
        day_of_week,
        time_bucket,
        total_bookings,
        customer_cancel_rate,
        customer_no_show_rate,
        service_cancel_rate,
        channel,
        paid,
    ]


def predict_no_show(booking):
    """
    Predict no-show probability for a booking.
    Returns: float 0.0-1.0, or -1 if model not available.
    """
    model = _load_model()
    if model is None:
        return -1

    try:
        features = _extract_features(booking)
        proba = model.predict_proba([features])[0][1]
        return round(float(proba), 3)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return -1
