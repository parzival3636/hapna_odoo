from rest_framework import serializers
from .models import Booking, BookingAnswer, ServiceQuestion, CustomerProfile, Service, Resource


class BookingAnswerSerializer(serializers.Serializer):
    """Nested answer with question text included."""
    question_text = serializers.SerializerMethodField()
    answer_text = serializers.CharField()

    def get_question_text(self, obj):
        try:
            q = ServiceQuestion.objects.get(id=obj.question_id)
            return q.question_text
        except ServiceQuestion.DoesNotExist:
            return 'Unknown question'


class BookingListSerializer(serializers.Serializer):
    """Booking list item for organiser dashboard."""
    id = serializers.UUIDField()
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    service_title = serializers.SerializerMethodField()
    resource_name = serializers.SerializerMethodField()
    slot_date = serializers.DateField()
    slot_start = serializers.TimeField()
    slot_end = serializers.TimeField()
    status = serializers.CharField()
    booking_channel = serializers.CharField()
    capacity_booked = serializers.IntegerField()
    no_show_risk_score = serializers.FloatField()
    payment_status = serializers.CharField()
    confirmation_token = serializers.CharField()
    created_at = serializers.DateTimeField()

    def get_customer_name(self, obj):
        profile = obj.customer_profile
        return profile.full_name if profile else obj.customer_id

    def get_customer_email(self, obj):
        return obj.customer_id  # user_id is the Supabase UID

    def get_service_title(self, obj):
        service = obj.service
        return service.title if service else 'Unknown'

    def get_resource_name(self, obj):
        resource = obj.resource
        return resource.name if resource else None


class BookingDetailSerializer(BookingListSerializer):
    """Full booking detail including intake answers."""
    answers = serializers.SerializerMethodField()
    notes = serializers.CharField()
    confirmed_at = serializers.DateTimeField()
    cancelled_at = serializers.DateTimeField()
    google_calendar_event_id = serializers.CharField()

    def get_answers(self, obj):
        answers = BookingAnswer.objects.filter(booking_id=obj.id)
        return BookingAnswerSerializer(answers, many=True).data


class CalendarEventSerializer(serializers.Serializer):
    """FullCalendar.js event format."""
    id = serializers.UUIDField()
    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    status = serializers.CharField()
    no_show_risk_score = serializers.FloatField()
    color = serializers.SerializerMethodField()

    STATUS_COLORS = {
        'pending': '#f59e0b',     # amber
        'confirmed': '#22c55e',   # green
        'cancelled': '#ef4444',   # red
        'completed': '#6b7280',   # gray
        'no_show': '#f97316',     # orange
        'rescheduled': '#3b82f6', # blue
    }

    def get_title(self, obj):
        profile = obj.customer_profile
        name = profile.full_name if profile else 'Customer'
        service = obj.service
        svc_title = service.title if service else 'Service'
        return f"{name} — {svc_title}"

    def get_start(self, obj):
        from datetime import datetime
        return datetime.combine(obj.slot_date, obj.slot_start).isoformat()

    def get_end(self, obj):
        from datetime import datetime
        return datetime.combine(obj.slot_date, obj.slot_end).isoformat()

    def get_color(self, obj):
        return self.STATUS_COLORS.get(obj.status, '#6b7280')


class StatusUpdateSerializer(serializers.Serializer):
    """For PATCH status updates."""
    status = serializers.ChoiceField(choices=[
        'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
    ])


class RejectSerializer(serializers.Serializer):
    """For POST reject with reason."""
    reason = serializers.CharField(max_length=500, required=False, default='')
