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

from django.http import JsonResponse
from django.conf import settings
def debug_key(request):
    return JsonResponse({'key': settings.SECRET_KEY[:10]})
urlpatterns.append(path('debug/', debug_key))
