"""
Availability engine for the Customer Booking Backend.

Core function: compute_slot_availability(service_id, target_date, resource_id=None)

Returns a list of slot dicts:
  {
    "start": "HH:MM",
    "end":   "HH:MM",
    "remaining": int,        # how many seats are bookable right now
    "total_capacity": int,   # service.max_capacity or 1
    "status": "available" | "last_1" | "last_2" | "full",
  }

Used by:
  - ServiceAvailabilityView  (GET /api/services/<id>/availability/?date=)
  - ServiceNextAvailableView (GET /api/services/<id>/next-available/)
  - SlotHoldCreateView       (capacity guard before creating a hold)
"""
from datetime import date, timedelta, datetime
import json
import requests
import zoneinfo
from django.db import connection
from django.utils import timezone

# Status labels match the frontend's colour coding:
#   🟢 "available"   = remaining >= 3 (or unlimited)
#   🟡 "last_2"      = remaining == 2
#   🔴 "last_1"      = remaining == 1
#   ⬜ "full"        = remaining == 0
_STATUS_FULL = 'full'
_STATUS_LAST_1 = 'last_1'
_STATUS_LAST_2 = 'last_2'
_STATUS_AVAILABLE = 'available'

LOOK_AHEAD_DAYS = 60   # how far forward next-available scans


def _status_label(remaining: int, capacity: int) -> str:
    if remaining <= 0:
        return _STATUS_FULL
    # For single-seat services, 'last_1' on every slot is misleading
    # — just show green 'available'. Only use urgency labels for group capacity.
    if capacity == 1:
        return _STATUS_AVAILABLE
    if remaining == 1:
        return _STATUS_LAST_1
    if remaining == 2:
        return _STATUS_LAST_2
    return _STATUS_AVAILABLE


