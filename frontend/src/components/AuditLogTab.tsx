import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jarvis-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal size={20} className="text-jarvis-cyan" />
            <h2 className="font-hud font-bold text-lg text-slate-100 tracking-wider">
              SYSTEM AUDIT & SAFETY LOG
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Immutable log of all tools executed, permission checks, parameters, and verification records.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-jarvis-card border border-jarvis-border text-slate-300 hover:text-white text-xs font-mono"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      <div className="hud-panel rounded-2xl overflow-hidden border border-jarvis-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-jarvis-dark/80 text-[11px] font-mono text-slate-400 border-b border-jarvis-border uppercase tracking-wider">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">TOOL INVOKED</th>
                <th className="py-3 px-4">SAFETY LEVEL</th>
                <th className="py-3 px-4">PARAMETERS</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jarvis-border/40 text-xs font-mono">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const isSafe = log.safety_level === 'SAFE';
                  const isSuccess = log.status === 'EXECUTED' || log.status === 'CONFIRMED';

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-jarvis-cyan whitespace-nowrap">
                        {log.tool_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSafe
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {log.safety_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.parameters}>
                        {log.parameters}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          {isSuccess ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-400" />
                              <span className="text-emerald-400 font-bold">{log.status}</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-red-400" />
                              <span className="text-red-400 font-bold">{log.status}</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No audit records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
