# JARVIS — Personal AI Desktop Assistant (Windows 10/11)

Inspired by Tony Stark’s iconic artificial intelligence, **JARVIS** is a personal AI desktop assistant engineered for **Windows 10/11**. It bridges voice interaction, AI task planning, and controlled desktop automation with a high-fidelity Iron Man-inspired HUD.

---

## 1. Feature Checklist

| Feature Category | Capability | Status | Implementation Details |
|---|---|---|---|
| **Voice Engine** | Speech-to-Text (STT) | **Implemented** | Web Speech API in Chromium/Electron + live transcription stream |
| | Text-to-Speech (TTS) | **Implemented** | High-fidelity Microsoft Edge Neural voices (`edge-tts`) + Windows SAPI5 fallback |
| | Push-to-Talk | **Implemented** | Interactive mic button + `Ctrl+Space` global hotkey |
| | Speech Interruption | **Implemented** | Live playback cancellation via UI or stop command |
| **Desktop Automation**| Windows App Launcher | **Implemented** | Shell & process execution with strict allowlist (Chrome, Notepad, Calc, VS Code, etc.) |
| | System Telemetry | **Implemented** | OS version, CPU, and RAM diagnostics |
| | Multimedia / Volume | **Implemented** | Windows volume controls (Up, Down, Mute) |
| | Global Shortcut | **Implemented** | `Ctrl + Shift + J` window focus and hotkey activation |
| **Media & Web** | YouTube Video Search | **Implemented** | Validated YouTube search and playback execution |
| | Web Search | **Implemented** | Google & Bing query dispatching |
| **Email Management** | Read & Search Emails | **Implemented** | Search emails by sender, subject, keywords (Supports Mock & Gmail OAuth) |
| | Draft Replies | **Implemented** | Generates professional drafts (e.g., professor extension requests) |
| | Confirmed Sending | **Implemented** | Mandatory confirmation modal with editable recipient/subject/body |
| **Calendar & Schedule**| List Events | **Implemented** | Agenda listing and upcoming schedule inspection |
| | Conflict Detection | **Implemented** | Detects overlapping timetable slots before scheduling |
| | Recurring Study Plans| **Implemented** | Multi-day daily study session generation (e.g. 7-day DSA routine) |
| | Cancel Events | **Implemented** | Event cancellation requiring user confirmation |
| **Study Mode** | Concept Explainer | **Implemented** | Academic breakdown with intuitions and Big-O complexity |
| | Practice Quiz | **Implemented** | Practice multiple-choice questions with instant answer reveal |
| | Word Docs (`.docx`) | **Implemented** | Formatted Word document generation saved to `data/outputs/` |
| | Code Complexity Review | **Implemented** | Static code and syntax inspection for Java, Python, C++ |
| **Safety & Security** | Action Confirmation | **Implemented** | Consequential actions (email dispatch, delete) require user approval |
| | App Allowlist | **Implemented** | Rejects unapproved executables |
| | Immutable Audit Log | **Implemented** | SQLite audit trail with parameters and verification status |
| **AI Providers** | Google Gemini | **Implemented** | Supports Gemini 2.0 Flash via API key |
| | OpenAI / Groq | **Implemented** | Supports GPT-4o-mini and Groq models |
| | Offline Smart Planner | **Implemented** | Zero-dependency offline NLP intent parser works 100% out of the box |

---

## 2. Architecture Overview

```
jarvis-assistant/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (chat, voice, calendar, emails, settings)
│   │   ├── core/         # Config, SQLite database, safety levels & allowlist
│   │   ├── models/       # Pydantic request/response schemas
│   │   ├── planner/      # AI task planner, intent parser, LLM provider abstraction
│   │   ├── tools/        # Modular tool registry (desktop, email, calendar, media, study)
│   │   ├── voice/        # Edge-TTS neural speech synthesis & fallback
│   │   └── main.py       # FastAPI application entrypoint
│   ├── tests/            # Automated Pytest suite
│   ├── requirements.txt  # Python dependencies
│   └── data/             # SQLite database and generated output documents
├── frontend/
│   ├── src/
│   │   ├── components/   # Arc Reactor visualizer, HUD tabs, CommandBar, Modals
│   │   ├── hooks/        # useVoiceRecognition, useAudioPlayer
│   │   ├── services/     # Backend REST client
│   │   └── App.tsx       # Root React UI
│   ├── package.json
│   └── vite.config.ts
├── desktop/              # Electron main process & preload IPC
│   ├── main.cjs
│   └── preload.cjs
├── run_jarvis.bat        # Windows 1-click startup launcher
└── README.md
```

