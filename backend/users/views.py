from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import Organization, GoogleCredential
from .serializers import UserSerializer, OrganizationSerializer

# Google Auth Imports
import os
import requests
from django.shortcuts import redirect
from django.utils.http import urlencode

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'id': user.id, 'username': user.username, 'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [AllowAny]

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'organization': user.organization_id,
        })

class JoinOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org_id = request.data.get('organization_id')
        if not org_id:
            return Response({'error': True, 'message': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'error': True, 'message': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user.organization = org
        user.role = 'pending_organiser'
        user.save()

        return Response({
            'message': f'Successfully requested to join {org.name}. Awaiting admin approval.',
            'organization_id': org.id,
            'role': user.role
        })


# --- Google Calendar OAuth Views ---

class GoogleAuthURLView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = {
            'client_id': os.getenv("GOOGLE_CLIENT_ID"),
            'redirect_uri': os.getenv("GOOGLE_REDIRECT_URI"),
            'response_type': 'code',
            'scope': 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': str(request.user.id)
        }
        auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
        return Response({'url': auth_url})


class GoogleAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        error = request.query_params.get('error')
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')

        if error:
            # User likely cancelled or denied access
            return redirect(f"{frontend_url}/dashboard/settings?google_sync=error")

        code = request.query_params.get('code')
        user_id = request.query_params.get('state')
        
        if not code or not user_id:
            return redirect(f"{frontend_url}/dashboard/settings?google_sync=error")

        # Exchange code for token
        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                'code': code,
                'client_id': os.getenv("GOOGLE_CLIENT_ID"),
                'client_secret': os.getenv("GOOGLE_CLIENT_SECRET"),
                'redirect_uri': os.getenv("GOOGLE_REDIRECT_URI"),
                'grant_type': 'authorization_code'
            }
        )

        if not token_response.ok:
            return redirect(f"{frontend_url}/dashboard/settings?google_sync=error")

        token_data = token_response.json()

        try:
            user = User.objects.get(id=user_id)
            GoogleCredential.objects.update_or_create(
                user=user,
                defaults={
                    'token': token_data.get('access_token'),
                    'refresh_token': token_data.get('refresh_token'),
                    'token_uri': "https://oauth2.googleapis.com/token",
                    'client_id': os.getenv("GOOGLE_CLIENT_ID"),
                    'client_secret': os.getenv("GOOGLE_CLIENT_SECRET"),
                    'scopes': token_data.get('scope', 'https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/calendar.events')
                }
            )
            user.google_calendar_connected = True
            user.save()
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        return redirect(f"{frontend_url}/dashboard/settings?google_sync=success")
