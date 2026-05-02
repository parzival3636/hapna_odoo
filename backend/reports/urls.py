from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.ReportsSummaryView.as_view(), name='reports-summary'),
    path('charts/', views.ReportsChartsView.as_view(), name='reports-charts'),
    path('no-show-risk/', views.NoShowRiskView.as_view(), name='no-show-risk'),
]
