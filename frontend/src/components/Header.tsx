import React from 'react';
import { 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  Mail, 
  Terminal, 
  Settings as SettingsIcon,
  LayoutDashboard,
  Minus,
  Square,
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: {
    online: boolean;
    provider: string;
    mockMode: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemStatus }) => {
  const tabs = [
    { id: 'dashboard', label: 'HUD DASHBOARD', icon: LayoutDashboard },
    { id: 'study', label: 'STUDY MODE', icon: BookOpen },
    { id: 'schedule', label: 'SCHEDULE', icon: Calendar },
    { id: 'emails', label: 'COMMS & MAIL', icon: Mail },
    { id: 'audit', label: 'AUDIT LOG', icon: Terminal },
    { id: 'settings', label: 'SYSTEM CONFIG', icon: SettingsIcon },
  ];

  const handleMinimize = () => {
    (window as any).electronAPI?.minimizeWindow?.();
  };
  const handleMaximize = () => {
    (window as any).electronAPI?.maximizeWindow?.();
  };
  const handleClose = () => {
    (window as any).electronAPI?.closeWindow?.();
  };

  return (
    <header className="border-b border-jarvis-border bg-jarvis-dark/90 backdrop-blur-md px-5 py-3 flex items-center justify-between select-none">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-jarvis-navy border border-jarvis-cyan/50 flex items-center justify-center shadow-lg shadow-jarvis-cyan/20">
            <span className="font-hud font-black text-jarvis-cyan text-base tracking-tighter">J</span>
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-jarvis-cyan animate-ping" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-hud font-bold text-lg tracking-widest text-slate-100 text-glow">JARVIS</h1>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-jarvis-cyan">
              v1.0 MARK-VII
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 tracking-wider">STARK INDUSTRIES DESKTOP INTELLIGENCE</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-jarvis-navy/80 p-1 rounded-lg border border-jarvis-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-hud tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-jarvis-cyan text-jarvis-dark font-bold shadow-md shadow-jarvis-cyan/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Telemetry Status & Window Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400" title="Core Status">
            <Wifi size={13} />
            <span className="text-[11px] font-semibold">{systemStatus.online ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-jarvis-cyan" title="Active AI Provider">
            <Cpu size={13} />
            <span className="text-[11px] uppercase">{systemStatus.provider}</span>
          </div>

          <div className="hidden md:flex items-center space-x-1 text-slate-400" title="Security & Safety Gates">
            <ShieldCheck size={13} className="text-amber-400" />
            <span className="text-[11px]">GUARD ON</span>
          </div>
        </div>

        {/* Electron Window Controls */}
        <div className="flex items-center space-x-1 border-l border-jarvis-border pl-3">
          <button 
            onClick={handleMinimize} 
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button 
            onClick={handleMaximize} 
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
            title="Maximize"
          >
            <Square size={11} />
          </button>
          <button 
            onClick={handleClose} 
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
