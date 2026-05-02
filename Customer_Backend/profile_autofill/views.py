"""
Profile Autofill view — A2 Step 4.

GET /api/profile/autofill/?service=<uuid>

Returns a list of service questions pre-filled from:
  1. customer_profiles field (via maps_to_profile_field)
  2. Last booking answer for the same service (same question)
  3. Empty if neither applies
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import CustomerProfile, ServiceQuestion, BookingAnswer
from .serializers import AutofillItemSerializer


class AutofillView(APIView):
    """
    GET /api/profile/autofill/?service=<uuid>

    Logic per question:
      if maps_to_profile_field is set and profile has that field → source='profile'
      elif customer has a previous booking answer for this question → source='previous_booking'
      else → source='empty', prefill_value=None
    """

    def get(self, request):
        service_id = request.query_params.get('service')
        if not service_id:
            return Response(
                {'error': True, 'code': 'MISSING_PARAM',
                 'message': "'service' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch questions for this service
        questions = ServiceQuestion.objects.filter(service_id=service_id).order_by('display_order')
        if not questions.exists():
            return Response([])

        # Fetch customer profile (may not exist)
        try:
            profile = CustomerProfile.objects.get(user_id=request.user.user_id)
            profile_map = profile.to_field_map()
        except CustomerProfile.DoesNotExist:
            profile_map = {}

        # Fetch previous answers for this service (most recent first)
        # We join through booking_id → get question_id → answer_text
        from django.db import connection
        prev_answers: dict[str, str] = {}
        with connection.cursor() as cur:
            cur.execute(
                """
                SELECT ba.question_id, ba.answer_text
                FROM booking_answers ba
                JOIN bookings b ON b.id = ba.booking_id
                WHERE b.customer_id = %s
                  AND b.service_id = %s
                  AND b.status NOT IN ('cancelled')
                ORDER BY b.created_at DESC
                """,
                [request.user.user_id, service_id],
            )
            for row in cur.fetchall():
                q_id = str(row[0])
                if q_id not in prev_answers:   # keep most recent only
                    prev_answers[q_id] = row[1]

        # Build autofill result
        result = []
        for q in questions:
            q_id = str(q.id)
            prefill_value = None
            source = 'empty'

            # Priority 1: profile field mapping
            if q.maps_to_profile_field and q.maps_to_profile_field in profile_map:
                val = profile_map[q.maps_to_profile_field]
                if val is not None:
                    prefill_value = str(val)
                    source = 'profile'

            # Priority 2: previous booking answer
            if source == 'empty' and q_id in prev_answers:
                prefill_value = prev_answers[q_id]
                source = 'previous_booking'

            result.append({
                'question_id': q_id,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'is_required': q.is_required,
                'options': q.options,
                'prefill_value': prefill_value,
                'source': source,
            })

        serializer = AutofillItemSerializer(result, many=True)
        return Response(serializer.data)