def _get_service_row(service_id: str) -> dict | None:
    """Raw SQL fetch to avoid ORM import cycle issues."""
    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT id, capacity_per_slot, appointment_type, duration_minutes,
                   excluded_days, schedule_days, schedule_start_date,
                   google_calendar_block_enabled, created_by_id, timezone,
                   working_start_time, working_end_time
            FROM services_service
            WHERE id = %s AND is_published = true
            """,
            [service_id],
        )
        row = cur.fetchone()
    if not row:
        return None
    return {
        'id': str(row[0]),
        'capacity_per_slot': row[1],
        'appointment_type': row[2],
        'duration_minutes': row[3],
        'excluded_days': row[4] if row[4] is not None else [],
        'schedule_days': row[5],
        'schedule_start_date': row[6],
        'google_calendar_block_enabled': row[7],
        'created_by_id': str(row[8]) if row[8] else None,
        'timezone': row[9],
        'working_start_time': row[10],  # time or None
        'working_end_time': row[11],    # time or None
    }


def _generate_working_hour_slots(service: dict, target_date: date) -> list[dict]:
    """
    Generate time slot chunks from working_start_time → working_end_time
    using duration_minutes steps. This mirrors exactly what the backend's
    ServiceViewSet.slots() endpoint does, ensuring hold validation matches.
    """
    from datetime import time as time_type
    work_start = service['working_start_time'] or time_type(9, 0)
    work_end   = service['working_end_time']   or time_type(17, 0)
    duration   = timedelta(minutes=service['duration_minutes'] or 30)

    slot_start_dt = datetime.combine(target_date, work_start)
    slot_end_dt   = datetime.combine(target_date, work_end)

    slots = []
    current = slot_start_dt
    while current + duration <= slot_end_dt:
        slots.append({'start': current.time(), 'end': (current + duration).time()})
        current += duration
    return slots


def _count_booked(service_id: str, target_date: date, start_time, end_time,
                  resource_id: str | None) -> int:
    """Sum capacity_booked for active bookings on this exact slot."""
    params = [service_id, target_date, start_time, end_time]
    resource_clause = ''
    if resource_id:
        resource_clause = 'AND resource_id = %s'
        params.append(resource_id)

    with connection.cursor() as cur:
        cur.execute(
            f"""
            SELECT COALESCE(SUM(capacity_booked), 0)
            FROM bookings_booking
            WHERE service_id = %s
              AND slot_date = %s
              AND slot_start = %s
              AND slot_end = %s
              AND status IN ('pending', 'confirmed')
              {resource_clause}
            """,
            params,
        )
        return int(cur.fetchone()[0])


def _count_held(service_id: str, target_date: date, start_time, end_time,
                resource_id: str | None) -> int:
    """Sum capacity_held for non-expired slot holds on this slot."""
    now = timezone.now()
    params = [service_id, target_date, start_time, end_time, now]
    resource_clause = ''
    if resource_id:
        resource_clause = 'AND resource_id = %s'
        params.append(resource_id)

    with connection.cursor() as cur:
        cur.execute(
            f"""
            SELECT COALESCE(SUM(capacity_held), 0)
            FROM slot_holds
            WHERE service_id = %s
              AND slot_date = %s
              AND slot_start = %s
              AND slot_end = %s
              AND expires_at > %s
              {resource_clause}
            """,
            params,
        )
        return int(cur.fetchone()[0])


def _fetch_google_busy_slots(user_id: str, target_date: date, tz_str: str) -> list[dict]:
    """Fetch busy slots for a given user on a target date directly from Google API."""
    with connection.cursor() as cur:
        cur.execute(
            """
            SELECT token, refresh_token, client_id, client_secret
            FROM users_googlecredential
            WHERE user_id = %s
            """,
            [user_id]
        )
        row = cur.fetchone()
        
    if not row:
        return []
        
    token, refresh_token, client_id, client_secret = row
    
    # We query the entire day for busy slots in the local timezone (converted to UTC for the request)
    try:
        local_tz = zoneinfo.ZoneInfo(tz_str)
    except Exception:
        local_tz = timezone.get_current_timezone()
        
    start_dt = datetime.combine(target_date, datetime.min.time(), tzinfo=local_tz)
    end_dt = datetime.combine(target_date, datetime.max.time(), tzinfo=local_tz)
    
    time_min = start_dt.isoformat()
    time_max = end_dt.isoformat()
    
    def _call_freebusy(access_token):
        return requests.post(
            "https://www.googleapis.com/calendar/v3/freeBusy",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "timeMin": time_min,
                "timeMax": time_max,
                "items": [{"id": "primary"}]
            },
            timeout=5
        )
        
    res = _call_freebusy(token)
    
    if res.status_code == 401 and refresh_token:
        # Token expired, refresh it
        refresh_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            },
            timeout=5
        )
        if refresh_res.ok:
            new_token = refresh_res.json().get('access_token')
            if new_token:
                with connection.cursor() as cur:
                    cur.execute(
                        "UPDATE users_googlecredential SET token = %s, updated_at = NOW() WHERE user_id = %s",
                        [new_token, user_id]
                    )
                res = _call_freebusy(new_token)
                
    if not res.ok:
        return []
        
    data = res.json()
    raw_busy_slots = data.get('calendars', {}).get('primary', {}).get('busy', [])
    
    parsed_slots = []
    for slot in raw_busy_slots:
        try:
            # Parse Google's ISO8601 string
            s_dt = datetime.fromisoformat(slot['start'].replace('Z', '+00:00')).astimezone(local_tz)
            e_dt = datetime.fromisoformat(slot['end'].replace('Z', '+00:00')).astimezone(local_tz)
            parsed_slots.append({'start': s_dt.time(), 'end': e_dt.time()})
        except ValueError:
            pass
            
    return parsed_slots


def compute_slot_availability(
    service_id: str,
    target_date: date,
    resource_id: str | None = None,
) -> list[dict]:
    """
    Main availability function. Returns enriched slot list for target_date.
    """
    service = _get_service_row(service_id)
    if not service:
        return []

    # 1. Enforce excluded_days
    excluded = service['excluded_days']
    if isinstance(excluded, str):
        try:
            excluded = json.loads(excluded)
        except ValueError:
            excluded = []
    if target_date.weekday() in excluded:
        return []

    # 2. Enforce schedule limits
    start_date = service['schedule_start_date']
    if not start_date:
        start_date = timezone.now().date()
    end_date = start_date + timedelta(days=service['schedule_days'])
    
    if not (start_date <= target_date <= end_date):
        return []

    capacity = service['capacity_per_slot'] or 1

    # Generate slots using working-hours chunking (same as backend slots/ endpoint)
    templates = _generate_working_hour_slots(service, target_date)
    if not templates:
        return []

    # 3. Google Calendar Busy Slots
    busy_blocks = []
    if service['google_calendar_block_enabled'] and service['created_by_id']:
        busy_blocks = _fetch_google_busy_slots(service['created_by_id'], target_date, service['timezone'])

    result = []
    for tpl in templates:
        tpl_s = tpl['start']
        tpl_e = tpl['end']
        
        # Check overlaps with Google Calendar
        is_blocked = False
        for b in busy_blocks:
            if max(tpl_s, b['start']) < min(tpl_e, b['end']):
                is_blocked = True
                break
                
        if is_blocked:
            remaining = 0
        else:
            booked = _count_booked(service_id, target_date, tpl_s, tpl_e, resource_id)
            held = _count_held(service_id, target_date, tpl_s, tpl_e, resource_id)
            remaining = max(0, capacity - booked - held)
            
        result.append({
            'start': str(tpl_s)[:5],   # "HH:MM"
            'end': str(tpl_e)[:5],
            'remaining': remaining,
            'total_capacity': capacity,
            'status': _status_label(remaining, capacity),
        })

    return result


def find_next_available_dates(
    service_id: str,
    from_date: date | None = None,
    count: int = 3,
    resource_id: str | None = None,
) -> list[str]:
    """
    Scan forward up to LOOK_AHEAD_DAYS days and return the first `count`
    dates that have at least one slot with remaining > 0.
    Returns list of ISO date strings e.g. ['2026-05-12', '2026-05-14', ...]
    """
    start = from_date or date.today()
    found = []
    for offset in range(1, LOOK_AHEAD_DAYS + 1):
        candidate = start + timedelta(days=offset)
        slots = compute_slot_availability(service_id, candidate, resource_id)
        if any(s['remaining'] > 0 for s in slots):
            found.append(candidate.isoformat())
            if len(found) >= count:
                break
    return found
