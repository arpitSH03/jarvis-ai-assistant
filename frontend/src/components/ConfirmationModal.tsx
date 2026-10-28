import React, { useState } from 'react';
import { AlertTriangle, Check, X, ShieldAlert, Mail } from 'lucide-react';
import { PendingConfirmation } from '../types';

interface ConfirmationModalProps {
  confirmation: PendingConfirmation;
  onConfirm: (confirmationId: string, modifiedParameters?: any) => void;
  onCancel: (confirmationId: string) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  onConfirm,
  onCancel,
}) => {
  const isEmail = confirmation.tool_name === 'email.send';
  const initialParams = confirmation.parameters || {};

  const [recipient, setRecipient] = useState(initialParams.recipient || '');
  const [subject, setSubject] = useState(initialParams.subject || '');
  const [body, setBody] = useState(initialParams.body || '');

  const handleApprove = () => {
    if (isEmail) {
      onConfirm(confirmation.id, { recipient, subject, body });
    } else {
      onConfirm(confirmation.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-jarvis-card border-2 border-amber-500/70 rounded-2xl shadow-2xl shadow-amber-500/20 overflow-hidden hud-corner">
        {/* Header */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-hud font-bold text-amber-400 text-sm tracking-widest uppercase">
                AUTHORIZATION REQUIRED
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Action requires explicit verification prior to execution.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {confirmation.safety_level}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-jarvis-dark/60 rounded-xl p-3 border border-jarvis-border">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">PROPOSED TASK</p>
            <p className="text-sm font-semibold text-slate-200">{confirmation.action_description}</p>
          </div>

          {/* If Email Dispatch Confirmation: show editable fields */}
          {isEmail ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">RECIPIENT</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SUBJECT</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">MESSAGE BODY</label>
                <textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-jarvis-dark border border-jarvis-border rounded-lg px-3 py-2 text-xs font-sans text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="bg-jarvis-dark/40 rounded-xl p-3 border border-jarvis-border">
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                {JSON.stringify(confirmation.parameters, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs text-amber-300/80 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
            <AlertTriangle size={16} className="shrink-0" />
            <span>JARVIS will execute this verified computer action immediately upon your authorization.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-jarvis-dark/80 px-6 py-4 border-t border-jarvis-border flex items-center justify-end space-x-3">
          <button
            onClick={() => onCancel(confirmation.id)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-xs font-hud transition-colors"
          >
            <X size={15} />
            <span>DISMISS & CANCEL</span>
          </button>

          <button
            onClick={handleApprove}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/25 text-xs font-hud transition-colors"
          >
            <Check size={16} />
            <span>AUTHORIZE & EXECUTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
