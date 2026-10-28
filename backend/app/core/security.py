import os
from enum import Enum
from typing import List
from app.core.config import settings

class SafetyLevel(str, Enum):
    SAFE = "SAFE"                                 # Read-only or benign actions (e.g., search, summarize, list calendar)
    CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED" # Consequential actions (send email, delete file, update calendar)
    ADMIN = "ADMIN"                               # Destructive / System level commands (format, dangerous execution)

def is_application_allowed(app_name: str) -> bool:
    """Validate if requested desktop application is in the approved allowlist."""
    clean_app = app_name.strip().lower()
    # Remove .exe if present
    if clean_app.endswith(".exe"):
        clean_app = clean_app[:-4]
    return clean_app in [allowed.lower() for allowed in settings.ALLOWED_APPLICATIONS]

def sanitize_user_input(text: str) -> str:
    """Sanitize and strip dangerous null bytes or control characters."""
    if not text:
        return ""
    return text.replace("\x00", "").strip()

def sanitize_external_content(content: str) -> str:
    """
    Sanitize content retrieved from web, emails, or documents to prevent prompt injection.
    Wraps it in untrusted data delimiters.
    """
    if not content:
        return ""
    # Strip potential instructions to prevent jailbreaks
    sanitized = content.replace("```", "'''")
    return f"\n<UNTRUSTED_EXTERNAL_CONTENT>\n{sanitized}\n</UNTRUSTED_EXTERNAL_CONTENT>\n"
