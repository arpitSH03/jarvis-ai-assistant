import React, { useState, useEffect } from 'react';
import { Mail, Search, Send, Clock, User, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { EmailItem } from '../types';

interface EmailsTabProps {
  onTriggerEmailWorkflow: (command: string) => void;
}

export const EmailsTab: React.FC<EmailsTabProps> = ({ onTriggerEmailWorkflow }) => {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEmails = async (q: string = '') => {
    setLoading(true);
    try {
      const data = await api.fetchEmails(q);
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmails(searchQuery);
  };

  const handleProfessorExtensionShortcut = () => {
    onTriggerEmailWorkflow(
      "Jarvis, find my latest email from my professor and draft a polite reply asking for an extension"
    );
  };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jarvis-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Mail size={20} className="text-jarvis-cyan" />
            <h2 className="font-hud font-bold text-lg text-slate-100 tracking-wider">
              COMMUNICATIONS & INBOX
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Secure Gmail integration with mandatory pre-dispatch approval gates.
          </p>
        </div>

        <button
          onClick={handleProfessorExtensionShortcut}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-hud transition-colors"
          title="Find professor's latest email and draft an extension request"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>DRAFT PROFESSOR EXTENSION REPLY</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emails by sender, subject keywords, or deadline..."
            className="w-full bg-jarvis-card border border-jarvis-border rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white"
        >
          SEARCH
        </button>
      </form>

      {/* Main Mail View (Split Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[450px]">
        {/* Email List (5 Cols) */}
        <div className="lg:col-span-5 hud-panel rounded-2xl p-4 space-y-2 overflow-y-auto">
          {emails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedEmail(mail)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedEmail?.id === mail.id
                  ? 'bg-jarvis-cyan/15 border-jarvis-cyan/60'
                  : 'bg-jarvis-dark/50 border-jarvis-border hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="truncate max-w-[200px] text-jarvis-cyan font-semibold">
                  {mail.sender}
                </span>
                <span>{new Date(mail.date).toLocaleDateString()}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{mail.subject}</h4>
              <p className="text-[11px] font-sans text-slate-400 line-clamp-2 mt-1">{mail.snippet}</p>
            </div>
          ))}
        </div>

        {/* Selected Email Details (7 Cols) */}
        <div className="lg:col-span-7 hud-panel rounded-2xl p-6 flex flex-col justify-between">
          {selectedEmail ? (
            <div className="space-y-4">
              <div className="border-b border-jarvis-border pb-4">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-jarvis-cyan">
                  VERIFIED MESSAGE
                </span>
                <h3 className="font-hud font-bold text-base text-slate-100 mt-2">
                  {selectedEmail.subject}
                </h3>
                <div className="text-xs font-mono text-slate-400 mt-2 space-y-0.5">
                  <p>From: <span className="text-slate-200">{selectedEmail.sender}</span></p>
                  <p>To: <span className="text-slate-200">{selectedEmail.recipient}</span></p>
                  <p>Date: <span className="text-slate-300">{new Date(selectedEmail.date).toLocaleString()}</span></p>
                </div>
              </div>

              <div className="bg-jarvis-dark/60 rounded-xl p-4 border border-jarvis-border min-h-[180px] max-h-[300px] overflow-y-auto">
                <p className="text-sm font-sans text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedEmail.body}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                  <ShieldAlert size={14} />
                  <span>PRE-DISPATCH CONFIRMATION ENFORCED</span>
                </div>

                <button
                  onClick={() => onTriggerEmailWorkflow(`Jarvis, draft a reply to ${selectedEmail.sender}`)}
                  className="px-4 py-2 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs hover:bg-white transition-colors"
                >
                  DRAFT REPLY WITH JARVIS
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              Select an email to view contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
