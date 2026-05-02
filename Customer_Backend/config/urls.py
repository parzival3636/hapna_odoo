from django.urls import path, include

urlpatterns = [
    path('api/services/',  include('services.urls')),
    path('api/slots/',     include('slots.urls')),
    path('api/bookings/',  include('bookings_customer.urls')),
    path('api/payments/',  include('payments_customer.urls')),
    path('api/profile/',   include('profile_autofill.urls')),
    path('api/waitlist/',  include('waitlist.urls')),
]
