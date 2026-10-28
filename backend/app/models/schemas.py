from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.security import SafetyLevel

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[Dict[str, str]]] = None
    mode: str = "general"  # "general", "study", "automation"
    generate_speech: bool = True

class PendingConfirmation(BaseModel):
    id: str
    tool_name: str
    action_description: str
    parameters: Dict[str, Any]
    safety_level: SafetyLevel = SafetyLevel.CONFIRMATION_REQUIRED
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class ToolCallInfo(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result: Optional[Any] = None
    success: bool = True
    error: Optional[str] = None

class TaskStep(BaseModel):
    step_number: int
    description: str
    tool_name: str
    parameters: Dict[str, Any]
    status: str = "PENDING"  # PENDING, RUNNING, COMPLETED, FAILED, AWAITING_CONFIRMATION
    result: Optional[Any] = None

class ChatResponse(BaseModel):
    response_text: str
    spoken_text: Optional[str] = None
    audio_base64: Optional[str] = None
    task_id: Optional[str] = None
    steps: Optional[List[TaskStep]] = None
    pending_confirmation: Optional[PendingConfirmation] = None
    tools_executed: List[ToolCallInfo] = []
    status: str = "idle"  # idle, processing, awaiting_confirmation, speaking, completed

class ConfirmationRequest(BaseModel):
    confirmation_id: str
    approved: bool
    modified_parameters: Optional[Dict[str, Any]] = None

class SpeechSynthesisRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    rate: Optional[str] = "+0%"

class SpeechSynthesisResponse(BaseModel):
    audio_base64: str
    format: str = "mp3"
    voice: str

class CalendarEventModel(BaseModel):
    id: Optional[str] = None
    title: str
    start_time: str
    end_time: Optional[str] = None
    description: Optional[str] = ""
    location: Optional[str] = ""

class EmailDraftModel(BaseModel):
    recipient: str
    subject: str
    body: str
    cc: Optional[List[str]] = None
    attachments: Optional[List[str]] = None

class StudyConceptRequest(BaseModel):
    topic: str
    subject: Optional[str] = "Computer Science"
    level: Optional[str] = "undergraduate"  # introductory, undergraduate, advanced

class AssignmentSolverRequest(BaseModel):
    assignment_text: str
    subject: str
    requirements: Optional[str] = ""
    format_output: str = "markdown"  # markdown, docx, pdf

class SettingsUpdateRequest(BaseModel):
    ai_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    mock_mode: Optional[bool] = None
    tts_voice: Optional[str] = None
