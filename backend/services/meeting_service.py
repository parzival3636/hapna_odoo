"""
Meeting Service — generates meeting IDs and links for Google Meet and Zoom.

For a hackathon/demo, we generate deterministic-looking meeting IDs
instead of calling real OAuth APIs. In production, these would call
the Google Calendar API or Zoom API respectively.
"""
import uuid
import hashlib
from datetime import datetime


def _short_hash(seed: str, length: int = 10) -> str:
    """Deterministic short hash from a seed string."""
    return hashlib.sha256(seed.encode()).hexdigest()[:length]


def generate_jitsi_meeting(booking_id: str, slot_date, slot_start) -> dict:
    """
    Generate a Jitsi Meet link.
    Jitsi does not require any API authentication!
    """
    import urllib.parse
    
    # Create a unique room name
    raw_name = f"HapnaBooking-{booking_id[:8]}-{slot_date}"
    room_name = urllib.parse.quote_plus(raw_name)
    
    return {
        "meeting_id": raw_name,
        "meeting_link": f"https://meet.jit.si/{room_name}",
    }


def generate_zoom_meeting(booking_id: str, slot_date, slot_start) -> dict:
    """
    Generate a real Zoom meeting using Server-to-Server OAuth.
    If keys are missing, falls back to simulated logic for demo purposes.
    """
    import os
    import requests
    
    account_id = os.getenv('ZOOM_ACCOUNT_ID')
    client_id = os.getenv('ZOOM_CLIENT_ID')
    client_secret = os.getenv('ZOOM_CLIENT_SECRET')
    
    if not (account_id and client_id and client_secret):
        # Fallback to simulated Zoom link for demo if keys are missing
        seed = f"zoom-{booking_id}-{slot_date}-{slot_start}"
        numeric_hash = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
        meeting_id = str(numeric_hash)[:10]
        formatted_id = f"{meeting_id[:3]} {meeting_id[3:7]} {meeting_id[7:]}"
        return {
            "meeting_id": formatted_id,
            "meeting_link": f"https://zoom.us/j/{meeting_id}",
        }

    # 1. Get Access Token
    try:
        from requests.auth import HTTPBasicAuth
        token_url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={account_id}"
        token_res = requests.post(token_url, auth=HTTPBasicAuth(client_id, client_secret), timeout=10)
        token_res.raise_for_status()
        access_token = token_res.json().get('access_token')

        # 2. Create Meeting
        meeting_url = "https://api.zoom.us/v2/users/me/meetings"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "topic": f"Hapna Booking - {slot_date}",
            "type": 2, # Scheduled meeting
            "start_time": f"{slot_date}T{slot_start}Z",
            "duration": 30,
            "settings": {
                "host_video": True,
                "participant_video": True,
                "join_before_host": True
            }
        }
        meet_res = requests.post(meeting_url, headers=headers, json=payload, timeout=10)
        meet_res.raise_for_status()
        meet_data = meet_res.json()
        
        return {
            "meeting_id": str(meet_data.get('id')),
            "meeting_link": meet_data.get('join_url'),
        }
    except Exception as e:
        print(f"Zoom API Error: {e}")
        # Fallback if API fails
        return {
            "meeting_id": "Error generating",
            "meeting_link": "Error generating",
        }


def create_meeting(provider: str, booking_id: str, slot_date, slot_start) -> dict | None:
    """
    Factory function: create a meeting based on provider.
    Returns { meeting_id, meeting_link } or None if provider is 'none'.
    """
    if provider == "jitsi":
        return generate_jitsi_meeting(booking_id, slot_date, slot_start)
    elif provider == "zoom":
        return generate_zoom_meeting(booking_id, slot_date, slot_start)
    return None
