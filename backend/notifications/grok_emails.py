"""Grok AI-generated personalized email bodies."""
import os
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.getenv('XAI_API_KEY'),
            base_url='https://api.x.ai/v1',
        )
    return _client


def generate_email_body(booking):
    """
    Call Grok to generate a personalized confirmation email.
    Returns HTML string. Raises on failure (caller handles fallback).
    """
    service = booking.service
    customer = booking.customer_profile

    prompt = f"""Write a warm, professional 3-paragraph booking confirmation email in HTML.

Service: {service.title if service else 'Appointment'}
Customer: {customer.full_name if customer else 'Customer'}
Date: {booking.slot_date}
Time: {booking.slot_start} - {booking.slot_end}
Location: {service.venue_address or service.location or 'Online' if service else 'TBD'}
Duration: {service.duration_minutes if service else '?'} minutes
Booking Reference: {booking.confirmation_token}
Channel: {booking.booking_channel}

Rules:
- Use <h2>, <p> tags only. No <html>, <head>, <body> wrappers.
- Mention the service name and date naturally.
- Include the booking reference.
- End with a friendly closing.
- Keep it under 150 words.
"""

    client = _get_client()
    response = client.chat.completions.create(
        model='grok-3-mini',
        messages=[
            {'role': 'system', 'content': 'You write booking confirmation emails. Return only HTML content.'},
            {'role': 'user', 'content': prompt},
        ],
        max_tokens=500,
        temperature=0.7,
    )

    body = response.choices[0].message.content
    logger.info(f"Grok email generated for booking {booking.id}")
    return body
