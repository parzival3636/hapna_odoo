"""
Services views — A1 Service Browsing + Availability.

Public endpoints (no auth required):
  GET /api/services/
  GET /api/services/<id>/
  GET /api/services/<id>/resources/
  GET /api/services/<id>/availability/?date=YYYY-MM-DD
  GET /api/services/<id>/next-available/?from=YYYY-MM-DD&count=3
"""
from datetime import date, datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Service, Resource
from .serializers import (
    ServiceListSerializer, ServiceDetailSerializer,
    ResourceSerializer, SlotSerializer,
)
from .availability import compute_slot_availability, find_next_available_dates


class ServiceListView(APIView):
    """
    GET /api/services/
    Query params: ?search=<text>&location=<text>&appointment_type=user|resource
    No authentication required — published services are public.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        services = Service.objects.filter(is_published=True)

        search = request.query_params.get('search', '').strip()
        if search:
            services = services.filter(title__icontains=search)

        location = request.query_params.get('location', '').strip()
        if location:
            services = services.filter(location__icontains=location)

        appt_type = request.query_params.get('appointment_type', '').strip()
        if appt_type in ('user', 'resource'):
            services = services.filter(appointment_type=appt_type)

        serializer = ServiceListSerializer(services, many=True)
        return Response({'results': serializer.data, 'total': services.count()})


class ServiceDetailView(APIView):
    """
    GET /api/services/<id>/
    Full detail including questions and resources.
    No authentication required.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response(
                {'error': True, 'code': 'NOT_FOUND', 'message': 'Service not found'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ServiceDetailSerializer(service)
        return Response(serializer.data)


class ServiceResourcesView(APIView):
    """
    GET /api/services/<id>/resources/
    List active resources for resource-type services.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        resources = Resource.objects.filter(service_id=service.id, is_active=True)
        return Response(ResourceSerializer(resources, many=True).data)


class ServiceAvailabilityView(APIView):
    """
    GET /api/services/<id>/availability/?date=YYYY-MM-DD&resource_id=<uuid>

    Returns the slot grid for the given date, with remaining capacity and
    colour-coding status for each slot.

    No authentication required — slot grid is publicly visible.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {'error': True, 'code': 'MISSING_DATE', 'message': 'date param required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': True, 'code': 'INVALID_DATE', 'message': 'Use format YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target_date < date.today():
            return Response(
                {'error': True, 'code': 'DATE_IN_PAST', 'message': 'Cannot book past dates'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        resource_id = request.query_params.get('resource_id') or None

        slots = compute_slot_availability(str(service.id), target_date, resource_id)
        return Response({
            'service_id': str(service.id),
            'date': date_str,
            'timezone': service.timezone,
            'slots': slots,
        })


class ServiceNextAvailableView(APIView):
    """
    GET /api/services/<id>/next-available/?from=YYYY-MM-DD&count=3&resource_id=<uuid>

    Returns up to `count` (default 3) nearest dates with at least one open slot.
    Used by:
      - A1: date picker highlighting
      - A4: "No slots" smart experience chips
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        from_str = request.query_params.get('from')
        from_date = None
        if from_str:
            try:
                from_date = datetime.strptime(from_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        count = int(request.query_params.get('count', 3))
        resource_id = request.query_params.get('resource_id') or None

        next_dates = find_next_available_dates(
            str(service.id), from_date, count, resource_id
        )
        return Response({
            'service_id': str(service.id),
            'next_available_dates': next_dates,
        })
