from rest_framework import serializers
from .models import Service, Schedule, WeeklySlot, FlexibleSlot, ServiceQuestion, Resource

class WeeklySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySlot
        fields = ['id', 'day_of_week', 'start_time', 'end_time']

class FlexibleSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlexibleSlot
        fields = ['id', 'start_date', 'end_date', 'start_time', 'end_time']

class ScheduleSerializer(serializers.ModelSerializer):
    weekly_slots = WeeklySlotSerializer(many=True, read_only=True)
    flexible_slots = FlexibleSlotSerializer(many=True, read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'schedule_type', 'timezone', 'weekly_slots', 'flexible_slots']

class ServiceQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceQuestion
        fields = ['id', 'question_text', 'is_required', 'display_order', 'question_type', 'options']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'user', 'name', 'resource_type', 'google_calendar_id', 'is_active']

class ServiceSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)
    questions = ServiceQuestionSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'organization', 'title', 'description', 'duration_minutes',
            'appointment_type', 'location', 'venue_address', 'is_published',
            'approval_status', 'manual_confirmation', 'manual_confirmation_percent',
            'max_capacity', 'advance_payment_required', 'booking_fee',
            'cancellation_hours', 'google_calendar_block_enabled',
            'resource_assignment', 'intro_message', 'confirmation_message',
            'timezone', 'created_at', 'updated_at',
            'schedules', 'questions', 'resources'
        ]
        read_only_fields = ['organization', 'approval_status']
