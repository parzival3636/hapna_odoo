"""
Customer_Backend JWT authentication.

Uses simplejwt's UntypedToken to validate the token signature with the same
SECRET_KEY as the main backend — without requiring token_type checks.
This means any valid access token from the main backend (port 8000) works here.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class DummyUser:
    """Lightweight user object — Customer_Backend has no users table."""
    def __init__(self, user_id):
        self.user_id = user_id
        self.id = user_id
        self.pk = user_id
        self.is_authenticated = True
        self.is_active = True

    def __str__(self):
        return f"CustomerUser({self.user_id})"


class CustomerJWTAuthentication(BaseAuthentication):
    """
    Validates Bearer tokens issued by the main backend using simplejwt.
    Uses UntypedToken so we validate the signature and expiry without
    enforcing token_type — eliminating 'Given token not valid for any token type'.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        raw_token = parts[1]

        try:
            # UntypedToken: validates signature + expiry, skips token_type check
            token = UntypedToken(raw_token)
        except (InvalidToken, TokenError) as e:
            raise AuthenticationFailed(str(e))

        user_id = token.payload.get("user_id")
        if not user_id:
            raise AuthenticationFailed("Token missing user_id claim.")

        return (DummyUser(user_id), token)

    def authenticate_header(self, request):
        return "Bearer"


# Alias so any code that imports the old name still works
SimpleJWTAuthentication = CustomerJWTAuthentication
