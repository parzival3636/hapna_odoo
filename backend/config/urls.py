from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/users/', include('users.urls')),
    path('api/services/', include('services.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/ai/', include('ai_engine.urls')),
]
