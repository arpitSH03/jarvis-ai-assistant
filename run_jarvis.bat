@echo off
TITLE JARVIS — Personal AI Desktop Assistant Launcher
COLOR 0B

echo ========================================================
echo        JARVIS // STARK INDUSTRIES DESKTOP AI
echo ========================================================
echo.
echo [*] Checking Python environment...
python --version
if errorlevel 1 (
    echo [ERROR] Python is not found in PATH! Please install Python 3.10+
    pause
    exit /b 1
)

echo [*] Checking Node.js environment...
node --version
if errorlevel 1 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js 18+
    pause
    exit /b 1
)

echo.
echo [*] Initializing JARVIS FastAPI Backend on http://127.0.0.1:8000 ...
start "JARVIS Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [*] Waiting 3 seconds for backend services to spin up...
timeout /t 3 /nobreak > nul

echo [*] Launching JARVIS Frontend Interface...
start "JARVIS Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo [*] Systems active!
echo [*] Backend:  http://127.0.0.1:8000/docs
echo [*] Frontend: http://localhost:5173
echo.
echo Press any key to open JARVIS in your default browser...
pause > nul
start http://localhost:5173

exit /b 0
