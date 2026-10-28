import os
import asyncio
import base64
import tempfile
import logging
from typing import Optional, Tuple
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger("jarvis.voice")

# Available high-quality voices
JARVIS_VOICES = {
    "jarvis_uk": "en-GB-RyanNeural",          # Classic British gentleman
    "jarvis_us": "en-US-ChristopherNeural",   # Calm, intelligent US
    "jarvis_deep": "en-US-GuyNeural",         # Deep, confident tone
    "jarvis_in": "en-IN-PrabhatNeural",       # Indian English male
}

async def generate_speech_edge(
    text: str, 
    voice: Optional[str] = None, 
    rate: str = "+0%", 
    volume: str = "+0%"
) -> Tuple[bytes, str]:
    """Generate audio bytes using Microsoft Edge TTS."""
    import edge_tts
    
    selected_voice = voice or settings.TTS_VOICE
    # Clean text of markdown characters for smooth speech
    clean_text = (
        text.replace("*", "")
        .replace("#", "")
        .replace("`", "")
        .replace("[", "")
        .replace("]", "")
        .replace("_", "")
        .strip()
    )
    
    if len(clean_text) > 800:
        clean_text = clean_text[:800] + " and so on."

    communicate = edge_tts.Communicate(clean_text, selected_voice, rate=rate, volume=volume)
    
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
        temp_path = temp_file.name

    try:
        await communicate.save(temp_path)
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
        return audio_bytes, "audio/mp3"
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

def generate_speech_pyttsx3(text: str) -> Tuple[bytes, str]:
    """Fallback speech generation using local Windows SAPI5."""
    import pyttsx3
    
    engine = pyttsx3.init()
    engine.setProperty('rate', 175)
    
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        temp_path = temp_file.name
        
    try:
        engine.save_to_file(text, temp_path)
        engine.runAndWait()
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
        return audio_bytes, "audio/wav"
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

async def synthesize_speech(text: str, voice: Optional[str] = None) -> Optional[str]:
    """
    Synthesize text to speech and return base64 encoded string.
    Tries Edge TTS first, then falls back to local pyttsx3.
    """
    if not text or not text.strip():
        return None
        
    try:
        audio_bytes, mime_type = await generate_speech_edge(text, voice)
        b64_str = base64.b64encode(audio_bytes).decode('utf-8')
        return f"data:{mime_type};base64,{b64_str}"
    except Exception as e:
        logger.warning(f"Edge TTS synthesis failed, attempting pyttsx3 fallback: {e}")
        try:
            loop = asyncio.get_event_loop()
            audio_bytes, mime_type = await loop.run_in_executor(None, generate_speech_pyttsx3, text)
            b64_str = base64.b64encode(audio_bytes).decode('utf-8')
            return f"data:{mime_type};base64,{b64_str}"
        except Exception as e2:
            logger.error(f"TTS fallback also failed: {e2}")
            return None
