from django.urls import path
from .views import (
    CustomerBookingCreateView,
    CustomerBookingDetailView,
    CustomerBookingsByDateView,
    CustomerBookingStatusView,
    CustomerBookingCancelView,
    CustomerBookingCancelByTokenView,
    CustomerBookingRescheduleView,
)

urlpatterns = [
    # Order matters: fixed paths before <uuid:pk>
    path('mine/', CustomerBookingsByDateView.as_view(), name='customer-bookings-mine'),
    path('cancel/<str:token>/', CustomerBookingCancelByTokenView.as_view(), name='booking-cancel-token'),
    path('', CustomerBookingCreateView.as_view(), name='customer-booking-create'),
    path('<uuid:pk>/', CustomerBookingDetailView.as_view(), name='customer-booking-detail'),
    path('<uuid:pk>/status/', CustomerBookingStatusView.as_view(), name='customer-booking-status'),
    path('<uuid:pk>/cancel/', CustomerBookingCancelView.as_view(), name='customer-booking-cancel'),
    path('<uuid:pk>/reschedule/', CustomerBookingRescheduleView.as_view(), name='customer-booking-reschedule'),
]
