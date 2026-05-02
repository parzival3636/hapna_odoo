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
from datetime import date, timedelta
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
            SELECT id, max_capacity, appointment_type, duration_minutes
            FROM services
            WHERE id = %s AND is_published = true
            """,
            [service_id],
        )
        row = cur.fetchone()
    if not row:
        return None
    return {
        'id': str(row[0]),
        'max_capacity': row[1],  # None → unlimited (treat as 1 for single appointments)
        'appointment_type': row[2],
        'duration_minutes': row[3],
    }


def _get_template_slots(service_id: str, target_date: date) -> list[dict]:
    """
    Return raw time-slot templates for the given date from schedules.
    Checks weekly_slots (by day_of_week) and flexible_slots (by specific_date).
    """
    slots = []
    with connection.cursor() as cur:
        # Weekly slots
        cur.execute(
            """
            SELECT ws.start_time, ws.end_time
            FROM weekly_slots ws
            JOIN schedules s ON s.id = ws.schedule_id
            WHERE s.service_id = %s
              AND ws.day_of_week = %s
            ORDER BY ws.start_time
            """,
            [service_id, target_date.weekday() + 1 if target_date.weekday() < 6 else 0],
            # Python weekday(): Mon=0..Sun=6 → DB: Sun=0..Sat=6
        )
        # Recalculate: DB day_of_week: 0=Sun,1=Mon..6=Sat
        # Python date.weekday(): 0=Mon..6=Sun
        # Mapping: python 6→DB 0, python 0→DB 1 ... python 5→DB 6
    
    with connection.cursor() as cur:
        python_dow = target_date.weekday()  # 0=Mon..6=Sun
        db_dow = (python_dow + 1) % 7       # 0=Sun..6=Sat
        cur.execute(
            """
            SELECT ws.start_time, ws.end_time
            FROM weekly_slots ws
            JOIN schedules s ON s.id = ws.schedule_id
            WHERE s.service_id = %s
              AND ws.day_of_week = %s
            ORDER BY ws.start_time
            """,
            [service_id, db_dow],
        )
        for row in cur.fetchall():
            slots.append({'start': row[0], 'end': row[1]})

        # Flexible slots
        cur.execute(
            """
            SELECT fs.start_time, fs.end_time
            FROM flexible_slots fs
            JOIN schedules s ON s.id = fs.schedule_id
            WHERE s.service_id = %s
              AND fs.specific_date = %s
            ORDER BY fs.start_time
            """,
            [service_id, target_date],
        )
        for row in cur.fetchall():
            # Avoid duplicates if both weekly + flexible define same time
            entry = {'start': row[0], 'end': row[1]}
            if entry not in slots:
                slots.append(entry)

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
            FROM bookings
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

    capacity = service['max_capacity'] or 1  # treat NULL as single-seat

    templates = _get_template_slots(service_id, target_date)
    if not templates:
        return []

    result = []
    for tpl in templates:
        booked = _count_booked(service_id, target_date, tpl['start'], tpl['end'], resource_id)
        held = _count_held(service_id, target_date, tpl['start'], tpl['end'], resource_id)
        remaining = max(0, capacity - booked - held)
        result.append({
            'start': str(tpl['start'])[:5],   # "HH:MM"
            'end': str(tpl['end'])[:5],
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
