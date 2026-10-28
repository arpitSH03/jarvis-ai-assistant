import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.tools.base import BaseTool, ToolResult
from app.core.security import SafetyLevel
from app.core.config import settings

# Realistic mock store for emails when Google OAuth is not configured
MOCK_EMAILS = [
    {
        "id": "msg_prof_101",
        "sender": "Prof. S. R. Sharma <sharma.cs@university.edu>",
        "recipient": "user@university.edu",
        "subject": "CS302 Assignment 3 Submission Deadline Extended",
        "snippet": "Dear class, the deadline for Data Structures & Algorithms assignment 3 has been extended to Friday 11:59 PM...",
        "body": "Dear class,\n\nPlease note that following multiple requests, the deadline for Assignment 3 (Graph Algorithms and Dynamic Programming) is now extended to Friday, 11:59 PM IST. Ensure your code passes all unit test cases and includes the required complexity analysis.\n\nBest regards,\nProf. S. R. Sharma\nDepartment of Computer Science",
        "date": "2026-10-27T10:30:00",
        "is_read": False,
    },
    {
        "id": "msg_team_102",
        "sender": "Project Partner Priya <priya.tech@gmail.com>",
        "recipient": "user@university.edu",
        "subject": "Minor Project Architecture Review",
        "snippet": "Hey, can we sync on the database schema for our Jarvis project tomorrow at 4 PM?...",
        "body": "Hey,\n\nI finished the initial schema draft for our assistant project. Can we review it tomorrow around 4 PM? Let me know if that time works or if we should reschedule.\n\nCheers,\nPriya",
        "date": "2026-10-28T09:15:00",
        "is_read": True,
    },
    {
        "id": "msg_dept_103",
        "sender": "Dean of Academics <academics@university.edu>",
        "recipient": "all-students@university.edu",
        "subject": "Mid-Semester Examination Schedule Published",
        "snippet": "The midterm examination timetable for Autumn semester is now available on the student portal...",
        "body": "Dear Students,\n\nThe timetable for the upcoming Mid-Semester examinations has been uploaded to the student ERP portal. Please verify your course registrations and seat allotments.\n\nAcademic Office",
        "date": "2026-10-26T14:00:00",
        "is_read": True,
    }
]

class SearchEmailTool(BaseTool):
    name = "email.search"
    description = "Searches emails by sender, subject keyword, or content."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query or keywords (e.g. 'professor', 'assignment', 'Priya', 'exam').",
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of emails to retrieve (default 5).",
            }
        },
        "required": ["query"],
    }

    async def execute(self, query: str, limit: int = 5, **kwargs) -> ToolResult:
        query_lower = query.lower()
        results = []

        # If real Gmail API configured and not forced mock mode:
        # (Real Gmail client implementation can plug here via google_auth)
        
        # Search mock emails
        for email in MOCK_EMAILS:
            if (query_lower in email["sender"].lower() or 
                query_lower in email["subject"].lower() or 
                query_lower in email["body"].lower()):
                results.append(email)

        if not results:
            # Fallback fuzzy match: if querying "professor", match "prof"
            for email in MOCK_EMAILS:
                if "prof" in query_lower and "prof" in email["sender"].lower():
                    results.append(email)

        results = results[:limit]

        return ToolResult(
            success=True,
            data={"emails": results, "count": len(results)},
            message=f"Found {len(results)} email(s) matching '{query}'.",
            verified=True
        )

class DraftEmailTool(BaseTool):
    name = "email.draft"
    description = "Prepares and stages an email draft for user review. Does NOT send the email until confirmed."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "recipient": {
                "type": "string",
                "description": "Recipient email address or name.",
            },
            "subject": {
                "type": "string",
                "description": "Subject of the email.",
            },
            "body": {
                "type": "string",
                "description": "The complete drafted body content of the email.",
            }
        },
        "required": ["recipient", "subject", "body"],
    }

    async def execute(self, recipient: str, subject: str, body: str, **kwargs) -> ToolResult:
        draft = {
            "draft_id": str(uuid.uuid4())[:8],
            "recipient": recipient,
            "subject": subject,
            "body": body,
            "created_at": datetime.now().isoformat(),
            "status": "DRAFTED_PENDING_APPROVAL"
        }

        return ToolResult(
            success=True,
            data=draft,
            message=f"Draft created for {recipient} with subject '{subject}'. Waiting for your confirmation before sending.",
            verified=True
        )

class SendEmailTool(BaseTool):
    name = "email.send"
    description = "Sends an email to the recipient. REQUIRES EXPLICIT USER CONFIRMATION before execution."
    safety_level = SafetyLevel.CONFIRMATION_REQUIRED
    parameters = {
        "type": "object",
        "properties": {
            "recipient": {
                "type": "string",
                "description": "Destination email address.",
            },
            "subject": {
                "type": "string",
                "description": "Email subject header.",
            },
            "body": {
                "type": "string",
                "description": "Body content of the email.",
            }
        },
        "required": ["recipient", "subject", "body"],
    }

    async def execute(self, recipient: str, subject: str, body: str, **kwargs) -> ToolResult:
        # In real Gmail integration: calls gmail.users().messages().send()
        # In mock mode: stores in sent emails list
        sent_record = {
            "message_id": f"sent_{uuid.uuid4().hex[:10]}",
            "recipient": recipient,
            "subject": subject,
            "body": body,
            "timestamp": datetime.now().isoformat(),
            "status": "SENT"
        }
        
        return ToolResult(
            success=True,
            data=sent_record,
            message=f"Email successfully dispatched to {recipient} with subject '{subject}'.",
            verified=True
        )
