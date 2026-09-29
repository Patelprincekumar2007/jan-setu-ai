import json
import logging
from typing import Optional
from google import genai
from google.genai import types
from backend.config import settings
from backend.schemas import GeminiExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert civic intelligence data extraction engine.
Your task is to analyze natural-language citizen requests and extract structured information into a strict JSON format.

Guidelines:
1. category: Choose exactly one from ["Water", "Roads", "Healthcare", "Sanitation", "Other"].
2. severity: Assess urgency based strictly on description: ["Low", "Medium", "High", "Critical"].
3. problem_summary: A concise, neutral summary of the core issue in English (1-2 sentences).
4. affected_group: Specific community or group affected if mentioned (e.g. "school children", "farmers", "Ward 4 residents").
5. location_hint: Any specific landmark or sub-locality mentioned in the narrative.
6. language: The language used in the citizen's original text (e.g., "Hindi", "English", "Marathi", "Gujarati").

Output MUST be valid JSON conforming to the schema. Do not include markdown codeblocks or extra conversational text."""

def extract_request_intelligence(
    citizen_text: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    locality: Optional[str] = None,
    user_category: Optional[str] = None,
) -> Optional[GeminiExtractionResult]:
    """
    Analyzes natural-language citizen request text using Google Gemini and returns structured Pydantic data.
    If the API key is not configured or the API call fails, logs safely and returns None.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
        logger.info("Gemini API key is not configured. Skipping automated AI extraction.")
        return None

    try:
        client = genai.Client(api_key=settings.gemini_api_key)
        user_content = f"""Citizen Request:
\"\"\"{citizen_text}\"\"\"

Administrative Context Provided:
- State: {state or 'Unknown'}
- District: {district or 'Unknown'}
- Locality: {locality or 'Unknown'}
- Initial Category: {user_category or 'Unknown'}"""

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=GeminiExtractionResult,
                temperature=0.1,
            )
        )

        if not response or not response.text:
            logger.warning("Gemini returned an empty response.")
            return None

        raw_json = json.loads(response.text)
        validated_result = GeminiExtractionResult(**raw_json)
        return validated_result

    except Exception as e:
        logger.error(f"Gemini extraction encountered an error: {e}")
        return None
