import os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from users.models import GoogleCredential

def get_google_calendar_client(user):
    """Get an authorized Google Calendar API client for the user."""
    try:
        creds_obj = user.google_creds
    except:
        return None

    creds = Credentials(
        token=creds_obj.token,
        refresh_token=creds_obj.refresh_token,
        token_uri=creds_obj.token_uri,
        client_id=creds_obj.client_id,
        client_secret=creds_obj.client_secret,
        scopes=creds_obj.scopes.split(',')
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        # Update stored token
        creds_obj.token = creds.token
        creds_obj.save()

    return build('calendar', 'v3', credentials=creds)

def get_busy_slots(user, start_date, end_date):
    """Fetch busy time slots from the user's primary Google Calendar."""
    service = get_google_calendar_client(user)
    if not service:
        return []

    # Format dates as RFC3339
    time_min = datetime.combine(start_date, datetime.min.time()).isoformat() + 'Z'
    time_max = datetime.combine(end_date, datetime.max.time()).isoformat() + 'Z'

    body = {
        "timeMin": time_min,
        "timeMax": time_max,
        "items": [{"id": "primary"}]
    }

    try:
        freebusy_res = service.freebusy().query(body=body).execute()
        busy_slots = freebusy_res.get('calendars', {}).get('primary', {}).get('busy', [])
        return busy_slots
    except Exception as e:
        print(f"Error fetching Google Calendar busy slots: {e}")
        return []

def add_event_to_calendar(booking):
    """Add a booking as an event to the organiser's Google Calendar."""
    organiser = booking.service.created_by
    service = get_google_calendar_client(organiser)
    if not service:
        return None

    start_dt = datetime.combine(booking.slot_date, booking.slot_start)
    end_dt = datetime.combine(booking.slot_date, booking.slot_end)

    event = {
        'summary': f"Appointment: {booking.service.title}",
        'description': f"Customer: {booking.customer.username}\nLink: {booking.meeting_link}",
        'start': {
            'dateTime': start_dt.isoformat(),
            'timeZone': organiser.timezone,
        },
        'end': {
            'dateTime': end_dt.isoformat(),
            'timeZone': organiser.timezone,
        },
        'attendees': [
            {'email': booking.customer.email},
        ],
    }

    try:
        event = service.events().insert(calendarId='primary', body=event).execute()
        booking.google_calendar_event_id = event.get('id')
        booking.save()
        return event.get('id')
    except Exception as e:
        print(f"Error adding Google Calendar event: {e}")
        return None


def get_calendar_events(user, start_date, end_date):
    """
    Fetch actual calendar events (not just busy/free) from the user's
    primary Google Calendar.  Returns a list of dicts with:
      id, summary, start, end, description, htmlLink
    """
    service = get_google_calendar_client(user)
    if not service:
        return []

    time_min = datetime.combine(start_date, datetime.min.time()).isoformat() + 'Z'
    time_max = datetime.combine(end_date, datetime.max.time()).isoformat() + 'Z'

    try:
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime',
            maxResults=250,
        ).execute()

        items = events_result.get('items', [])
        events = []
        for item in items:
            start = item.get('start', {})
            end = item.get('end', {})
            events.append({
                'id': item.get('id'),
                'summary': item.get('summary', '(No title)'),
                'start': start.get('dateTime', start.get('date', '')),
                'end': end.get('dateTime', end.get('date', '')),
                'description': item.get('description', ''),
                'htmlLink': item.get('htmlLink', ''),
                'location': item.get('location', ''),
            })
        return events
    except Exception as e:
        print(f"Error fetching Google Calendar events: {e}")
        return []

