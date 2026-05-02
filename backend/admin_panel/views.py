"""Admin panel views — platform stats + user management."""
from datetime import datetime, timedelta
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from bookings.models import Booking
from services.models import Service

User = get_user_model()


class IsAdmin:
    @staticmethod
    def check(user):
        return user.role == 'admin'


class AdminStatsView(APIView):
    """GET /api/admin/stats/ — Platform-wide statistics."""

    def get(self, request):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        now = datetime.now()
        today = now.date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        return Response({
            'total_users': User.objects.count(),
            'total_organisers': User.objects.filter(role='organiser').count(),
            'total_customers': User.objects.filter(role='customer').count(),
            'total_bookings_today': Booking.objects.filter(
                created_at__date=today
            ).exclude(status='cancelled').count(),
            'total_bookings_this_week': Booking.objects.filter(
                created_at__date__gte=week_start
            ).exclude(status='cancelled').count(),
            'total_bookings_this_month': Booking.objects.filter(
                created_at__date__gte=month_start
            ).exclude(status='cancelled').count(),
            'total_active_services': Service.objects.filter(is_published=True).count(),
        })


class AdminUserListView(APIView):
    """GET /api/admin/users/ — Paginated user list with booking counts."""

    def get(self, request):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        role_filter = request.query_params.get('role')
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        users = User.objects.all().order_by('-date_joined')

        if role_filter:
            users = users.filter(role=role_filter)

        if search:
            users = users.filter(user_id__icontains=search)

        total = users.count()
        start = (page - 1) * page_size
        users = users[start:start + page_size]

        results = []
        for u in users:
            booking_count = Booking.objects.filter(customer=u).count()
            results.append({
                'id': str(u.id),
                'username': u.username,
                'role': u.role,
                'is_active': u.is_active,
                'timezone': u.timezone,
                'phone_number': u.phone_number,
                'created_at': u.date_joined.isoformat() if u.date_joined else None,
                'total_bookings': booking_count,
            })

        return Response({
            'total': total,
            'page': page,
            'page_size': page_size,
            'results': results,
        })


class AdminUserActivateView(APIView):
    """PATCH /api/admin/users/<id>/activate/ — Set is_active=True."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        user.is_active = True
        user.save()
        return Response({'id': str(user.id), 'is_active': True})


class AdminUserDeactivateView(APIView):
    """PATCH /api/admin/users/<id>/deactivate/ — Set is_active=False."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        # Cannot deactivate yourself
        if user.id == request.user.id:
            return Response({
                'error': True, 'code': 'FORBIDDEN',
                'message': 'Cannot deactivate your own account',
            }, status=400)

        user.is_active = False
        user.save()
        return Response({'id': str(user.id), 'is_active': False})


class AdminUserRoleView(APIView):
    """PATCH /api/admin/users/<id>/role/ — Change user role."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        new_role = request.data.get('role')
        if new_role not in ('customer', 'organiser', 'admin'):
            return Response({
                'error': True, 'code': 'VALIDATION_ERROR',
                'message': 'Role must be: customer, organiser, or admin',
            }, status=400)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        # Cannot change own role
        if user.id == request.user.id:
            return Response({
                'error': True, 'code': 'FORBIDDEN',
                'message': 'Cannot change your own role',
            }, status=400)

        # Prevent removing last admin
        if user.role == 'admin' and new_role != 'admin':
            admin_count = User.objects.filter(role='admin').count()
            if admin_count <= 1:
                return Response({
                    'error': True, 'code': 'FORBIDDEN',
                    'message': 'Cannot remove the last admin',
                }, status=400)

        user.role = new_role
        user.save()
        return Response({'id': str(user.id), 'role': new_role})


from users.models import Organization
from users.serializers import OrganizationSerializer

class AdminOrganizationView(APIView):
    """GET /api/admin/organizations/ — List organizations.
       POST /api/admin/organizations/ — Create an organization."""

    def get(self, request):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)
        orgs = Organization.objects.all()
        serializer = OrganizationSerializer(orgs, many=True)
        return Response({'results': serializer.data})

    def post(self, request):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            org = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminApproveRoleView(APIView):
    """PATCH /api/admin/users/<id>/approve-role/ — Approve pending organiser."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        if user.role != 'pending_organiser':
            return Response({'error': True, 'message': 'User is not pending approval'}, status=400)

        user.role = 'organiser'
        user.save()
        return Response({'id': str(user.id), 'role': user.role, 'message': 'Organiser role approved'})

class AdminPendingServiceListView(APIView):
    """GET /api/admin/pending-services/ — View all pending services."""

    def get(self, request):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        services = Service.objects.filter(approval_status='pending')
        results = [
            {
                'id': str(s.id),
                'title': s.title,
                'organization': s.organization.name if s.organization else 'Unknown',
                'created_at': s.created_at.isoformat()
            } for s in services
        ]
        return Response({'results': results})

class AdminServiceApproveView(APIView):
    """PATCH /api/admin/services/<id>/approve/ — Approve a service listing."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        service.approval_status = 'approved'
        service.save()
        return Response({'id': str(service.id), 'approval_status': 'approved'})

class AdminServiceRejectView(APIView):
    """PATCH /api/admin/services/<id>/reject/ — Reject a service listing."""

    def patch(self, request, pk):
        if not IsAdmin.check(request.user):
            return Response({'error': True, 'code': 'FORBIDDEN'}, status=403)

        try:
            service = Service.objects.get(id=pk)
        except Service.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        reason = request.data.get('reason', '')
        service.approval_status = 'rejected'
        # Can store reason in description or a new field, for now just reject
        service.save()
        return Response({'id': str(service.id), 'approval_status': 'rejected', 'reason': reason})
