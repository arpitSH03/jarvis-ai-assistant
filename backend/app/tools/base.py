from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.security import SafetyLevel

class ToolResult(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str
    error: Optional[str] = None
    verified: bool = False

class BaseTool(ABC):
    """Abstract base class for all JARVIS tools."""
    name: str
    description: str
    safety_level: SafetyLevel = SafetyLevel.SAFE
    parameters: Dict[str, Any]  # JSON Schema specification

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Execute the tool action."""
        pass

    async def verify_result(self, result: ToolResult, **kwargs) -> bool:
        """
        Verify that the tool's intended effect actually occurred.
        Subclasses can override with specific assertions (e.g., check process or file).
        """
        return result.success

    def to_schema(self) -> Dict[str, Any]:
        """Convert tool to OpenAI/Gemini function calling schema format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            }
        }
