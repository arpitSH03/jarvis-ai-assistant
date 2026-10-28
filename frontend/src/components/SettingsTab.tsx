import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Mic, Shield, Check, Info } from 'lucide-react';
import { api } from '../services/api';
import { SystemSettings } from '../types';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('en-US-ChristopherNeural');
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [mockMode, setMockMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.fetchSettings().then((data) => {
      setSettings(data);
      setSelectedVoice(data.tts_voice || 'en-US-ChristopherNeural');
      setSelectedProvider(data.ai_provider || 'gemini');
      setMockMode(data.mock_mode);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        ai_provider: selectedProvider,
        gemini_api_key: geminiKey || undefined,
        openai_api_key: openaiKey || undefined,
        tts_voice: selectedVoice,
        mock_mode: mockMode,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-jarvis-border pb-4">
        <div className="flex items-center space-x-2">
          <SettingsIcon size={20} className="text-jarvis-cyan" />
          <h2 className="font-hud font-bold text-lg text-slate-100 tracking-wider">
            SYSTEM CONFIGURATION & PRIVACY
          </h2>
        </div>
        <p className="text-xs font-mono text-slate-400">
          Control neural voice synthesis, AI providers, mock mode fallback, and Windows security.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Section */}
        <div className="hud-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-hud text-jarvis-cyan font-bold tracking-wider uppercase">
            <Key size={15} />
            <span>AI MODEL & INTELLIGENCE ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">AI PROVIDER</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              >
                <option value="gemini">Google Gemini (Gemini 2.0 Flash)</option>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
                <option value="offline_mock">Built-in Offline Smart Planner (No key needed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">MOCK MODE (RECOMMENDED FOR TESTING)</label>
              <div className="flex items-center space-x-3 mt-2">
                <input
                  type="checkbox"
                  id="mockMode"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  className="w-4 h-4 rounded text-jarvis-cyan bg-jarvis-dark border-jarvis-border focus:ring-0"
                />
                <label htmlFor="mockMode" className="text-xs font-sans text-slate-300 cursor-pointer">
                  Enable realistic mock data for Gmail & Calendar when OAuth is absent
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">GEMINI API KEY</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.gemini_api_key_configured ? '•••••••••••••••• (Configured)' : 'Enter Gemini API Key (Optional)'}
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">OPENAI API KEY</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={settings?.openai_api_key_configured ? '•••••••••••••••• (Configured)' : 'Enter OpenAI API Key (Optional)'}
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>
          </div>
        </div>

        {/* Neural Voice Engine Section */}
        <div className="hud-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-hud text-jarvis-cyan font-bold tracking-wider uppercase">
            <Mic size={15} />
            <span>NEURAL VOICE SYNTHESIS</span>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">JARVIS VOICE ACCENT & TONE</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
            >
              <option value="en-US-ChristopherNeural">US Christopher Neural (Calm, Intelligent, Stark Style)</option>
              <option value="en-GB-RyanNeural">British Ryan Neural (Classic British JARVIS)</option>
              <option value="en-US-GuyNeural">US Guy Neural (Deep & Authoritative)</option>
              <option value="en-IN-PrabhatNeural">Indian Prabhat Neural (Indian English Male)</option>
            </select>
          </div>
        </div>

        {/* Global Shortcuts Reference */}
        <div className="hud-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-hud text-jarvis-cyan font-bold tracking-wider uppercase">
            <Shield size={15} />
            <span>DESKTOP SHORTCUTS & PERMITTED APPLICATIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-jarvis-dark/60 p-3 rounded-xl border border-jarvis-border">
              <span className="text-slate-400 block mb-1">GLOBAL ACTIVATION</span>
              <span className="text-jarvis-cyan font-bold">Ctrl + Shift + J</span> (Activates window from any app)
            </div>
            <div className="bg-jarvis-dark/60 p-3 rounded-xl border border-jarvis-border">
              <span className="text-slate-400 block mb-1">PUSH TO TALK</span>
              <span className="text-jarvis-cyan font-bold">Ctrl + Space</span> (Hold to speak, release to send)
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-mono text-slate-400 block mb-1.5">APPROVED DESKTOP APPLICATION ALLOWLIST:</span>
            <div className="flex flex-wrap gap-1.5">
              {settings?.allowed_applications.map((app, idx) => (
                <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-jarvis-navy border border-jarvis-border text-slate-300">
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400">
              <Check size={16} />
              <span>CONFIGURATION SAVED TO SYSTEM</span>
            </div>
          ) : <div />}

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white transition-colors"
          >
            <Save size={15} />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
