"""
Profile Autofill view — A2 Step 4.

GET /api/profile/autofill/?service=<uuid>

Returns a list of service questions pre-filled from:
  1. Customer profile fields (name, email, phone)
  2. Last booking answer for the same service (same question)
  3. Empty if neither applies

GET /api/profile/me/
  Returns the current customer's profile data.

PATCH /api/profile/me/
  Updates the current customer's profile fields.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile, ServiceQuestion, BookingAnswer, CustomerProfile
from .serializers import AutofillItemSerializer


class AutofillView(APIView):
    """
    GET /api/profile/autofill/?service=<uuid>

    Logic per question:
      if profile has a matching field → source='profile'
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
            profile = UserProfile.objects.get(id=request.user.user_id)
            profile_map = profile.to_field_map()
        except UserProfile.DoesNotExist:
            profile_map = {}

        # Fetch previous answers for this service (most recent first)
        # Using correct table names: bookings_bookinganswer and bookings_booking
        from django.db import connection
        prev_answers: dict[str, str] = {}
        try:
            with connection.cursor() as cur:
                cur.execute(
                    """
                    SELECT ba.question_id, ba.answer_text
                    FROM bookings_bookinganswer ba
                    JOIN bookings_booking b ON b.id = ba.booking_id
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
        except Exception:
            # If no previous bookings exist, that's fine
            pass

        # Build autofill result
        result = []
        for q in questions:
            q_id = str(q.id)
            prefill_value = None
            source = 'empty'

            # Priority 1: check previous booking answers
            if q_id in prev_answers and prev_answers[q_id]:
                prefill_value = prev_answers[q_id]
                source = 'previous_booking'

            # Priority 2: profile field matching (heuristic by question text)
            if source == 'empty' and profile_map:
                q_lower = q.question_text.lower()
                if 'name' in q_lower and profile_map.get('full_name'):
                    prefill_value = profile_map['full_name']
                    source = 'profile'
                elif 'email' in q_lower and profile_map.get('email'):
                    prefill_value = profile_map['email']
                    source = 'profile'
                elif 'phone' in q_lower and profile_map.get('phone_number'):
                    prefill_value = profile_map['phone_number']
                    source = 'profile'

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


class CustomerProfileView(APIView):
    """
    GET  /api/profile/me/  — Return current customer's profile
    PATCH /api/profile/me/ — Update profile fields (first_name, last_name, phone_number, timezone, whatsapp_opted_in)
    """

    def get(self, request):
        try:
            profile = UserProfile.objects.get(id=request.user.user_id)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': True, 'code': 'NOT_FOUND',
                 'message': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'id': str(profile.id),
            'email': profile.email,
            'first_name': profile.first_name,
            'last_name': profile.last_name,
            'full_name': profile.get_full_name(),
            'phone_number': profile.phone_number,
            'timezone': profile.timezone,
            'whatsapp_opted_in': profile.whatsapp_opted_in,
            'google_calendar_connected': profile.google_calendar_connected,
        })

    def patch(self, request):
        try:
            profile = UserProfile.objects.get(id=request.user.user_id)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': True, 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND,
            )

        updatable_fields = ['first_name', 'last_name', 'phone_number',
                            'timezone', 'whatsapp_opted_in']
        updated = []
        for field in updatable_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
                updated.append(field)

        if updated:
            profile.save(update_fields=updated)

        return Response({
            'id': str(profile.id),
            'email': profile.email,
            'first_name': profile.first_name,
            'last_name': profile.last_name,
            'full_name': profile.get_full_name(),
            'phone_number': profile.phone_number,
            'timezone': profile.timezone,
            'whatsapp_opted_in': profile.whatsapp_opted_in,
            'google_calendar_connected': profile.google_calendar_connected,
            'updated_fields': updated,
        })
