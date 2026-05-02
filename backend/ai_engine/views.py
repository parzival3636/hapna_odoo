"""AI views — question suggestion using Grok."""
import os
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from openai import OpenAI

logger = logging.getLogger(__name__)

_client = None


def _get_grok():
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.getenv('XAI_API_KEY'),
            base_url='https://api.x.ai/v1',
        )
    return _client


class SuggestQuestionsView(APIView):
    """
    POST /api/ai/suggest-questions/
    Takes service title + description, returns suggested intake questions.
    """

    def post(self, request):
        title = request.data.get('title', '')
        description = request.data.get('description', '')

        if not title:
            return Response({
                'error': True, 'code': 'VALIDATION_ERROR',
                'message': 'Service title is required',
            }, status=400)

        prompt = f"""Given this service:
Title: {title}
Description: {description or 'No description provided'}

Suggest 5-8 relevant intake questions for customers booking this service.
Return a JSON array where each item has:
- question: string (the question text)
- answer_type: one of "text", "select", "boolean"
- options: array of strings (only for "select" type, otherwise null)
- is_required: boolean

Return ONLY the JSON array, no markdown, no explanation."""

        try:
            client = _get_grok()
            response = client.chat.completions.create(
                model='grok-3-mini',
                messages=[
                    {'role': 'system', 'content': 'You suggest intake questions for booking services. Return only valid JSON.'},
                    {'role': 'user', 'content': prompt},
                ],
                max_tokens=800,
                temperature=0.7,
            )

            content = response.choices[0].message.content.strip()
            # Try to parse JSON (handle markdown code blocks)
            if content.startswith('```'):
                content = content.split('\n', 1)[1].rsplit('```', 1)[0]

            questions = json.loads(content)
            return Response({'suggestions': questions})

        except json.JSONDecodeError:
            return Response({
                'error': True, 'code': 'AI_PARSE_ERROR',
                'message': 'AI returned invalid JSON. Try again.',
            }, status=500)
        except Exception as e:
            logger.error(f"Grok suggest-questions failed: {e}")
            return Response({
                'error': True, 'code': 'AI_ERROR',
                'message': f'AI service error: {str(e)}',
            }, status=500)
