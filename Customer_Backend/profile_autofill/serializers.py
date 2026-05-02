from rest_framework import serializers


class AutofillItemSerializer(serializers.Serializer):
    """One autofill result per intake question."""
    question_id = serializers.UUIDField()
    question_text = serializers.CharField()
    question_type = serializers.CharField()
    is_required = serializers.BooleanField()
    options = serializers.JSONField(allow_null=True)
    prefill_value = serializers.CharField(allow_null=True, allow_blank=True)
    # 'profile' | 'previous_booking' | 'empty'
    source = serializers.CharField()
