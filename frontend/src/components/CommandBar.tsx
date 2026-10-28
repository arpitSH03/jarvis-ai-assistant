import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Square, Sparkles } from 'lucide-react';
import { JarvisState } from '../types';

interface CommandBarProps {
  state: JarvisState;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitText: (text: string) => void;
  onStopPlayback: () => void;
  liveTranscript?: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  state,
  isListening,
  onStartListening,
  onStopListening,
  onSubmitText,
  onStopPlayback,
  liveTranscript = '',
}) => {
  const [inputText, setInputText] = useState('');

  // Handle Spacebar Push-to-Talk when not focused on an input element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isListening) onStartListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, onStartListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitText(inputText.trim());
    setInputText('');
  };

  const sampleCommands = [
    "Open Chrome",
    "Play Java recursion tutorial on YouTube",
    "Schedule DSA practice every day from 7 PM to 8 PM for the next seven days",
    "Find my latest email from my professor and draft a polite reply asking for an extension",
    "Explain Binary Search Tree",
    "System diagnostics"
  ];

  return (
    <div className="border-t border-jarvis-border bg-jarvis-dark/95 backdrop-blur-md p-4">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        <div className="flex items-center space-x-1 text-jarvis-cyan text-[11px] font-mono shrink-0 pl-1">
          <Sparkles size={12} />
          <span>SUGGESTED:</span>
        </div>
        {sampleCommands.map((cmd, i) => (
          <button
            key={i}
            onClick={() => onSubmitText(cmd)}
            className="text-xs font-mono text-slate-300 hover:text-jarvis-cyan hover:border-jarvis-cyan/50 bg-jarvis-card/80 border border-jarvis-border px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Main Input Controls */}
      <div className="flex items-center space-x-3 max-w-5xl mx-auto">
        {/* Push-to-Talk Mic Button */}
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`relative p-3.5 rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-jarvis-navy border-jarvis-cyan/40 text-jarvis-cyan hover:border-jarvis-cyan hover:shadow-lg hover:shadow-jarvis-cyan/25'
          }`}
          title={isListening ? "Listening... Click to stop" : "Push to Talk (or Ctrl+Space)"}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          {isListening && (
            <span className="absolute -inset-1 rounded-full border border-red-500/40 animate-ping pointer-events-none" />
          )}
        </button>

        {/* Text Input Box */}
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
          <input
            type="text"
            value={isListening ? liveTranscript || 'Listening to your command...' : inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isListening}
            placeholder="Type a voice command or request (e.g. 'Jarvis, schedule study session...')"
            className={`w-full bg-jarvis-card border rounded-xl py-3 pl-4 pr-12 text-sm font-sans focus:outline-none transition-all placeholder:text-slate-500 ${
              isListening
                ? 'border-red-500/50 text-red-300 italic bg-red-950/10'
                : 'border-jarvis-border text-slate-100 focus:border-jarvis-cyan focus:shadow-md focus:shadow-jarvis-cyan/15'
            }`}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isListening}
            className="absolute right-2 p-2 rounded-lg bg-jarvis-cyan text-jarvis-dark hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Execute Command"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Stop Playback Button (Interruption support) */}
        {state === 'speaking' && (
          <button
            onClick={onStopPlayback}
            className="flex items-center space-x-1.5 px-3 py-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-hud transition-colors"
            title="Interrupt JARVIS speech"
          >
            <Square size={14} />
            <span className="hidden sm:inline">STOP</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 max-w-5xl mx-auto px-1">
        <span>PRESS SPACEBAR OR CLICK MIC FOR VOICE INPUT</span>
        <span className="text-jarvis-cyan/70">PROMPT INJECTION SANITIZATION: ACTIVE</span>
      </div>
    </div>
  );
};
