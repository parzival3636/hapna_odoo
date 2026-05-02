from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('organizations/', views.OrganizationListView.as_view(), name='organization-list'),
    path('join-organization/', views.JoinOrganizationView.as_view(), name='join-organization'),
    # Google Calendar OAuth
    path('google-auth/url/', views.GoogleAuthURLView.as_view(), name='google-auth-url'),
    path('google-auth/callback/', views.GoogleAuthCallbackView.as_view(), name='google-auth-callback'),
]
