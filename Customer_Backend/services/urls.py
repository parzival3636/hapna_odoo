from django.urls import path
from .views import (
    ServiceListView,
    ServiceDetailView,
    ServiceResourcesView,
    ServiceAvailabilityView,
    ServiceNextAvailableView,
)

urlpatterns = [
    path('', ServiceListView.as_view(), name='service-list'),
    path('<uuid:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('<uuid:pk>/resources/', ServiceResourcesView.as_view(), name='service-resources'),
    path('<uuid:pk>/availability/', ServiceAvailabilityView.as_view(), name='service-availability'),
    path('<uuid:pk>/next-available/', ServiceNextAvailableView.as_view(), name='service-next-available'),
]
