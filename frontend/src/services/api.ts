import { ChatResponse, AuditLog, CalendarEvent, EmailItem, SystemSettings } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  async sendChatMessage(message: string, generateSpeech: boolean = true): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, generate_speech: generateSpeech }),
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  },

  async confirmAction(confirmationId: string, approved: boolean, modifiedParameters?: any): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/tools/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmation_id: confirmationId,
        approved,
        modified_parameters: modifiedParameters,
      }),
    });
    if (!res.ok) {
      throw new Error(`Confirmation error: ${res.statusText}`);
    }
    return res.json();
  },

  async fetchHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/history`);
    const data = await res.json();
    return data.history || [];
  },

  async fetchAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit`);
    const data = await res.json();
    return data.audit_logs || [];
  },

  async fetchCalendarEvents(): Promise<CalendarEvent[]> {
    const res = await fetch(`${API_BASE}/calendar/events`);
    const data = await res.json();
    return data.events || [];
  },

  async createCalendarEvent(title: string, startTime: string): Promise<any> {
    const res = await fetch(`${API_BASE}/calendar/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, start_time: startTime }),
    });
    return res.json();
  },

  async fetchEmails(query: string = ''): Promise<EmailItem[]> {
    const res = await fetch(`${API_BASE}/emails?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.emails || [];
  },

  async fetchSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settingsData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    return res.json();
  },

  async synthesizeSpeech(text: string): Promise<string | null> {
    const res = await fetch(`${API_BASE}/voice/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.audio_base64 || null;
  }
};
