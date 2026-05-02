from django.urls import path
from .views import PaymentInitiateView, PaymentStatusView

urlpatterns = [
    path('<uuid:booking_id>/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('<uuid:booking_id>/status/', PaymentStatusView.as_view(), name='payment-status'),
]
