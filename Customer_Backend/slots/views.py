"""
Slots views — A3 Soft Hold Locking.

POST   /api/slots/hold/          Create a 10-min soft hold
PATCH  /api/slots/hold/<id>/     Extend hold by 10 min (heartbeat)
DELETE /api/slots/hold/<id>/     Release hold (route change / abandon)
"""
import uuid
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import SlotHold
from .serializers import SlotHoldCreateSerializer, SlotHoldResponseSerializer
from services.availability import compute_slot_availability

HOLD_DURATION_MINUTES = 10


def _count_active_holds_for_slot(service_id, slot_date, slot_start, slot_end,
                                  resource_id=None, exclude_id=None):
    """Total capacity currently held (non-expired) for a specific slot."""
    qs = SlotHold.objects.filter(
        service_id=service_id,
        slot_date=slot_date,
        slot_start=slot_start,
        slot_end=slot_end,
        expires_at__gt=timezone.now(),
    )
    if resource_id:
        qs = qs.filter(resource_id=resource_id)
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    return sum(h.capacity_held for h in qs)


class SlotHoldCreateView(APIView):
    """
    POST /api/slots/hold/
    Body: { service_id, slot_date, slot_start, slot_end, capacity_held, resource_id? }

    1. Validates the slot exists in the service schedule for that date.
    2. Checks remaining capacity (bookings + holds).
    3. Creates a 10-minute hold.
    Returns: hold record with expires_at.
    """

    def post(self, request):
        serializer = SlotHoldCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service_id = str(data['service_id'])
        slot_date = data['slot_date']
        slot_start = data['slot_start']
        slot_end = data['slot_end']
        capacity_held = data['capacity_held']
        resource_id = str(data['resource_id']) if data.get('resource_id') else None

        # ── Step 1: confirm slot exists and get remaining capacity ──────────
        slots = compute_slot_availability(service_id, slot_date, resource_id)
        start_str = str(slot_start)[:5]
        end_str = str(slot_end)[:5]

        matching = [
            s for s in slots
            if s['start'] == start_str and s['end'] == end_str
        ]
        if not matching:
            return Response(
                {'error': True, 'code': 'SLOT_NOT_FOUND',
                 'message': 'This slot does not exist for the given service and date.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        slot_info = matching[0]
        if slot_info['remaining'] < capacity_held:
            return Response(
                {
                    'error': True,
                    'code': 'SLOT_FULL',
                    'message': (
                        f'Only {slot_info["remaining"]} seat(s) left, '
                        f'but {capacity_held} requested.'
                    ),
                    'remaining': slot_info['remaining'],
                },
                status=status.HTTP_409_CONFLICT,
            )

        # ── Step 2: create the hold ─────────────────────────────────────────
        hold = SlotHold.objects.create(
            service_id=service_id,
            resource_id=resource_id,
            slot_date=slot_date,
            slot_start=slot_start,
            slot_end=slot_end,
            session_token=str(uuid.uuid4()),
            capacity_held=capacity_held,
            expires_at=timezone.now() + timedelta(minutes=HOLD_DURATION_MINUTES),
        )

        return Response(
            SlotHoldResponseSerializer(hold).data,
            status=status.HTTP_201_CREATED,
        )


class SlotHoldRefreshView(APIView):
    """
    PATCH /api/slots/hold/<id>/
    Extends hold expiry by HOLD_DURATION_MINUTES.
    Called every 3 min from the IntakeForm (heartbeat).
    """

    def patch(self, request, pk):
        try:
            hold = SlotHold.objects.get(id=pk)
        except SlotHold.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if hold.is_expired:
            return Response(
                {'error': True, 'code': 'HOLD_EXPIRED',
                 'message': 'This hold has already expired. Please re-select a slot.'},
                status=status.HTTP_410_GONE,
            )

        hold.expires_at = timezone.now() + timedelta(minutes=HOLD_DURATION_MINUTES)
        hold.save(update_fields=['expires_at'])

        return Response(SlotHoldResponseSerializer(hold).data)


class SlotHoldDeleteView(APIView):
    """
    DELETE /api/slots/hold/<id>/
    Releases the hold immediately (user navigated away / abandoned flow).
    """

    def delete(self, request, pk):
        try:
            hold = SlotHold.objects.get(id=pk)
        except SlotHold.DoesNotExist:
            # Idempotent — already gone is fine
            return Response(status=status.HTTP_204_NO_CONTENT)

        hold.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
