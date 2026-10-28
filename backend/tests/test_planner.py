import pytest
import asyncio
from app.planner.llm_service import llm_service
from app.planner.task_planner import task_planner
from app.tools.registry import registry
from app.core.security import is_application_allowed, sanitize_user_input

@pytest.mark.asyncio
async def test_application_allowlist():
    assert is_application_allowed("notepad") is True
    assert is_application_allowed("calc") is True
    assert is_application_allowed("chrome") is True
    assert is_application_allowed("malicious_worm.exe") is False
    assert is_application_allowed("powershell_exploit") is False

@pytest.mark.asyncio
async def test_input_sanitization():
    raw = "Hello\x00World   "
    clean = sanitize_user_input(raw)
    assert clean == "HelloWorld"

@pytest.mark.asyncio
async def test_tool_registry():
    tools = registry.get_all_tools()
    assert len(tools) >= 10
    
    app_tool = registry.get_tool("desktop.open_application")
    assert app_tool is not None
    assert app_tool.name == "desktop.open_application"

@pytest.mark.asyncio
async def test_offline_planner_intent_detection():
    # Test YouTube intent
    yt_plan = await llm_service.generate_plan("Jarvis, play Java recursion tutorial on YouTube")
    assert any(call["tool_name"] == "media.play_youtube" for call in yt_plan.get("tool_calls", []))

    # Test Calendar study schedule intent
    cal_plan = await llm_service.generate_plan("Jarvis, schedule DSA practice every day from 7 PM to 8 PM for the next seven days")
    assert any(call["tool_name"] == "calendar.schedule_study_plan" for call in cal_plan.get("tool_calls", []))

    # Test Professor email draft intent (multi-step with staged confirmation)
    email_plan = await llm_service.generate_plan("Jarvis, find my latest email from my professor and draft a polite reply asking for an extension")
    assert any(call["tool_name"] == "email.search" for call in email_plan.get("tool_calls", []))
    assert "pending_action" in email_plan

@pytest.mark.asyncio
async def test_task_planner_end_to_end():
    # Execute full request through task planner
    response = await task_planner.process_user_request("what is my schedule", generate_speech=False)
    assert response.status == "completed"
    assert len(response.tools_executed) >= 1
    assert response.tools_executed[0].tool_name == "calendar.list_events"
