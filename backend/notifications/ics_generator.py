"""ICS calendar attachment generator."""
from icalendar import Calendar, Event
from datetime import datetime


def generate_ics(booking):
    """Generate .ics bytes from a booking object."""
    service = booking.service

    cal = Calendar()
    cal.add('prodid', '-//Hapna Booking Platform//EN')
    cal.add('version', '2.0')
    cal.add('method', 'REQUEST')

    event = Event()
    event.add('summary', service.title if service else 'Appointment')
    event.add('dtstart', datetime.combine(booking.slot_date, booking.slot_start))
    event.add('dtend', datetime.combine(booking.slot_date, booking.slot_end))

    location = service.venue_address or service.location or 'Online'
    event.add('location', location)

    description = (
        f"Booking Reference: {booking.confirmation_token}\n"
        f"Service: {service.title if service else 'Appointment'}\n"
        f"Duration: {service.duration_minutes if service else '?'} minutes\n"
    )
    event.add('description', description)
    event.add('uid', str(booking.id))
    event.add('status', 'CONFIRMED')

    cal.add_component(event)
    return cal.to_ical()
