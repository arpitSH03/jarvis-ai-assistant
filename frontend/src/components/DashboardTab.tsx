import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ArcReactor } from './ArcReactor';
import { AudioWaveform } from './AudioWaveform';
import { JarvisState, ConversationMessage, TaskStep } from '../types';

interface DashboardTabProps {
  state: JarvisState;
  frequencies: number[];
  messages: ConversationMessage[];
  currentSteps: TaskStep[];
  liveTranscript: string;
  isListening: boolean;
  onActivateMic: () => void;
  systemTelemetry?: any;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  state,
  frequencies,
  messages,
  currentSteps,
  liveTranscript,
  isListening,
  onActivateMic,
  systemTelemetry,
}) => {
  const latestJarvisMessage = [...messages].reverse().find(m => m.role === 'jarvis');
  const latestUserMessage = [...messages].reverse().find(m => m.role === 'user');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full p-4 overflow-y-auto">
      {/* LEFT COLUMN: Arc Reactor & Status Visualizer (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* Core Arc Reactor Card */}
        <div className="hud-panel rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
          <div className="absolute top-3 left-4 flex items-center space-x-2 text-xs font-hud text-jarvis-cyan">
            <Activity size={14} />
            <span>CORE REACTOR // MK-VII</span>
          </div>

          <div className="my-3">
            <ArcReactor 
              state={state} 
              frequencies={frequencies} 
              onClick={onActivateMic} 
            />
          </div>

          {/* Voice Waveform below Arc Reactor */}
          <div className="w-full mt-4">
            <AudioWaveform 
              frequencies={frequencies} 
              active={state === 'speaking' || isListening} 
              color={state === 'awaiting_confirmation' ? '#f59e0b' : '#00f0ff'}
            />
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-1">
            {isListening 
              ? "TRANSCRIBING AUDIO INPUT..." 
              : state === 'speaking' 
              ? "SYNTHESIZING NEURAL SPEECH..." 
              : state === 'processing' 
              ? "DECOMPOSING TASK INSTRUCTIONS..." 
              : "JARVIS IDLE // CLICK CORE TO COMMENCE"}
          </p>
        </div>

        {/* Live Transcription HUD */}
        <div className="hud-panel rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-hud text-slate-400 mb-2">
            <span>LIVE SPEECH STREAM</span>
            {isListening && <span className="text-red-400 animate-pulse">● RECORDING</span>}
          </div>
          <div className="bg-jarvis-dark/80 rounded-xl p-3 border border-jarvis-border min-h-[60px] flex items-center">
            {liveTranscript ? (
              <p className="text-sm font-sans text-slate-100 italic">"{liveTranscript}"</p>
            ) : latestUserMessage ? (
              <p className="text-xs font-mono text-slate-400">
                Last Command: <span className="text-slate-200">"{latestUserMessage.content}"</span>
              </p>
            ) : (
              <p className="text-xs font-mono text-slate-500">Awaiting voice command or hotkey...</p>
            )}
          </div>
        </div>

        {/* System Diagnostics Telemetry Card */}
        <div className="hud-panel rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-xs font-hud text-jarvis-cyan mb-3">
            <ShieldCheck size={14} />
            <span>ACTIVE SECURITY & EXECUTION ALLOWLIST</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-jarvis-dark/50 p-2 rounded-lg border border-jarvis-border/60">
              <span className="text-slate-500 block text-[10px]">APPLICATION GATE</span>
              <span className="text-emerald-400 font-semibold">STRICT ALLOWLIST</span>
            </div>
            <div className="bg-jarvis-dark/50 p-2 rounded-lg border border-jarvis-border/60">
              <span className="text-slate-500 block text-[10px]">OAUTH PROTOCOL</span>
              <span className="text-jarvis-cyan font-semibold">MOCK / OAUTH2</span>
            </div>
            <div className="bg-jarvis-dark/50 p-2 rounded-lg border border-jarvis-border/60">
              <span className="text-slate-500 block text-[10px]">VERIFICATION ENGINE</span>
              <span className="text-slate-200 font-semibold">ACTIVE CHECKS</span>
            </div>
            <div className="bg-jarvis-dark/50 p-2 rounded-lg border border-jarvis-border/60">
              <span className="text-slate-500 block text-[10px]">GLOBAL SHORTCUT</span>
              <span className="text-slate-200 font-semibold">CTRL+SHIFT+J</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Assistant Response & Task Execution Pipeline (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Latest Response Card */}
        <div className="hud-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-jarvis-cyan/20 border border-jarvis-cyan/40 flex items-center justify-center text-jarvis-cyan">
                <Bot size={15} />
              </div>
              <h2 className="font-hud font-bold text-sm tracking-wider text-slate-100">
                JARVIS DIRECTIVE RESPONSE
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {latestJarvisMessage?.timestamp ? new Date(latestJarvisMessage.timestamp).toLocaleTimeString() : 'ONLINE'}
            </span>
          </div>

          <div className="min-h-[100px] flex items-center">
            {latestJarvisMessage ? (
              <div className="space-y-2 w-full">
                <p className="text-base font-sans text-slate-100 leading-relaxed">
                  {latestJarvisMessage.content}
                </p>
                {latestJarvisMessage.tools && latestJarvisMessage.tools.length > 0 && (
                  <div className="flex items-center space-x-1 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Tools Invoked:</span>
                    {latestJarvisMessage.tools.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-jarvis-cyan">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-sans text-slate-400 italic">
                "Good evening, sir. All automated subsystems and tools are initialized. Ready for your command."
              </p>
            )}
          </div>
        </div>

        {/* Task Steps & Progress Panel */}
        <div className="hud-panel rounded-2xl p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Layers size={16} className="text-jarvis-cyan" />
              <h3 className="font-hud font-bold text-sm tracking-wider text-slate-100">
                TASK PIPELINE & STEP EXECUTION
              </h3>
            </div>
            <span className="text-xs font-mono text-jarvis-cyan">
              {currentSteps.length > 0 ? `${currentSteps.length} STEP(S)` : 'STANDBY'}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {currentSteps.length > 0 ? (
              currentSteps.map((step) => {
                const isComplete = step.status === 'COMPLETED';
                const isRunning = step.status === 'RUNNING';
                const isAwaiting = step.status === 'AWAITING_CONFIRMATION';
                const isFailed = step.status === 'FAILED';

                return (
                  <motion.div
                    key={step.step_number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isRunning
                        ? 'bg-jarvis-cyan/10 border-jarvis-cyan/50 shadow-md shadow-jarvis-cyan/10'
                        : isAwaiting
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : isComplete
                        ? 'bg-jarvis-dark/60 border-emerald-500/30'
                        : isFailed
                        ? 'bg-red-500/10 border-red-500/40'
                        : 'bg-jarvis-dark/40 border-jarvis-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{step.step_number}
                        </span>
                        <span className="text-xs font-hud text-jarvis-cyan font-semibold">
                          {step.tool_name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                        isRunning ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                        isAwaiting ? 'bg-amber-500/20 text-amber-300' :
                        isFailed ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-slate-200">{step.description}</p>

                    {step.result && (
                      <div className="mt-2 pt-2 border-t border-jarvis-border/40 text-[11px] font-mono text-emerald-300/90">
                        ✓ Verified: {typeof step.result === 'object' ? JSON.stringify(step.result) : String(step.result)}
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Terminal size={32} className="mb-2 opacity-40 text-jarvis-cyan" />
                <p className="text-xs font-mono">No active background tasks executing.</p>
                <p className="text-[11px] font-mono text-slate-600 mt-1">
                  Commands issued via voice or text will be decomposed into verified steps here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
