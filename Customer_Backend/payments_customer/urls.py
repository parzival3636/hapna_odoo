from django.urls import path
from .views import StripeCheckoutView, PaymentConfirmView, PaymentStatusView

urlpatterns = [
    path('<uuid:booking_id>/checkout-session/', StripeCheckoutView.as_view(), name='payment-checkout-session'),
    path('<uuid:booking_id>/confirm/', PaymentConfirmView.as_view(), name='payment-confirm'),
    path('<uuid:booking_id>/status/', PaymentStatusView.as_view(), name='payment-status'),
]
