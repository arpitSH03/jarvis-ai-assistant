import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.schemas import ChatResponse, ToolCallInfo, TaskStep, PendingConfirmation
from app.core.security import SafetyLevel
from app.core.database import get_db_connection, save_conversation_message
from app.tools.registry import registry
from app.planner.llm_service import llm_service
from app.voice.tts_engine import synthesize_speech

logger = logging.getLogger("jarvis.planner")

# In-memory store for pending confirmations
PENDING_CONFIRMATIONS: Dict[str, Dict[str, Any]] = {}

class TaskPlanner:
    """Coordinates intent breakdown, safety authorization, execution, and speech feedback."""

    async def process_user_request(self, user_text: str, generate_speech: bool = True) -> ChatResponse:
        logger.info(f"Processing request: '{user_text}'")
        save_conversation_message("user", user_text)

        # 1. Generate plan using LLM service
        plan = await llm_service.generate_plan(user_text)
        
        response_text = plan.get("response_text", "Understood, sir.")
        tool_calls = plan.get("tool_calls", [])
        pending_action = plan.get("pending_action")

        task_id = f"task_{uuid.uuid4().hex[:8]}"
        executed_tools: List[ToolCallInfo] = []
        task_steps: List[TaskStep] = []
        pending_confirmation_obj: Optional[PendingConfirmation] = None

        # 2. Check and execute safe tools
        step_idx = 1
        for call in tool_calls:
            t_name = call.get("tool_name")
            t_params = call.get("parameters", {})
            tool = registry.get_tool(t_name)

            if tool and tool.safety_level == SafetyLevel.CONFIRMATION_REQUIRED:
                # Stage confirmation instead of executing immediately
                conf_id = f"conf_{uuid.uuid4().hex[:8]}"
                PENDING_CONFIRMATIONS[conf_id] = {
                    "tool_name": t_name,
                    "parameters": t_params,
                    "task_id": task_id,
                    "description": f"Execute {t_name} with parameters: {t_params}"
                }
                pending_confirmation_obj = PendingConfirmation(
                    id=conf_id,
                    tool_name=t_name,
                    action_description=f"Approval needed for {t_name}",
                    parameters=t_params,
                    safety_level=SafetyLevel.CONFIRMATION_REQUIRED
                )
                task_steps.append(TaskStep(
                    step_number=step_idx,
                    description=f"Awaiting approval for {t_name}",
                    tool_name=t_name,
                    parameters=t_params,
                    status="AWAITING_CONFIRMATION"
                ))
            else:
                # Execute safe tool
                step = TaskStep(
                    step_number=step_idx,
                    description=f"Executing {t_name}",
                    tool_name=t_name,
                    parameters=t_params,
                    status="RUNNING"
                )
                res = await registry.execute(t_name, t_params)
                step.status = "COMPLETED" if res.success else "FAILED"
                step.result = res.data or res.message
                task_steps.append(step)

                executed_tools.append(ToolCallInfo(
                    tool_name=t_name,
                    parameters=t_params,
                    result=res.data,
                    success=res.success,
                    error=res.error
                ))
                if not res.success:
                    logger.warning(f"Step {t_name} failed: {res.error}")

            step_idx += 1

        # 3. If there is a staged pending action (e.g. email sending confirmation)
        if pending_action:
            conf_id = f"conf_{uuid.uuid4().hex[:8]}"
            PENDING_CONFIRMATIONS[conf_id] = {
                "tool_name": pending_action["tool_name"],
                "parameters": pending_action["parameters"],
                "task_id": task_id,
                "description": pending_action.get("description", "Execute action")
            }
            pending_confirmation_obj = PendingConfirmation(
                id=conf_id,
                tool_name=pending_action["tool_name"],
                action_description=pending_action.get("description", "Confirm action"),
                parameters=pending_action["parameters"],
                safety_level=SafetyLevel.CONFIRMATION_REQUIRED
            )
            task_steps.append(TaskStep(
                step_number=step_idx,
                description=f"Approval needed: {pending_action.get('description')}",
                tool_name=pending_action["tool_name"],
                parameters=pending_action["parameters"],
                status="AWAITING_CONFIRMATION"
            ))

        # 4. Generate Speech if requested
        audio_b64 = None
        spoken_summary = response_text
        if pending_confirmation_obj:
            spoken_summary += f" I require your confirmation before proceeding with {pending_confirmation_obj.tool_name}."

        if generate_speech:
            try:
                audio_b64 = await synthesize_speech(spoken_summary)
            except Exception as e:
                logger.error(f"Speech synthesis error: {e}")

        # 5. Persist to database
        save_conversation_message("jarvis", response_text, {"task_id": task_id, "tools": [t.tool_name for t in executed_tools]})
        
        status_str = "awaiting_confirmation" if pending_confirmation_obj else "completed"

        return ChatResponse(
            response_text=response_text,
            spoken_text=spoken_summary,
            audio_base64=audio_b64,
            task_id=task_id,
            steps=task_steps,
            pending_confirmation=pending_confirmation_obj,
            tools_executed=executed_tools,
            status=status_str
        )

    async def resolve_confirmation(self, confirmation_id: str, approved: bool, modified_parameters: Optional[Dict[str, Any]] = None) -> ChatResponse:
        """Executes or rejects a staged action based on user decision."""
        if confirmation_id not in PENDING_CONFIRMATIONS:
            return ChatResponse(
                response_text="The specified confirmation token was not found or has already expired.",
                status="idle"
            )

        conf = PENDING_CONFIRMATIONS.pop(confirmation_id)
        tool_name = conf["tool_name"]
        params = modified_parameters or conf["parameters"]

        if not approved:
            resp_text = f"Action cancelled. {tool_name} was not executed."
            audio_b64 = await synthesize_speech(resp_text)
            return ChatResponse(response_text=resp_text, audio_base64=audio_b64, status="cancelled")

        # Execute approved action
        result = await registry.execute(tool_name, params)
        resp_text = result.message if result.success else f"Action failed: {result.error}"
        audio_b64 = await synthesize_speech(resp_text)

        return ChatResponse(
            response_text=resp_text,
            audio_base64=audio_b64,
            tools_executed=[ToolCallInfo(tool_name=tool_name, parameters=params, result=result.data, success=result.success)],
            status="completed"
        )

task_planner = TaskPlanner()
