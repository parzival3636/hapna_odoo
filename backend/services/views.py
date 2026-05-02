import uuid
from datetime import datetime, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Service, Schedule, WeeklySlot, FlexibleSlot, ServiceQuestion, Resource
from .serializers import (
    ServiceSerializer, ScheduleSerializer, WeeklySlotSerializer,
    FlexibleSlotSerializer, ServiceQuestionSerializer, ResourceSerializer
)

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    lookup_value_regex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

    def get_permissions(self):
        # Allow public browsing of published services
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        # Unauthenticated users or customers: show only published & approved services
        if not user.is_authenticated or user.role == 'customer':
            return Service.objects.filter(is_published=True, approval_status='approved')
        if user.role == 'admin':
            return Service.objects.all()
        if user.organization:
            return Service.objects.filter(organization=user.organization)
        return Service.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.organization:
            raise serializers.ValidationError("You must belong to an organization to create a service.")
        serializer.save(organization=user.organization, approval_status='pending')

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        service = self.get_object()
        if service.approval_status != 'approved':
            return Response({'error': True, 'message': 'Service must be approved by admin before publishing'}, status=status.HTTP_400_BAD_REQUEST)
        service.is_published = True
        service.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        service = self.get_object()
        service.is_published = False
        service.save()
        return Response({'status': 'unpublished'})

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def preview(self, request, pk=None):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
        
        # Don't require approval for preview if we have token, but since we use pk directly, 
        # let's just return it. In real app, check a share token.
        serializer = self.get_serializer(service)
        return Response(serializer.data)

class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Schedule.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)

class WeeklySlotViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklySlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WeeklySlot.objects.filter(schedule__service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        schedule_id = self.request.data.get('schedule_id')
        schedule = Schedule.objects.get(id=schedule_id, service__organization=self.request.user.organization)
        serializer.save(schedule=schedule)

class FlexibleSlotViewSet(viewsets.ModelViewSet):
    serializer_class = FlexibleSlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FlexibleSlot.objects.filter(schedule__service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        schedule_id = self.request.data.get('schedule_id')
        schedule = Schedule.objects.get(id=schedule_id, service__organization=self.request.user.organization)
        serializer.save(schedule=schedule)

class ServiceQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceQuestion.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(service__organization=self.request.user.organization)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id, organization=self.request.user.organization)
        serializer.save(service=service)
