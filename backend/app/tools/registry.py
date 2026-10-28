import logging
from typing import Dict, Any, List, Optional
from app.tools.base import BaseTool, ToolResult
from app.core.security import SafetyLevel
from app.core.database import log_audit

# Import all tool classes
from app.tools.desktop_tools import OpenApplicationTool, SystemInfoTool
from app.tools.media_tools import PlayYouTubeTool, OpenUrlTool, WebSearchTool, VolumeControlTool
from app.tools.email_tools import SearchEmailTool, DraftEmailTool, SendEmailTool
from app.tools.calendar_tools import ListEventsTool, CreateEventTool, ScheduleStudySessionTool, DeleteEventTool
from app.tools.study_tools import ExplainConceptTool, GenerateQuizTool, CreateDocxTool, AnalyzeCodeTool, SummarizeFileTool

logger = logging.getLogger("jarvis.tools")

class ToolRegistry:
    """Central registry and executor for all JARVIS tools."""
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name} (Safety: {tool.safety_level})")

    def _register_default_tools(self):
        # Desktop
        self.register(OpenApplicationTool())
        self.register(SystemInfoTool())
        
        # Media & Web
        self.register(PlayYouTubeTool())
        self.register(OpenUrlTool())
        self.register(WebSearchTool())
        self.register(VolumeControlTool())
        
        # Email
        self.register(SearchEmailTool())
        self.register(DraftEmailTool())
        self.register(SendEmailTool())
        
        # Calendar
        self.register(ListEventsTool())
        self.register(CreateEventTool())
        self.register(ScheduleStudySessionTool())
        self.register(DeleteEventTool())
        
        # Study & Code
        self.register(ExplainConceptTool())
        self.register(GenerateQuizTool())
        self.register(CreateDocxTool())
        self.register(AnalyzeCodeTool())
        self.register(SummarizeFileTool())

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def get_all_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

    def get_tools_schema(self) -> List[Dict[str, Any]]:
        """Return function calling schema suitable for Gemini or OpenAI API."""
        return [tool.to_schema() for tool in self._tools.values()]

    async def execute(self, tool_name: str, parameters: Dict[str, Any]) -> ToolResult:
        tool = self.get_tool(tool_name)
        if not tool:
            log_audit(tool_name, parameters, SafetyLevel.SAFE, "FAILED", "Tool not found")
            return ToolResult(
                success=False,
                message=f"Tool '{tool_name}' is not recognized in the JARVIS registry.",
                error="TOOL_NOT_FOUND"
            )

        try:
            # Execute tool
            result = await tool.execute(**parameters)
            
            # Verify result
            verified = await tool.verify_result(result, **parameters)
            result.verified = verified

            # Log to audit table
            status_str = "EXECUTED" if result.success else "FAILED"
            log_audit(tool_name, parameters, tool.safety_level, status_str, result.message)

            return result
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}", exc_info=True)
            log_audit(tool_name, parameters, tool.safety_level, "FAILED", str(e))
            return ToolResult(
                success=False,
                message=f"Execution error in {tool_name}: {str(e)}",
                error=str(e),
                verified=False
            )

# Singleton registry instance
registry = ToolRegistry()
