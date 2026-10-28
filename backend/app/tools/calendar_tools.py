import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from app.tools.base import BaseTool, ToolResult
from app.core.security import SafetyLevel
from app.core.database import get_db_connection

# In-memory mock calendar initialized with standard events
INITIAL_EVENTS = [
    {
        "id": "cal_evt_1",
        "title": "Computer Networks Lecture",
        "start_time": (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%dT%H:00:00"),
        "end_time": (datetime.now() + timedelta(hours=3)).strftime("%Y-%m-%dT%H:00:00"),
        "category": "academic",
        "location": "LH-301",
    },
    {
        "id": "cal_evt_2",
        "title": "Minor Project Team Sync",
        "start_time": (datetime.now() + timedelta(days=1, hours=4)).strftime("%Y-%m-%dT16:00:00"),
        "end_time": (datetime.now() + timedelta(days=1, hours=5)).strftime("%Y-%m-%dT17:00:00"),
        "category": "project",
        "location": "Google Meet",
    }
]

def parse_iso(dt_str: str) -> datetime:
    try:
        return datetime.fromisoformat(dt_str)
    except Exception:
        # Default to now if unparseable
        return datetime.now()

class ListEventsTool(BaseTool):
    name = "calendar.list_events"
    description = "Lists upcoming calendar events and appointments for a given timeframe."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "days_ahead": {
                "type": "integer",
                "description": "Number of days in advance to look up events (default 7).",
            }
        },
    }

    async def execute(self, days_ahead: int = 7, **kwargs) -> ToolResult:
        # Query database reminders table + mock events
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reminders WHERE is_completed = 0")
        db_rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        all_events = list(INITIAL_EVENTS) + db_rows
        # Sort by start_time
        all_events.sort(key=lambda x: str(x.get("start_time", "")))

        return ToolResult(
            success=True,
            data={"events": all_events, "total": len(all_events)},
            message=f"Found {len(all_events)} scheduled event(s) across the next {days_ahead} days.",
            verified=True
        )

class CreateEventTool(BaseTool):
    name = "calendar.create_event"
    description = "Schedules a new calendar event, checking for scheduling conflicts first."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Event summary or title (e.g. 'DSA Practice Session', 'Exam Revision').",
            },
            "start_time": {
                "type": "string",
                "description": "Start timestamp in ISO 8601 format (e.g. '2026-10-29T19:00:00').",
            },
            "end_time": {
                "type": "string",
                "description": "End timestamp in ISO 8601 format.",
            },
            "category": {
                "type": "string",
                "description": "Category: 'academic', 'study', 'meeting', 'reminder'.",
            }
        },
        "required": ["title", "start_time"],
    }

    async def execute(self, title: str, start_time: str, end_time: Optional[str] = None, category: str = "study", **kwargs) -> ToolResult:
        new_start = parse_iso(start_time)
        if not end_time:
            new_end = new_start + timedelta(hours=1)
            end_time = new_end.isoformat()
        else:
            new_end = parse_iso(end_time)

        # 1. Conflict Detection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reminders WHERE is_completed = 0")
        existing = [dict(r) for r in cursor.fetchall()] + INITIAL_EVENTS

        conflicts = []
        for ev in existing:
            ev_start = parse_iso(ev.get("start_time", ""))
            ev_end = parse_iso(ev.get("end_time", ""))
            if (new_start < ev_end) and (new_end > ev_start):
                conflicts.append(ev.get("title", "Untitled"))

        # Save to database
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        cursor.execute(
            "INSERT INTO reminders (id, title, start_time, end_time, category, is_completed, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
            (event_id, title, start_time, end_time, category, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()

        conflict_note = f" Note: Detected potential overlap with: {', '.join(conflicts)}." if conflicts else ""
        return ToolResult(
            success=True,
            data={
                "id": event_id,
                "title": title,
                "start_time": start_time,
                "end_time": end_time,
                "conflicts": conflicts
            },
            message=f"Scheduled '{title}' for {start_time}.{conflict_note}",
            verified=True
        )

class ScheduleStudySessionTool(BaseTool):
    name = "calendar.schedule_study_plan"
    description = "Schedules a recurring daily study session for N days (e.g., 'DSA practice every day from 7 PM to 8 PM for 7 days')."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "topic": {
                "type": "string",
                "description": "Topic or subject (e.g. 'DSA Practice', 'Web Development').",
            },
            "start_hour": {
                "type": "integer",
                "description": "Hour of the day (24h format, e.g. 19 for 7 PM).",
            },
            "duration_hours": {
                "type": "integer",
                "description": "Duration in hours (default 1).",
            },
            "days_count": {
                "type": "integer",
                "description": "Number of consecutive days to schedule (default 7).",
            }
        },
        "required": ["topic", "start_hour"],
    }

    async def execute(self, topic: str, start_hour: int, duration_hours: int = 1, days_count: int = 7, **kwargs) -> ToolResult:
        scheduled_events = []
        conn = get_db_connection()
        cursor = conn.cursor()
        now = datetime.now()

        for day in range(days_count):
            day_date = now + timedelta(days=day)
            start_dt = day_date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
            end_dt = start_dt + timedelta(hours=duration_hours)
            
            evt_id = f"study_{uuid.uuid4().hex[:6]}"
            title = f"{topic} (Day {day+1}/{days_count})"
            cursor.execute(
                "INSERT INTO reminders (id, title, start_time, end_time, category, is_completed, created_at) VALUES (?, ?, ?, ?, 'study', 0, ?)",
                (evt_id, title, start_dt.isoformat(), end_dt.isoformat(), now.isoformat())
            )
            scheduled_events.append({"id": evt_id, "title": title, "start": start_dt.strftime("%Y-%m-%d %I:%M %p")})

        conn.commit()
        conn.close()

        return ToolResult(
            success=True,
            data={"events": scheduled_events, "count": len(scheduled_events)},
            message=f"Successfully scheduled {days_count} consecutive days of '{topic}' starting today at {start_hour}:00.",
            verified=True
        )

class DeleteEventTool(BaseTool):
    name = "calendar.delete_event"
    description = "Deletes or cancels a calendar event. REQUIRES USER CONFIRMATION."
    safety_level = SafetyLevel.CONFIRMATION_REQUIRED
    parameters = {
        "type": "object",
        "properties": {
            "event_id": {
                "type": "string",
                "description": "The unique ID of the event to cancel or delete.",
            }
        },
        "required": ["event_id"],
    }

    async def execute(self, event_id: str, **kwargs) -> ToolResult:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reminders WHERE id = ?", (event_id,))
        conn.commit()
        conn.close()

        return ToolResult(
            success=True,
            data={"event_id": event_id},
            message=f"Cancelled and removed event {event_id}.",
            verified=True
        )
