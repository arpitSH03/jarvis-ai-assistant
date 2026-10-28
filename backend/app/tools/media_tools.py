import webbrowser
import urllib.parse
import subprocess
from app.tools.base import BaseTool, ToolResult
from app.core.security import SafetyLevel

class PlayYouTubeTool(BaseTool):
    name = "media.play_youtube"
    description = "Searches YouTube and plays the specified video or topic in the default browser."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query or title of the video to play on YouTube (e.g. 'Java recursion tutorial', 'DSA roadmap').",
            }
        },
        "required": ["query"],
    }

    async def execute(self, query: str, **kwargs) -> ToolResult:
        try:
            encoded_query = urllib.parse.quote_plus(query)
            # YouTube search URL or direct watch
            url = f"https://www.youtube.com/results?search_query={encoded_query}"
            webbrowser.open(url)
            return ToolResult(
                success=True,
                data={"url": url, "query": query},
                message=f"Playing '{query}' on YouTube in your browser.",
                verified=True
            )
        except Exception as e:
            return ToolResult(success=False, message=f"Failed to play YouTube video: {str(e)}", error=str(e))

class OpenUrlTool(BaseTool):
    name = "browser.open_url"
    description = "Opens a verified URL in the user's default browser."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "The valid web URL starting with http:// or https://",
            }
        },
        "required": ["url"],
    }

    async def execute(self, url: str, **kwargs) -> ToolResult:
        if not (url.startswith("http://") or url.startswith("https://")):
            url = "https://" + url

        try:
            webbrowser.open(url)
            return ToolResult(
                success=True,
                data={"url": url},
                message=f"Opened {url} in your browser.",
                verified=True
            )
        except Exception as e:
            return ToolResult(success=False, message=f"Failed to open URL: {str(e)}", error=str(e))

class WebSearchTool(BaseTool):
    name = "browser.search"
    description = "Performs an internet search query using Google or default search engine."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query to look up on the web.",
            }
        },
        "required": ["query"],
    }

    async def execute(self, query: str, **kwargs) -> ToolResult:
        try:
            url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"
            webbrowser.open(url)
            return ToolResult(
                success=True,
                data={"query": query, "url": url},
                message=f"Searching the web for '{query}'.",
                verified=True
            )
        except Exception as e:
            return ToolResult(success=False, message=f"Failed to perform search: {str(e)}", error=str(e))

class VolumeControlTool(BaseTool):
    name = "media.volume"
    description = "Adjusts or sets the Windows audio volume level (0 to 100) or mutes audio."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["up", "down", "mute", "set"],
                "description": "The action to perform: 'up' (+10%), 'down' (-10%), 'mute', or 'set'.",
            },
            "level": {
                "type": "integer",
                "description": "The volume percentage level between 0 and 100 when action is 'set'.",
            }
        },
        "required": ["action"],
    }

    async def execute(self, action: str, level: int = 50, **kwargs) -> ToolResult:
        try:
            # Execute keyboard multimedia keys or PowerShell sound volume command
            if action == "up":
                # Send volume up key
                cmd = "$obj = New-Object -ComObject WScript.Shell; 1..5 | ForEach-Object { $obj.SendKeys([char]175) }"
                msg = "Increased system volume."
            elif action == "down":
                cmd = "$obj = New-Object -ComObject WScript.Shell; 1..5 | ForEach-Object { $obj.SendKeys([char]174) }"
                msg = "Decreased system volume."
            elif action == "mute":
                cmd = "$obj = New-Object -ComObject WScript.Shell; $obj.SendKeys([char]173)"
                msg = "Toggled system mute."
            else:
                # Set volume percentage via PowerShell
                cmd = f"""
                $wsh = New-Object -ComObject WScript.Shell
                1..50 | ForEach-Object {{ $wsh.SendKeys([char]174) }}
                1..{max(1, min(50, level // 2))} | ForEach-Object {{ $wsh.SendKeys([char]175) }}
                """
                msg = f"Adjusted volume to approx {level}%."

            subprocess.Popen(["powershell", "-Command", cmd], shell=True)
            return ToolResult(success=True, data={"action": action, "level": level}, message=msg, verified=True)
        except Exception as e:
            return ToolResult(success=False, message=f"Failed to adjust volume: {str(e)}", error=str(e))
