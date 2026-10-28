import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.config import settings

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(settings.DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL, -- PENDING, IN_PROGRESS, AWAITING_CONFIRMATION, COMPLETED, FAILED, CANCELLED
        plan_steps TEXT, -- JSON array of steps
        current_step INTEGER DEFAULT 0,
        result TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    
    # 2. Audit Logs Table (Safety & Consequential action logs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        parameters TEXT,
        safety_level TEXT NOT NULL, -- SAFE, CONFIRMATION_REQUIRED, ADMIN
        status TEXT NOT NULL, -- EXECUTED, CONFIRMED, REJECTED, FAILED
        details TEXT
    )
    """)
    
    # 3. Conversation History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        role TEXT NOT NULL, -- user, jarvis, system
        content TEXT NOT NULL,
        meta_data TEXT
    )
    """)
    
    # 4. Reminders & Schedule (Local calendar storage & sync)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        category TEXT DEFAULT 'general',
        is_completed INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)
    
    # 5. Study Notes & Materials
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_notes (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        source_file TEXT,
        tags TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

# Helper queries
def log_audit(tool_name: str, parameters: Dict[str, Any], safety_level: str, status: str, details: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO audit_logs (timestamp, tool_name, parameters, safety_level, status, details) VALUES (?, ?, ?, ?, ?, ?)",
        (datetime.now().isoformat(), tool_name, json.dumps(parameters), safety_level, status, details)
    )
    conn.commit()
    conn.close()

def save_conversation_message(role: str, content: str, meta_data: Optional[Dict[str, Any]] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO conversations (timestamp, role, content, meta_data) VALUES (?, ?, ?, ?)",
        (datetime.now().isoformat(), role, content, json.dumps(meta_data or {}))
    )
    conn.commit()
    conn.close()

def get_recent_conversations(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversations ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in reversed(rows)]

def get_recent_audit_logs(limit: int = 30) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Ensure DB schema is initialized
init_db()

