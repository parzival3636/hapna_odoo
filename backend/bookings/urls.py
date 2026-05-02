from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListView.as_view(), name='booking-list'),
    path('create/', views.BookingCreateView.as_view(), name='booking-create'),
    path('calendar/', views.BookingCalendarView.as_view(), name='booking-calendar'),
    path('<uuid:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<uuid:pk>/status/', views.BookingStatusUpdateView.as_view(), name='booking-status'),
    path('<uuid:pk>/confirm/', views.BookingConfirmView.as_view(), name='booking-confirm'),
    path('<uuid:pk>/reject/', views.BookingRejectView.as_view(), name='booking-reject'),
]
