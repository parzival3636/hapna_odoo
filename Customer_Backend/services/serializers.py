from rest_framework import serializers
from .models import Service, ServiceQuestion, Resource


class ServiceQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceQuestion
        fields = [
            'id', 'question_text', 'is_required',
            'display_order', 'question_type', 'options',
            
        ]


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'name', 'resource_type']


class ServiceListSerializer(serializers.ModelSerializer):
    """Compact card representation for the service grid (A1)."""
    payment_amount = serializers.DecimalField(source='booking_fee', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'duration_minutes',
            'appointment_type', 'location', 
            'payment_amount', 'advance_payment_required',
            'max_capacity', 'timezone',
        ]


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Full detail shown on the service detail page — includes questions."""
    questions = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()

    payment_amount = serializers.DecimalField(source='booking_fee', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'duration_minutes',
            'appointment_type', 'location', 'venue_address',
            'payment_amount', 'advance_payment_required',
            'manual_confirmation', 'max_capacity', 'resource_assignment',
            'timezone', 'intro_message', 'confirmation_message',
            'questions', 'resources',
        ]

    def get_questions(self, obj):
        qs = ServiceQuestion.objects.filter(service_id=obj.id).order_by('display_order')
        return ServiceQuestionSerializer(qs, many=True).data

    def get_resources(self, obj):
        if obj.appointment_type != 'resource':
            return []
        qs = Resource.objects.filter(service_id=obj.id, is_active=True)
        return ResourceSerializer(qs, many=True).data


class SlotSerializer(serializers.Serializer):
    """Single availability slot — output only."""
    start = serializers.CharField()
    end = serializers.CharField()
    remaining = serializers.IntegerField()
    total_capacity = serializers.IntegerField()
    status = serializers.CharField()  # available | last_2 | last_1 | full
