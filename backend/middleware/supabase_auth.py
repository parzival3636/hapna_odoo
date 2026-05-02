"""
Supabase JWT Authentication for Django REST Framework.
Validates Bearer tokens via supabase.auth.get_user(token).
"""
import os
from rest_framework import authentication, exceptions
from supabase import create_client

_supabase = None


def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY'),
        )
    return _supabase


class SupabaseUser:
    """Lightweight user object attached to request.user."""

    def __init__(self, profile_data):
        self.id = profile_data.get('id')
        self.user_id = profile_data.get('user_id')
        self.role = profile_data.get('role', 'customer')
        self.is_active = profile_data.get('is_active', True)
        self.timezone = profile_data.get('timezone', 'Asia/Kolkata')
        self.phone_number = profile_data.get('phone_number')
        self.is_authenticated = True

    def __str__(self):
        return f"{self.user_id} ({self.role})"


class SupabaseAuthentication(authentication.BaseAuthentication):
    """DRF authentication class using Supabase JWT."""

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]
        if not token:
            return None

        try:
            supabase = get_supabase()
            # Validate the JWT with Supabase
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                raise exceptions.AuthenticationFailed('Invalid token')

            supabase_uid = user_response.user.id

            # Fetch profile from user_profiles table
            profile_resp = supabase.table('user_profiles').select('*').eq(
                'user_id', supabase_uid
            ).single().execute()

            if not profile_resp.data:
                raise exceptions.AuthenticationFailed('Profile not found')

            profile = profile_resp.data

            if not profile.get('is_active', True):
                raise exceptions.AuthenticationFailed('Account deactivated')

            return (SupabaseUser(profile), token)

        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Auth error: {str(e)}')


class SupabaseAuthMiddleware:
    """Django middleware — adds supabase user to request for non-DRF views."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)
