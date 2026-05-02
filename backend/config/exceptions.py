from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """Standardized error response format."""
    response = exception_handler(exc, context)

    if response is not None:
        error_code = 'UNKNOWN_ERROR'
        if response.status_code == 400:
            error_code = 'VALIDATION_ERROR'
        elif response.status_code == 401:
            error_code = 'UNAUTHORIZED'
        elif response.status_code == 403:
            error_code = 'FORBIDDEN'
        elif response.status_code == 404:
            error_code = 'NOT_FOUND'
        elif response.status_code == 409:
            error_code = 'CONFLICT'

        response.data = {
            'error': True,
            'code': error_code,
            'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
            'details': response.data if isinstance(response.data, dict) else {'errors': response.data},
        }

    return response
