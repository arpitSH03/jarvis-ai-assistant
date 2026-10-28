export type JarvisState = 'idle' | 'listening' | 'processing' | 'speaking' | 'awaiting_confirmation';

export interface TaskStep {
  step_number: number;
  description: string;
  tool_name: string;
  parameters: Record<string, any>;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'AWAITING_CONFIRMATION';
  result?: any;
}

export interface ToolCallInfo {
  tool_name: string;
  parameters: Record<string, any>;
  result?: any;
  success: boolean;
  error?: string;
}

export interface PendingConfirmation {
  id: string;
  tool_name: string;
  action_description: string;
  parameters: Record<string, any>;
  safety_level: 'SAFE' | 'CONFIRMATION_REQUIRED' | 'ADMIN';
  created_at?: string;
}

export interface ChatResponse {
  response_text: string;
  spoken_text?: string;
  audio_base64?: string;
  task_id?: string;
  steps?: TaskStep[];
  pending_confirmation?: PendingConfirmation;
  tools_executed: ToolCallInfo[];
  status: string;
}

export interface ConversationMessage {
  id?: number;
  role: 'user' | 'jarvis' | 'system';
  content: string;
  timestamp?: string;
  meta_data?: any;
  task_id?: string;
  tools?: string[];
  pending_confirmation?: PendingConfirmation;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  category?: string;
  location?: string;
}

export interface EmailItem {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  is_read?: boolean;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  tool_name: string;
  parameters: string;
  safety_level: string;
  status: string;
  details?: string;
}

export interface SystemSettings {
  ai_provider: string;
  gemini_api_key_configured: boolean;
  openai_api_key_configured: boolean;
  groq_api_key_configured: boolean;
  mock_mode: boolean;
  tts_voice: string;
  allowed_applications: string[];
}
