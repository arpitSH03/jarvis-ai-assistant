@echo off
TITLE JARVIS Backend Server
COLOR 0A
cd backend
echo Starting JARVIS FastAPI Server on http://127.0.0.1:8000 ...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
