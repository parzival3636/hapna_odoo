from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('users/<uuid:pk>/activate/', views.AdminUserActivateView.as_view(), name='admin-activate'),
    path('users/<uuid:pk>/deactivate/', views.AdminUserDeactivateView.as_view(), name='admin-deactivate'),
    path('users/<uuid:pk>/role/', views.AdminUserRoleView.as_view(), name='admin-role'),
]
