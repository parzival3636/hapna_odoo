from rest_framework import serializers


class WaitlistCreateSerializer(serializers.Serializer):
    """Join waitlist request."""
    service_id = serializers.UUIDField()
    slot_date = serializers.DateField()
    slot_start = serializers.TimeField()
    resource_id = serializers.UUIDField(required=False, allow_null=True)


class WaitlistResponseSerializer(serializers.Serializer):
    """Waitlist entry response."""
    id = serializers.UUIDField()
    service_id = serializers.UUIDField()
    slot_date = serializers.DateField()
    slot_start = serializers.TimeField()
    resource_id = serializers.UUIDField(allow_null=True)
    notify_token = serializers.CharField(allow_null=True)
    position = serializers.IntegerField()
    created_at = serializers.DateTimeField()
