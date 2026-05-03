import os
import django
import sys
from datetime import datetime, timedelta, date, time
from django.utils import timezone
import uuid

# Set up Django environment
sys.path.append('d:/Hackathons/hapna_odoo/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, Organization
from services.models import Service, ServiceQuestion
from bookings.models import Booking

def create_mock_data():
    print("Fetching or creating users...")
    
    # Create or get users
    customer, _ = User.objects.get_or_create(
        email='rohanlangar333@gmail.com',
        defaults={'username': 'rohan_cust', 'first_name': 'Rohan', 'last_name': 'Customer', 'role': 'customer'}
    )
    
    org_user, _ = User.objects.get_or_create(
        email='org@gmail.com',
        defaults={'username': 'org_user', 'first_name': 'Demo', 'last_name': 'Organizer', 'role': 'organiser'}
    )
    
    admin, _ = User.objects.get_or_create(
        email='rohanlangar31@gmail.com',
        defaults={'username': 'rohan_admin', 'first_name': 'Rohan', 'last_name': 'Admin', 'role': 'admin'}
    )
    
    print("Ensuring roles are correct...")
    customer.role = 'customer'
    customer.save()
    org_user.role = 'organiser'
    org_user.save()
    admin.role = 'admin'
    admin.save()
    
    # Ensure Organization exists
    org, created = Organization.objects.get_or_create(
        name='Premium Care Clinics',
    )
    if created or org_user.organization != org:
        org_user.organization = org
        org_user.save()

    print("Creating mock services for Organizer...")
    # Delete existing mock services for this org to avoid duplicates if run multiple times
    Service.objects.filter(organization=org).delete()

    svc1 = Service.objects.create(
        organization=org,
        title='Executive Health Consultation',
        description='A comprehensive health consultation focusing on preventative care and wellness optimization for busy professionals.',
        duration_minutes=60,
        appointment_type='user',
        manual_confirmation=False,
        advance_payment_required=True,
        booking_fee=2500.00,
        capacity_per_slot=1,
        intro_message='Welcome to Premium Care. We look forward to your consultation.',
        confirmation_message='Your consultation is confirmed. Please arrive 10 minutes early.'
    )
    
    svc2 = Service.objects.create(
        organization=org,
        title='Group Therapy Session',
        description='A guided 90-minute group therapy session led by expert psychologists. Max 5 participants per session.',
        duration_minutes=90,
        appointment_type='user',
        manual_confirmation=True,
        advance_payment_required=False,
        capacity_per_slot=5,
        intro_message='Welcome to our Group Therapy session.',
        confirmation_message='Your spot is reserved. Awaiting organizer confirmation.'
    )
    
    svc3 = Service.objects.create(
        organization=org,
        title='Follow-up Review',
        description='A quick 15-minute follow-up session to review test results and discuss ongoing treatment plans.',
        duration_minutes=15,
        appointment_type='user',
        manual_confirmation=False,
        advance_payment_required=False,
        capacity_per_slot=1,
        intro_message='Welcome back to Premium Care.',
        confirmation_message='Your follow-up is confirmed.'
    )
    
    print("Creating mock questions for services...")
    ServiceQuestion.objects.create(
        service=svc1, question_text="Do you have any pre-existing medical conditions?",
        question_type="text", is_required=True, display_order=1
    )
    ServiceQuestion.objects.create(
        service=svc2, question_text="Have you attended a group session before?",
        question_type="radio", options=["Yes", "No"], is_required=True, display_order=1
    )

    print("Creating mock bookings for Customer...")
    # Bookings for customer
    today = date.today()
    tomorrow = today + timedelta(days=1)
    day_after = today + timedelta(days=2)
    
    # Cancel previous bookings to prevent clutter
    Booking.objects.filter(customer=customer).delete()

    Booking.objects.create(
        service=svc1,
        customer=customer,
        slot_date=tomorrow,
        slot_start=time(10, 0),
        slot_end=time(11, 0),
        status='confirmed',
        payment_status='paid',
        booking_channel='web',
        notes='Patient requested a female doctor if possible.',
        capacity_booked=1,
        confirmation_token=str(uuid.uuid4())
    )
    
    Booking.objects.create(
        service=svc2,
        customer=customer,
        slot_date=day_after,
        slot_start=time(14, 0),
        slot_end=time(15, 30),
        status='pending',
        payment_status='unpaid',
        booking_channel='whatsapp',
        notes='',
        capacity_booked=1,
        confirmation_token=str(uuid.uuid4())
    )
    
    Booking.objects.create(
        service=svc3,
        customer=customer,
        slot_date=today,
        slot_start=time(9, 0),
        slot_end=time(9, 15),
        status='completed',
        payment_status='unpaid',
        booking_channel='web',
        notes='Patient arrived on time. Next follow-up in 3 months.',
        capacity_booked=1,
        confirmation_token=str(uuid.uuid4())
    )
    
    print("Mock data generated successfully!")

if __name__ == '__main__':
    create_mock_data()
