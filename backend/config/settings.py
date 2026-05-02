import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-secret-change-me')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'bookings',
    'reports',
    'admin_panel',
    'notifications',
    'ai_engine',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'middleware.supabase_auth.SupabaseAuthMiddleware',
]

ROOT_URLCONF = 'config.urls'

# --- Database: Supabase PostgreSQL ---
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
    )
}

# --- DRF ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'middleware.supabase_auth.SupabaseAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler',
}

# --- CORS ---
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
]
CORS_ALLOW_CREDENTIALS = True

# --- Celery ---
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Kolkata'

CELERY_BEAT_SCHEDULE = {
    'expire-unpaid-bookings': {
        'task': 'notifications.tasks.expire_unpaid_bookings',
        'schedule': 300.0,  # every 5 min
    },
    'send-appointment-reminders': {
        'task': 'notifications.tasks.send_appointment_reminders',
        'schedule': 1800.0,  # every 30 min
    },
    'mark-completed-bookings': {
        'task': 'notifications.tasks.mark_completed_bookings',
        'schedule': 86400.0,  # daily
    },
    'cleanup-expired-sessions': {
        'task': 'notifications.tasks.cleanup_expired_sessions',
        'schedule': 3600.0,  # hourly
    },
}

# --- External API keys ---
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
XAI_API_KEY = os.getenv('XAI_API_KEY')
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
