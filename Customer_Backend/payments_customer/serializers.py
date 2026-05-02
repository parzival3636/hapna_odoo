from rest_framework import serializers


class PaymentInitiateSerializer(serializers.Serializer):
    """
    Payload for POST /api/payments/<booking_id>/
    payment_method: 'card' | 'upi' | 'paypal'
    Card fields are mock — Luhn check happens in view, no real gateway.
    """
    payment_method = serializers.ChoiceField(choices=['card', 'upi', 'paypal'])

    # Card fields (only validated when payment_method == 'card')
    card_number = serializers.CharField(required=False, allow_blank=True)
    card_expiry = serializers.CharField(required=False, allow_blank=True)  # MM/YY
    card_cvv = serializers.CharField(required=False, allow_blank=True)
    card_name = serializers.CharField(required=False, allow_blank=True)

    # UPI
    upi_id = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        method = data.get('payment_method')
        if method == 'card':
            if not data.get('card_number'):
                raise serializers.ValidationError({'card_number': 'Required for card payment.'})
            if not data.get('card_expiry'):
                raise serializers.ValidationError({'card_expiry': 'Required for card payment.'})
            if not data.get('card_cvv'):
                raise serializers.ValidationError({'card_cvv': 'Required for card payment.'})
            # Basic CVV length check (3 or 4 digits)
            cvv = data['card_cvv'].strip()
            if not cvv.isdigit() or len(cvv) not in (3, 4):
                raise serializers.ValidationError({'card_cvv': 'CVV must be 3 or 4 digits.'})
        elif method == 'upi':
            if not data.get('upi_id'):
                raise serializers.ValidationError({'upi_id': 'UPI ID is required.'})
        return data


class PaymentStatusSerializer(serializers.Serializer):
    """Poll response for GET /api/payments/<booking_id>/status/"""
    booking_id = serializers.UUIDField()
    payment_status = serializers.CharField()
    booking_status = serializers.CharField()
    confirmation_token = serializers.CharField(allow_null=True)
