from django.urls import path
from .views import AutofillView, CustomerProfileView

urlpatterns = [
    path('autofill/', AutofillView.as_view(), name='profile-autofill'),
    path('me/', CustomerProfileView.as_view(), name='profile-me'),
]
