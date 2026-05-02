import uuid
from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from .models import SlotHold


class SlotHoldCreateSerializer(serializers.Serializer):
    """Validates the incoming create-hold request."""
    service_id = serializers.UUIDField()
    resource_id = serializers.UUIDField(required=False, allow_null=True)
    slot_date = serializers.DateField()
    slot_start = serializers.TimeField()   # "HH:MM"
    slot_end = serializers.TimeField()     # "HH:MM"
    capacity_held = serializers.IntegerField(default=1, min_value=1)

    def validate_slot_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError('Cannot hold a slot in the past.')
        return value

    def validate(self, data):
        if data['slot_end'] <= data['slot_start']:
            raise serializers.ValidationError('slot_end must be after slot_start.')
        return data


class SlotHoldResponseSerializer(serializers.ModelSerializer):
    """Output representation of a created hold."""
    class Meta:
        model = SlotHold
        fields = ['id', 'service_id', 'resource_id', 'slot_date',
                  'slot_start', 'slot_end', 'capacity_held', 'expires_at']
