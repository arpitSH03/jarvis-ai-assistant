import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { api } from '../services/api';
import { CalendarEvent } from '../types';

export const ScheduleTab: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('2026-10-29T19:00:00');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.fetchCalendarEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      await api.createCalendarEvent(newEventTitle, newEventTime);
      setNewEventTitle('');
      loadEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickDsaSchedule = async () => {
    setLoading(true);
    try {
      await api.sendChatMessage("Jarvis, schedule DSA practice every day from 7 PM to 8 PM for the next seven days", false);
      await loadEvents();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jarvis-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-jarvis-cyan" />
            <h2 className="font-hud font-bold text-lg text-slate-100 tracking-wider">
              CALENDAR & STUDY SCHEDULE
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Automated timetable management, recurring study routines, and conflict detection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickDsaSchedule}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-hud transition-colors"
            title="Schedule 7-day recurring DSA practice routine"
          >
            <Zap size={14} className="text-cyan-400" />
            <span>QUICK 7-DAY DSA ROUTINE</span>
          </button>

          <button
            onClick={loadEvents}
            className="p-2 rounded-xl bg-jarvis-card border border-jarvis-border text-slate-300 hover:text-white"
            title="Refresh Calendar"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Event List (8 Cols) */}
        <div className="lg:col-span-8 hud-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-hud text-xs text-jarvis-cyan font-bold tracking-wider uppercase">
              UPCOMING AGENDA & STUDY SESSIONS
            </h3>
            <span className="text-xs font-mono text-slate-400">{events.length} APPOINTMENT(S)</span>
          </div>

          <div className="space-y-2.5">
            {events.length > 0 ? (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-jarvis-dark/70 border border-jarvis-border hover:border-jarvis-cyan/40 p-4 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-100">{evt.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-jarvis-cyan uppercase">
                        {evt.category || 'general'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-jarvis-cyan" />
                        <span>{new Date(evt.start_time).toLocaleString()}</span>
                      </div>
                      {evt.location && <span>• {evt.location}</span>}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                    <CheckCircle size={14} />
                    <span>SCHEDULED</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No scheduled events found. Use voice or the form to create a session.
              </div>
            )}
          </div>
        </div>

        {/* Add Event Form (4 Cols) */}
        <div className="lg:col-span-4 hud-panel rounded-2xl p-5 space-y-4">
          <h3 className="font-hud text-xs text-slate-300 font-bold tracking-wider uppercase">
            SCHEDULE NEW EVENT
          </h3>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">SESSION TITLE</label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g. Operating Systems Review"
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">DATE & TIME</label>
              <input
                type="datetime-local"
                value={newEventTime.slice(0, 16)}
                onChange={(e) => setNewEventTime(e.target.value + ':00')}
                className="w-full bg-jarvis-dark border border-jarvis-border rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-jarvis-cyan"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-jarvis-cyan text-jarvis-dark font-hud font-bold text-xs tracking-wider flex items-center justify-center space-x-2 hover:bg-white transition-colors"
            >
              <Plus size={15} />
              <span>CONFIRM & ADD EVENT</span>
            </button>
          </form>

          <div className="p-3 bg-jarvis-dark/50 rounded-xl border border-jarvis-border/60 text-xs font-mono text-slate-400 space-y-1">
            <span className="text-jarvis-cyan font-bold block">CONFLICT DETECTION</span>
            <p className="text-[11px] leading-relaxed">
              JARVIS scans existing timetable blocks and alerts you before double-booking any time slot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
