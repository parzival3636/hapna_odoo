from django.urls import path
from .views import (
    WaitlistJoinView,
    WaitlistMyEntriesView,
    WaitlistLeaveView,
    WaitlistClaimView,
)

urlpatterns = [
    path('', WaitlistJoinView.as_view(), name='waitlist-join'),
    path('mine/', WaitlistMyEntriesView.as_view(), name='waitlist-mine'),
    path('claim/<str:token>/', WaitlistClaimView.as_view(), name='waitlist-claim'),
    path('<uuid:pk>/', WaitlistLeaveView.as_view(), name='waitlist-leave'),
]
