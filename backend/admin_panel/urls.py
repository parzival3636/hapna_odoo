from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('users/<uuid:pk>/activate/', views.AdminUserActivateView.as_view(), name='admin-activate'),
    path('users/<uuid:pk>/deactivate/', views.AdminUserDeactivateView.as_view(), name='admin-deactivate'),
    path('users/<uuid:pk>/role/', views.AdminUserRoleView.as_view(), name='admin-role'),
    path('users/<uuid:pk>/approve-role/', views.AdminApproveRoleView.as_view(), name='admin-approve-role'),
    path('organizations/', views.AdminOrganizationView.as_view(), name='admin-organization-create'),
    path('pending-services/', views.AdminPendingServiceListView.as_view(), name='admin-pending-services'),
    path('services/<uuid:pk>/approve/', views.AdminServiceApproveView.as_view(), name='admin-service-approve'),
    path('services/<uuid:pk>/reject/', views.AdminServiceRejectView.as_view(), name='admin-service-reject'),
]
