import os
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from app.models.schemas import (
    ChatRequest, ChatResponse, ConfirmationRequest,
    SpeechSynthesisRequest, SpeechSynthesisResponse,
    CalendarEventModel, EmailDraftModel, SettingsUpdateRequest
)
from app.planner.task_planner import task_planner
from app.voice.tts_engine import synthesize_speech
from app.core.database import get_recent_conversations, get_recent_audit_logs, get_db_connection
from app.core.config import settings
from app.tools.registry import registry

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.AI_PROVIDER,
        "mock_mode": settings.MOCK_MODE
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response = await task_planner.process_user_request(
            request.message,
            generate_speech=request.generate_speech
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/confirm", response_model=ChatResponse)
async def confirm_tool_execution(req: ConfirmationRequest):
    try:
        response = await task_planner.resolve_confirmation(
            req.confirmation_id,
            req.approved,
            req.modified_parameters
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice/synthesize", response_model=SpeechSynthesisResponse)
async def synthesize_voice_endpoint(req: SpeechSynthesisRequest):
    try:
        audio_b64 = await synthesize_speech(req.text, req.voice)
        if not audio_b64:
            raise HTTPException(status_code=500, detail="Voice synthesis failed.")
        return SpeechSynthesisResponse(
            audio_base64=audio_b64,
            format="mp3",
            voice=req.voice or settings.TTS_VOICE
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history():
    return {"history": get_recent_conversations(30)}

@router.get("/audit")
async def get_audit_logs():
    return {"audit_logs": get_recent_audit_logs(40)}

@router.get("/calendar/events")
async def get_calendar_events():
    res = await registry.execute("calendar.list_events", {"days_ahead": 14})
    return res.data or {}

@router.post("/calendar/events")
async def create_calendar_event(event: CalendarEventModel):
    res = await registry.execute("calendar.create_event", {
        "title": event.title,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "category": "academic"
    })
    return res.data or {}

@router.get("/emails")
async def get_emails(query: str = ""):
    res = await registry.execute("email.search", {"query": query or "university", "limit": 10})
    return res.data or {}

@router.get("/tools")
async def list_tools():
    return {
        "tools": [
            {
                "name": t.name,
                "description": t.description,
                "safety_level": t.safety_level,
                "parameters": t.parameters
            }
            for t in registry.get_all_tools()
        ]
    }

@router.get("/settings")
async def get_settings_endpoint():
    return {
        "ai_provider": settings.AI_PROVIDER,
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY),
        "openai_api_key_configured": bool(settings.OPENAI_API_KEY),
        "groq_api_key_configured": bool(settings.GROQ_API_KEY),
        "mock_mode": settings.MOCK_MODE,
        "tts_voice": settings.TTS_VOICE,
        "allowed_applications": settings.ALLOWED_APPLICATIONS
    }

@router.post("/settings")
async def update_settings_endpoint(req: SettingsUpdateRequest):
    if req.ai_provider:
        settings.AI_PROVIDER = req.ai_provider
    if req.gemini_api_key is not None:
        settings.GEMINI_API_KEY = req.gemini_api_key
    if req.openai_api_key is not None:
        settings.OPENAI_API_KEY = req.openai_api_key
    if req.groq_api_key is not None:
        settings.GROQ_API_KEY = req.groq_api_key
    if req.mock_mode is not None:
        settings.MOCK_MODE = req.mock_mode
    if req.tts_voice:
        settings.TTS_VOICE = req.tts_voice
    return {"status": "success", "message": "Settings updated."}
