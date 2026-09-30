import os
import logging
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from backend.config import settings

logger = logging.getLogger("nagriklens.voice")

router = APIRouter(prefix="/api/voice", tags=["Voice Transcription"])

class TranscriptionResponse(BaseModel):
    transcription: str
    language: str
    detected_language: Optional[str] = None
    confidence: Optional[float] = None
    is_mock: bool = False

MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
ALLOWED_AUDIO_MIME_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/mp3",
    "audio/mpeg",
    "audio/m4a",
    "audio/mp4",
}

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form("hi-IN"),  # Default or en-IN, gu-IN
):
    """
    Transcribes citizen voice input into text using configured Google Cloud Speech-to-Text.
    If speech credentials/configuration are not set, returns a safe 503 Service Unavailable
    explaining that voice input is not configured. NEVER fabricates a synthetic transcript.
    """
    # 1. Validate MIME type
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_AUDIO_MIME_TYPES and not content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{content_type}'. Supported formats: WAV, WebM, OGG, MP3.",
        )

    # 2. Read audio and validate size
    try:
        audio_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded audio stream: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded audio file.",
        )

    if len(audio_bytes) > MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file exceeds maximum allowed size of 10MB.",
        )

    if len(audio_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty audio payload received.",
        )

    # 3. Check for Google Cloud Speech credentials
    google_project = getattr(settings, "google_cloud_project", None) or os.environ.get("GOOGLE_CLOUD_PROJECT")
    google_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    # If Google Cloud Speech client is not configured, return honest error
    if not (google_project or google_creds):
        logger.info("Voice transcription requested but Google Cloud Speech credentials are not configured.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice input is not configured on this instance. Please submit your request in text format.",
        )

    # If configured, attempt Google Cloud Speech transcription
    try:
        from google.cloud import speech  # type: ignore
        client = speech.SpeechClient()

        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED,
            language_code=language_code or "hi-IN",
            alternative_language_codes=["en-IN", "gu-IN"],
            enable_automatic_punctuation=True,
        )

        response = client.recognize(config=config, audio=audio)
        transcripts = []
        for result in response.results:
            transcripts.append(result.alternatives[0].transcript)

        full_text = " ".join(transcripts).strip()
        if not full_text:
            return TranscriptionResponse(
                transcription="",
                language=language_code or "hi-IN",
                confidence=0.0,
            )

        return TranscriptionResponse(
            transcription=full_text,
            language=language_code or "hi-IN",
            confidence=float(response.results[0].alternatives[0].confidence) if response.results else None,
        )
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Cloud Speech SDK is not installed on this server.",
        )
    except Exception as e:
        logger.error(f"Google Cloud Speech API execution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Voice transcription service temporarily encountered an error.",
        )
