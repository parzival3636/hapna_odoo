from django.urls import path
from .views import AutofillView

urlpatterns = [
    path('autofill/', AutofillView.as_view(), name='profile-autofill'),
]