---

## 3. Quick Start & Setup

### Prerequisites
- **Windows 10 or 11**
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 or 24 recommended)
- Working Microphone & Speakers

### Option A: 1-Click Launch (Recommended)
Simply double-click:
```bat
run_jarvis.bat
```
This automatically boots the FastAPI backend on port `8000` and starts the Vite frontend interface on `http://localhost:5173`.

### Option B: Manual Setup

#### 1. Backend Setup
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

#### 3. Electron Desktop App (Optional)
```powershell
npm run desktop:start
```

---

## 4. Example Voice & Text Commands

Try speaking or typing any of the following natural commands:

- **Desktop Automation:**
  - *"Jarvis, open Chrome"*
  - *"Jarvis, launch Notepad"*
  - *"Jarvis, open Calculator"*
  - *"System diagnostics"*
- **Media Control:**
  - *"Jarvis, play Java recursion tutorial on YouTube"*
  - *"Volume up"* / *"Volume down"* / *"Mute"*
- **Email Management (Safety Gate):**
  - *"Jarvis, find my latest email from my professor and draft a polite reply asking for an extension"*
  - *JARVIS will locate the email, prepare the formal draft, and display an authorization modal for your approval before sending!*
- **Calendar & Scheduling:**
  - *"Jarvis, schedule DSA practice every day from 7 PM to 8 PM for the next seven days"*
  - *"What is my schedule?"*
  - *"Remind me to review Operating Systems tomorrow at 8 PM"*
- **Study Mode:**
  - *"Jarvis, explain Binary Search Tree"*
  - *"Quiz me on Operating Systems"*
  - *"Create document for Data Structures Notes"*
  - *"Analyze this Java code"*

---

## 5. Configuring Google OAuth 2.0 Credentials (Optional)

JARVIS comes equipped with a **Mock Mode** enabled by default so you can test and use all email and calendar features immediately without requiring any cloud setup.

To connect to your live personal Google account:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project called `JARVIS-Assistant`.
3. Enable the **Gmail API** and **Google Calendar API** under *APIs & Services > Library*.
4. Go to *APIs & Services > Credentials* and click **Create Credentials > OAuth client ID**.
5. Select **Desktop App** as the application type.
6. Copy the `Client ID` and `Client Secret` into `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   MOCK_MODE=False
   ```

---

## 6. AI Provider Keys

JARVIS includes an **Offline Intelligent Intent Planner** that operates completely offline without needing paid API keys.

If you wish to use Google Gemini or OpenAI:
1. Create a `.env` file in the project root (or copy `.env.example`).
2. Add your key:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   or
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```
3. You can also configure keys live at runtime via the **SYSTEM CONFIG** tab in the UI!

---

## 7. Running Automated Tests

Run the test suite using `pytest`:
```powershell
cd backend
python -m pytest tests -v
```
All tests verify intent classification, tool registration, safety allowlists, calendar conflict detection, and document generation.

---

## 8. Troubleshooting

| Issue | Cause | Resolution |
|---|---|---|
| **Voice recognition not listening** | Microphone permissions disabled in Windows | Allow microphone access in Windows Settings > Privacy & Security > Microphone. |
| **Speech audio not playing** | Audio output muted or Edge TTS network timeout | Check system volume; JARVIS will automatically fallback to Windows SAPI5 voice. |
| **Backend port conflict** | Port 8000 already in use | Change `PORT` in `.env` to `8001` or another open port. |
| **Global shortcut not responding** | Another application registered `Ctrl+Shift+J` | Open JARVIS from the taskbar or rebind shortcut in `desktop/main.cjs`. |
