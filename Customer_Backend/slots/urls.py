from django.urls import path
from .views import SlotHoldCreateView, SlotHoldRefreshView, SlotHoldDeleteView

urlpatterns = [
    path('hold/', SlotHoldCreateView.as_view(), name='slot-hold-create'),
    path('hold/<uuid:pk>/', SlotHoldRefreshView.as_view(), name='slot-hold-refresh'),
    # DELETE uses same URL as PATCH — dispatch by method
    path('hold/<uuid:pk>/delete/', SlotHoldDeleteView.as_view(), name='slot-hold-delete'),
]
