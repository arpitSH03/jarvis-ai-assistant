import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CommandBar } from './components/CommandBar';
import { DashboardTab } from './components/DashboardTab';
import { StudyModeTab } from './components/StudyModeTab';
import { ScheduleTab } from './components/ScheduleTab';
import { EmailsTab } from './components/EmailsTab';
import { AuditLogTab } from './components/AuditLogTab';
import { SettingsTab } from './components/SettingsTab';
import { ConfirmationModal } from './components/ConfirmationModal';

import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { api } from './services/api';
import { JarvisState, ConversationMessage, TaskStep, PendingConfirmation } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jarvisState, setJarvisState] = useState<JarvisState>('idle');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentSteps, setCurrentSteps] = useState<TaskStep[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const [systemStatus, setSystemStatus] = useState({
    online: true,
    provider: 'gemini',
    mockMode: true,
  });

  const { isPlaying, frequencyData, playAudioBase64, stopAudio } = useAudioPlayer();

  // Handle incoming command execution
  const executeCommand = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    // Add user message to conversation history
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setJarvisState('processing');

    try {
      const response = await api.sendChatMessage(userText, true);

      // Add JARVIS response
      const jarvisMsg: ConversationMessage = {
        role: 'jarvis',
        content: response.response_text,
        timestamp: new Date().toISOString(),
        task_id: response.task_id,
        tools: response.tools_executed.map((t) => t.tool_name),
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      if (response.steps && response.steps.length > 0) {
        setCurrentSteps(response.steps);
      }

      // Check if confirmation is required
      if (response.pending_confirmation) {
        setPendingConfirmation(response.pending_confirmation);
        setJarvisState('awaiting_confirmation');
      } else {
        setPendingConfirmation(null);
      }

      // Play synthesized audio response
      if (response.audio_base64) {
        setJarvisState('speaking');
        playAudioBase64(response.audio_base64, () => {
          setJarvisState(response.pending_confirmation ? 'awaiting_confirmation' : 'idle');
        });
      } else {
        setJarvisState(response.pending_confirmation ? 'awaiting_confirmation' : 'idle');
      }
    } catch (err: any) {
      console.error('Execution error:', err);
      const errMsg: ConversationMessage = {
        role: 'jarvis',
        content: `I encountered an unexpected error processing your command: ${err.message || err}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setJarvisState('idle');
    }
  }, [playAudioBase64]);

  // Voice recognition hook
  const {
    isListening,
    liveTranscript,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    onTranscriptComplete: (transcript) => {
      executeCommand(transcript);
    },
  });

  // Keep jarvisState in sync when listening
  useEffect(() => {
    if (isListening) {
      setJarvisState('listening');
      stopAudio();
    } else if (jarvisState === 'listening') {
      setJarvisState('idle');
    }
  }, [isListening, jarvisState, stopAudio]);

  // Initial load
  useEffect(() => {
    api.fetchHistory().then((hist) => {
      if (hist && hist.length > 0) {
        setMessages(hist);
      }
    }).catch(() => {});

    api.fetchSettings().then((s) => {
      setSystemStatus({
        online: true,
        provider: s.ai_provider,
        mockMode: s.mock_mode,
      });
    }).catch(() => {
      setSystemStatus((prev) => ({ ...prev, online: false }));
    });
  }, []);

  // Confirmation modal callbacks
  const handleConfirmAction = async (confirmationId: string, modifiedParams?: any) => {
    setJarvisState('processing');
    setPendingConfirmation(null);
    try {
      const res = await api.confirmAction(confirmationId, true, modifiedParams);
      const confirmMsg: ConversationMessage = {
        role: 'jarvis',
        content: res.response_text,
        timestamp: new Date().toISOString(),
        tools: res.tools_executed.map((t) => t.tool_name),
      };
      setMessages((prev) => [...prev, confirmMsg]);

      if (res.audio_base64) {
        setJarvisState('speaking');
        playAudioBase64(res.audio_base64, () => {
          setJarvisState('idle');
        });
      } else {
        setJarvisState('idle');
      }
    } catch (e: any) {
      console.error(e);
      setJarvisState('idle');
    }
  };

  const handleCancelAction = async (confirmationId: string) => {
    setPendingConfirmation(null);
    try {
      const res = await api.confirmAction(confirmationId, false);
      const cancelMsg: ConversationMessage = {
        role: 'jarvis',
        content: res.response_text || 'Action cancelled.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, cancelMsg]);
      setJarvisState('idle');
    } catch (e) {
      setJarvisState('idle');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-jarvis-dark text-slate-100 overflow-hidden hud-grid">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <DashboardTab
            state={jarvisState}
            frequencies={frequencyData}
            messages={messages}
            currentSteps={currentSteps}
            liveTranscript={liveTranscript}
            isListening={isListening}
            onActivateMic={startListening}
          />
        )}
        {activeTab === 'study' && <StudyModeTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'emails' && (
          <EmailsTab onTriggerEmailWorkflow={(cmd) => executeCommand(cmd)} />
        )}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Persistent Bottom Command Bar */}
      <CommandBar
        state={jarvisState}
        isListening={isListening}
        onStartListening={startListening}
        onStopListening={stopListening}
        onSubmitText={executeCommand}
        onStopPlayback={stopAudio}
        liveTranscript={liveTranscript}
      />

      {/* Action Confirmation Modal */}
      {pendingConfirmation && (
        <ConfirmationModal
          confirmation={pendingConfirmation}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
};
