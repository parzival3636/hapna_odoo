from rest_framework import serializers
from .models import Booking, BookingAnswer, ServiceQuestion


class BookingAnswerInputSerializer(serializers.Serializer):
    """One answer in the intake form submission."""
    question_id = serializers.UUIDField()
    value = serializers.CharField(allow_blank=True)


class BookingCreateSerializer(serializers.Serializer):
    """
    Full wizard submission payload:
      Step 0+1+2 → service_id, resource_id, slot_date, slot_start, slot_end
      Step 2      → hold_id (required — slot must be held)
      Step 3      → capacity_booked
      Step 4      → answers[]
    """
    service_id = serializers.UUIDField()
    resource_id = serializers.UUIDField(required=False, allow_null=True)
    slot_date = serializers.DateField()
    slot_start = serializers.TimeField()
    slot_end = serializers.TimeField()
    hold_id = serializers.UUIDField()
    capacity_booked = serializers.IntegerField(default=1, min_value=1)
    answers = BookingAnswerInputSerializer(many=True, required=False, default=list)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class BookingAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()

    class Meta:
        model = BookingAnswer
        fields = ['id', 'question_id', 'answer_text', 'question_text']

    def get_question_text(self, obj):
        try:
            q = ServiceQuestion.objects.get(id=obj.question_id)
            return q.question_text
        except ServiceQuestion.DoesNotExist:
            return None


class BookingDetailSerializer(serializers.ModelSerializer):
    """Full booking detail for customer view."""
    answers = serializers.SerializerMethodField()
    service_title = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'service_id', 'service_title', 'resource_id',
            'slot_date', 'slot_start', 'slot_end',
            'status', 'capacity_booked', 'payment_status',
            'booking_channel', 'notes', 'confirmation_token',
            'created_at', 'confirmed_at', 'cancelled_at',
            'answers',
        ]

    def get_answers(self, obj):
        answers = BookingAnswer.objects.filter(booking_id=obj.id)
        return BookingAnswerSerializer(answers, many=True).data

    def get_service_title(self, obj):
        from .models import Service
        try:
            return Service.objects.get(id=obj.service_id).title
        except Service.DoesNotExist:
            return None


class BookingListSerializer(serializers.ModelSerializer):
    """Compact list — for conflict detection + my bookings date check."""
    class Meta:
        model = Booking
        fields = [
            'id', 'service_id', 'slot_date', 'slot_start', 'slot_end',
            'status', 'payment_status', 'confirmation_token', 'created_at',
        ]


class BookingStatusSerializer(serializers.ModelSerializer):
    """Lightweight poll response — used by payment timer."""
    class Meta:
        model = Booking
        fields = ['id', 'status', 'payment_status', 'confirmation_token']
