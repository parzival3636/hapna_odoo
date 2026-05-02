import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Reuse the existing backend's middleware (no copy needed) ──────────────────
# Add the sibling `backend/` folder to sys.path so that:
#   'middleware.supabase_auth' resolves to backend/middleware/supabase_auth.py
BACKEND_DIR = BASE_DIR.parent / 'backend'
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
# ─────────────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'dev-secret-change-me')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    # Customer-side apps
    'services',
    'slots',
    'bookings_customer',
    'payments_customer',
    'profile_autofill',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # Reused from backend/ via sys.path injection above
    'middleware.supabase_auth.SupabaseAuthMiddleware',
]

ROOT_URLCONF = 'config.urls'

# ── Database: Supabase PostgreSQL ─────────────────────────────────────────────
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
    )
}

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # Reused from backend/ via sys.path injection above
        'middleware.supabase_auth.SupabaseAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'config.exceptions.custom_exception_handler',
}

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
]
CORS_ALLOW_CREDENTIALS = True

# ── Celery ────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Kolkata'

CELERY_BEAT_SCHEDULE = {
    # Clean up expired slot holds every 60 seconds
    'cleanup-expired-holds': {
        'task': 'slots.tasks.cleanup_expired_holds',
        'schedule': 60.0,
    },
}

# ── External keys ─────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
