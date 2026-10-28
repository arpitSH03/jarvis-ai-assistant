import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "JARVIS" in data["service"]

def test_tools_listing():
    resp = client.get("/api/tools")
    assert resp.status_code == 200
    tools = resp.json().get("tools", [])
    assert len(tools) >= 10
    names = [t["name"] for t in tools]
    assert "desktop.open_application" in names
    assert "email.search" in names
    assert "email.draft" in names
    assert "email.send" in names
    assert "calendar.schedule_study_plan" in names
    assert "study.explain_concept" in names

def test_chat_youtube_playback():
    resp = client.post("/api/chat", json={
        "message": "Jarvis, play Java recursion tutorial on YouTube",
        "generate_speech": False
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert any(t["tool_name"] == "media.play_youtube" for t in data["tools_executed"])

def test_chat_study_schedule_plan():
    resp = client.post("/api/chat", json={
        "message": "Jarvis, schedule DSA practice every day from 7 PM to 8 PM for the next seven days",
        "generate_speech": False
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert any(t["tool_name"] == "calendar.schedule_study_plan" for t in data["tools_executed"])

def test_chat_email_flow_with_confirmation():
    # User asks to find professor email and draft extension request
    resp = client.post("/api/chat", json={
        "message": "Jarvis, find my latest email from my professor and draft a polite reply asking for an extension",
        "generate_speech": False
    })
    assert resp.status_code == 200
    data = resp.json()
    # Should require confirmation before sending
    assert data["status"] == "awaiting_confirmation"
    assert data["pending_confirmation"] is not None
    conf_id = data["pending_confirmation"]["id"]
    assert data["pending_confirmation"]["tool_name"] == "email.send"

    # User confirms the staged action
    confirm_resp = client.post("/api/tools/confirm", json={
        "confirmation_id": conf_id,
        "approved": True
    })
    assert confirm_resp.status_code == 200
    confirm_data = confirm_resp.json()
    assert confirm_data["status"] == "completed"
    assert any(t["tool_name"] == "email.send" for t in confirm_data["tools_executed"])

def test_chat_study_explain_concept():
    resp = client.post("/api/chat", json={
        "message": "Jarvis, explain Binary Search Tree in simple terms",
        "generate_speech": False
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert any(t["tool_name"] == "study.explain_concept" for t in data["tools_executed"])

def test_calendar_endpoints():
    # Create event
    create_resp = client.post("/api/calendar/events", json={
        "title": "Operating Systems Midterm Review",
        "start_time": "2026-10-30T15:00:00"
    })
    assert create_resp.status_code == 200

    # List events
    list_resp = client.get("/api/calendar/events")
    assert list_resp.status_code == 200
    events = list_resp.json().get("events", [])
    assert len(events) >= 1

def test_email_endpoints():
    resp = client.get("/api/emails?query=professor")
    assert resp.status_code == 200
    emails = resp.json().get("emails", [])
    assert len(emails) >= 1
    assert "Sharma" in emails[0]["sender"]

def test_settings_endpoints():
    # Get settings
    get_resp = client.get("/api/settings")
    assert get_resp.status_code == 200
    settings = get_resp.json()
    assert "allowed_applications" in settings
    assert settings["mock_mode"] is True

    # Update settings
    update_resp = client.post("/api/settings", json={
        "tts_voice": "en-GB-RyanNeural"
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "success"

def test_audit_logs():
    resp = client.get("/api/audit")
    assert resp.status_code == 200
    logs = resp.json().get("audit_logs", [])
    assert len(logs) >= 1
    # Check that tool execution was audited
    assert any(log["status"] in ["EXECUTED", "CONFIRMED"] for log in logs)
