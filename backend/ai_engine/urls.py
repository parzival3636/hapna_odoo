from django.urls import path
from . import views

urlpatterns = [
    path('suggest-questions/', views.SuggestQuestionsView.as_view(), name='suggest-questions'),
]
