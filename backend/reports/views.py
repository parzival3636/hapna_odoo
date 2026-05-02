"""Reports views — analytics and no-show risk for organiser dashboard."""
from datetime import datetime, timedelta
from django.db import connection
from django.db.models import Count, Q, F
from rest_framework.views import APIView
from rest_framework.response import Response
from bookings.models import Booking, Service


def get_organiser_services(user):
    if user.role == 'admin':
        return Service.objects.values_list('id', flat=True)
    return Service.objects.filter(organization=user.organization).values_list('id', flat=True)


class ReportsSummaryView(APIView):
    """
    GET /api/reports/summary/?service=<id>
    Returns: totals, month comparison, rates.
    """

    def get(self, request):
        service_ids = list(get_organiser_services(request.user))
        service_filter = request.query_params.get('service')
        if service_filter:
            service_ids = [service_filter]

        now = datetime.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

        base_qs = Booking.objects.filter(service_id__in=service_ids)

        # Current month
        current_qs = base_qs.filter(slot_date__gte=current_month_start.date())
        current_total = current_qs.count()
        current_confirmed = current_qs.filter(status='confirmed').count()
        current_cancelled = current_qs.filter(status='cancelled').count()
        current_no_show = current_qs.filter(status='no_show').count()

        # Last month
        last_qs = base_qs.filter(
            slot_date__gte=last_month_start.date(),
            slot_date__lt=current_month_start.date(),
        )
        last_total = last_qs.count()

        # Percentage change
        pct_change = 0
        if last_total > 0:
            pct_change = round(((current_total - last_total) / last_total) * 100, 1)

        # Rates
        cancellation_rate = round((current_cancelled / current_total * 100), 1) if current_total else 0
        no_show_rate = round((current_no_show / current_total * 100), 1) if current_total else 0

        # Upcoming 7 days
        upcoming = base_qs.filter(
            slot_date__gte=now.date(),
            slot_date__lte=(now + timedelta(days=7)).date(),
            status__in=['confirmed', 'pending'],
        ).order_by('slot_date', 'slot_start')[:5]

        upcoming_list = [
            {
                'id': str(b.id),
                'service_title': b.service.title if b.service else '',
                'customer_name': b.customer.get_full_name() or b.customer.username,
                'slot_date': str(b.slot_date),
                'slot_start': str(b.slot_start),
                'status': b.status,
                'no_show_risk_score': b.no_show_risk_score,
            }
            for b in upcoming
        ]

        return Response({
            'current_month_meetings': current_total,
            'last_month_meetings': last_total,
            'pct_change': pct_change,
            'cancellation_rate': cancellation_rate,
            'no_show_rate': no_show_rate,
            'upcoming_7_days': upcoming_list,
        })


class ReportsChartsView(APIView):
    """
    GET /api/reports/charts/?service=<id>
    Returns: daily_bookings, by_service, by_status, peak_hours.
    """

    def get(self, request):
        service_ids = list(get_organiser_services(request.user))
        service_filter = request.query_params.get('service')
        if service_filter:
            service_ids = [service_filter]

        base_qs = Booking.objects.filter(service_id__in=service_ids)
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)

        # Daily bookings (last 30 days)
        daily = (
            base_qs.filter(slot_date__gte=thirty_days_ago.date())
            .values('slot_date')
            .annotate(count=Count('id'))
            .order_by('slot_date')
        )
        daily_bookings = [{'date': str(d['slot_date']), 'count': d['count']} for d in daily]

        # By service
        by_service = []
        for sid in service_ids:
            svc = Service.objects.filter(id=sid).first()
            count = base_qs.filter(service_id=sid).count()
            if svc:
                by_service.append({'title': svc.title, 'count': count})

        # By status
        by_status = (
            base_qs.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
        status_data = [{'status': s['status'], 'count': s['count']} for s in by_status]

        # Peak hours — raw SQL for EXTRACT
        peak_hours = []
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(service_ids))
            cursor.execute(f"""
                SELECT
                    EXTRACT(DOW FROM slot_date) AS dow,
                    EXTRACT(HOUR FROM slot_start) AS hour,
                    COUNT(*) AS cnt
                FROM bookings
                WHERE service_id::text IN ({placeholders})
                  AND status IN ('confirmed', 'completed')
                GROUP BY dow, hour
                ORDER BY cnt DESC
                LIMIT 50
            """, [str(s) for s in service_ids])
            for row in cursor.fetchall():
                peak_hours.append({
                    'day_of_week': int(row[0]),
                    'hour': int(row[1]),
                    'count': row[2],
                })

        return Response({
            'daily_bookings': daily_bookings,
            'by_service': by_service,
            'by_status': status_data,
            'peak_hours': peak_hours,
        })


class NoShowRiskView(APIView):
    """
    GET /api/reports/no-show-risk/?service=<id>&date=<d>
    Upcoming bookings sorted by risk score.
    """

    def get(self, request):
        service_ids = list(get_organiser_services(request.user))
        service_filter = request.query_params.get('service')
        if service_filter:
            service_ids = [service_filter]

        date_filter = request.query_params.get('date')
        qs = Booking.objects.filter(
            service_id__in=service_ids,
            status__in=['confirmed', 'pending'],
            no_show_risk_score__isnull=False,
        )

        if date_filter:
            qs = qs.filter(slot_date=date_filter)
        else:
            qs = qs.filter(slot_date__gte=datetime.now().date())

        qs = qs.order_by('-no_show_risk_score')[:50]

        results = []
        for b in qs:
            score = b.no_show_risk_score or 0
            if score > 0.65:
                risk_level = 'high'
            elif score > 0.35:
                risk_level = 'medium'
            else:
                risk_level = 'low'

            results.append({
                'id': str(b.id),
                'customer_name': b.customer.get_full_name() or b.customer.username,
                'service_title': b.service.title if b.service else '',
                'slot_date': str(b.slot_date),
                'slot_start': str(b.slot_start),
                'risk_score': round(score, 2),
                'risk_level': risk_level,
                'booking_channel': b.booking_channel,
                'payment_status': b.payment_status,
            })

        return Response({'meetings': results})
