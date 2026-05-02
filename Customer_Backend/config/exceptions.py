"""
Custom DRF exception handler.
Returns a consistent error envelope:
  { "error": true, "code": "...", "message": "...", "detail": {...} }
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data

        # Flatten DRF's default structures into our envelope
        if isinstance(data, dict) and 'detail' in data:
            message = str(data['detail'])
            code = getattr(data['detail'], 'code', 'ERROR')
        elif isinstance(data, list):
            message = '; '.join(str(e) for e in data)
            code = 'VALIDATION_ERROR'
        else:
            message = str(data)
            code = 'ERROR'

        response.data = {
            'error': True,
            'code': str(code).upper(),
            'message': message,
        }

    return response
