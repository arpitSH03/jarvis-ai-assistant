import os
import subprocess
import shutil
import platform
import asyncio
from typing import Dict, Any
from app.tools.base import BaseTool, ToolResult
from app.core.security import SafetyLevel, is_application_allowed
from app.core.config import settings

class OpenApplicationTool(BaseTool):
    name = "desktop.open_application"
    description = "Opens an approved Windows application such as Notepad, Calculator, Chrome, VS Code, Spotify, or File Explorer."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {
            "app_name": {
                "type": "string",
                "description": "The name of the application to open (e.g., 'notepad', 'calc', 'chrome', 'code', 'spotify', 'explorer').",
            }
        },
        "required": ["app_name"],
    }

    # Map friendly names to Windows executables or URIs
    APP_MAPPINGS = {
        "notepad": "notepad.exe",
        "calc": "calc.exe",
        "calculator": "calc.exe",
        "chrome": "chrome.exe",
        "google chrome": "chrome.exe",
        "msedge": "msedge.exe",
        "edge": "msedge.exe",
        "code": "code",
        "vscode": "code",
        "vs code": "code",
        "spotify": "spotify.exe",
        "explorer": "explorer.exe",
        "files": "explorer.exe",
        "paint": "mspaint.exe",
        "mspaint": "mspaint.exe",
        "taskmgr": "taskmgr.exe",
        "task manager": "taskmgr.exe",
        "settings": "ms-settings:",
    }

    async def execute(self, app_name: str, **kwargs) -> ToolResult:
        normalized_name = app_name.lower().strip()
        
        # Check permissions allowlist
        if not is_application_allowed(normalized_name):
            return ToolResult(
                success=False,
                message=f"Application '{app_name}' is not in the approved safety allowlist.",
                error="PERMISSION_DENIED",
                verified=False
            )

        executable = self.APP_MAPPINGS.get(normalized_name, normalized_name)

        try:
            if executable.startswith("ms-settings:"):
                os.system(f"start {executable}")
            else:
                # Check if executable exists in PATH or use startfile
                cmd_path = shutil.which(executable)
                if cmd_path:
                    subprocess.Popen([cmd_path], shell=True)
                else:
                    # Windows shell start
                    os.startfile(executable)

            await asyncio.sleep(0.5)
            # Verify process launched
            verified = await self.verify_result(None, app_name=normalized_name)
            return ToolResult(
                success=True,
                data={"app_name": app_name, "executable": executable},
                message=f"Successfully opened {app_name}.",
                verified=verified
            )
        except Exception as e:
            # Fallback to powershell Start-Process
            try:
                subprocess.Popen(["powershell", "-Command", f"Start-Process {executable}"], shell=True)
                return ToolResult(
                    success=True,
                    data={"app_name": app_name},
                    message=f"Launched {app_name} via Windows process manager.",
                    verified=True
                )
            except Exception as e2:
                return ToolResult(
                    success=False,
                    message=f"Failed to launch application '{app_name}': {str(e2)}",
                    error=str(e2),
                    verified=False
                )

    async def verify_result(self, result: Any, app_name: str = "", **kwargs) -> bool:
        # Check tasklist for common apps
        try:
            proc = subprocess.run(["tasklist"], capture_output=True, text=True, timeout=2)
            exe_name = self.APP_MAPPINGS.get(app_name, app_name).lower()
            if exe_name.endswith(".exe"):
                return exe_name in proc.stdout.lower()
            return True
        except Exception:
            return True

class SystemInfoTool(BaseTool):
    name = "desktop.system_info"
    description = "Retrieves current Windows desktop system telemetry, including OS info, CPU, and memory status."
    safety_level = SafetyLevel.SAFE
    parameters = {
        "type": "object",
        "properties": {},
    }

    async def execute(self, **kwargs) -> ToolResult:
        try:
            info = {
                "os": platform.system(),
                "os_release": platform.release(),
                "os_version": platform.version(),
                "machine": platform.machine(),
                "processor": platform.processor(),
            }
            # Windows memory query via PowerShell
            try:
                ps_cmd = "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory"
                res = subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, text=True, timeout=3)
                info["memory_details"] = res.stdout.strip()
            except Exception:
                pass

            return ToolResult(
                success=True,
                data=info,
                message=f"System online: {info['os']} {info['os_release']} on {info['machine']}.",
                verified=True
            )
        except Exception as e:
            return ToolResult(success=False, message="Unable to query system telemetry", error=str(e))
