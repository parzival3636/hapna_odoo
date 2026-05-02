"""Admin panel views — platform stats + user management."""
from datetime import datetime, timedelta
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bookings.models import UserProfile, Booking, Service


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
            'total_users': UserProfile.objects.count(),
            'total_organisers': UserProfile.objects.filter(role='organiser').count(),
            'total_customers': UserProfile.objects.filter(role='customer').count(),
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

        users = UserProfile.objects.all().order_by('-created_at')

        if role_filter:
            users = users.filter(role=role_filter)

        if search:
            users = users.filter(user_id__icontains=search)

        total = users.count()
        start = (page - 1) * page_size
        users = users[start:start + page_size]

        results = []
        for u in users:
            booking_count = Booking.objects.filter(customer_id=u.user_id).count()
            results.append({
                'id': str(u.id),
                'user_id': u.user_id,
                'role': u.role,
                'is_active': u.is_active,
                'timezone': u.timezone,
                'phone_number': u.phone_number,
                'created_at': u.created_at.isoformat() if u.created_at else None,
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
            user = UserProfile.objects.get(id=pk)
        except UserProfile.DoesNotExist:
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
            user = UserProfile.objects.get(id=pk)
        except UserProfile.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        # Cannot deactivate yourself
        if user.user_id == request.user.user_id:
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
            user = UserProfile.objects.get(id=pk)
        except UserProfile.DoesNotExist:
            return Response({'error': True, 'code': 'NOT_FOUND'}, status=404)

        # Cannot change own role
        if user.user_id == request.user.user_id:
            return Response({
                'error': True, 'code': 'FORBIDDEN',
                'message': 'Cannot change your own role',
            }, status=400)

        # Prevent removing last admin
        if user.role == 'admin' and new_role != 'admin':
            admin_count = UserProfile.objects.filter(role='admin').count()
            if admin_count <= 1:
                return Response({
                    'error': True, 'code': 'FORBIDDEN',
                    'message': 'Cannot remove the last admin',
                }, status=400)

        user.role = new_role
        user.save()
        return Response({'id': str(user.id), 'role': new_role})
