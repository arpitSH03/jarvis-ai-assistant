import React from 'react';
import { motion } from 'framer-motion';
import { JarvisState } from '../types';

interface ArcReactorProps {
  state: JarvisState;
  frequencies: number[];
  onClick?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({ state, frequencies, onClick }) => {
  // Determine state-based colors and speeds
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isProcessing = state === 'processing';
  const isConfirming = state === 'awaiting_confirmation';

  let coreColor = '#00f0ff';
  let glowColor = 'rgba(0, 240, 255, 0.4)';
  if (isConfirming) {
    coreColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.5)';
  } else if (isProcessing) {
    coreColor = '#38bdf8';
    glowColor = 'rgba(56, 189, 248, 0.6)';
  }

  // Calculate average audio level for scaling the core
  const avgFreq = frequencies.reduce((a, b) => a + b, 0) / (frequencies.length || 1);
  const coreScale = isSpeaking ? 1 + avgFreq * 0.45 : isListening ? 1.15 : 1;

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none group"
      onClick={onClick}
      title={isListening ? "Listening... Click to stop" : "Click to activate voice input"}
    >
      {/* Outer ambient glow halo */}
      <motion.div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '260px',
          height: '260px',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(3,7,18,0) 70%)`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.25, 1.1] : isListening ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isSpeaking ? [0.6, 1, 0.8] : [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg width="240" height="240" viewBox="0 0 240 240" className="relative z-10">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={coreColor} />
            <stop offset="85%" stopColor="#070f1e" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>
        </defs>

        {/* Outer Ring with Ticks */}
        <motion.g
          animate={{ rotate: isProcessing ? 360 : 360 }}
          transition={{ duration: isProcessing ? 8 : 40, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <circle cx="120" cy="120" r="105" stroke="#152e4d" strokeWidth="2" fill="none" />
          {/* Tick marks around outer ring */}
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={i}
              x1="120"
              y1="12"
              x2="120"
              y2={i % 3 === 0 ? "20" : "16"}
              stroke={i % 3 === 0 ? coreColor : "#152e4d"}
              strokeWidth={i % 3 === 0 ? "2" : "1"}
              transform={`rotate(${i * 10} 120 120)`}
              opacity={i % 3 === 0 ? 0.9 : 0.4}
            />
          ))}
        </motion.g>

        {/* Counter-rotating Segmented Arc Ring */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: isListening ? 6 : 25, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <circle 
            cx="120" 
            cy="120" 
            r="88" 
            stroke={coreColor} 
            strokeWidth="3" 
            strokeDasharray="40 18 10 18" 
            fill="none" 
            opacity={0.85}
            filter="url(#glow)"
          />
        </motion.g>

        {/* High-frequency audio reactive spokes */}
        <g>
          {frequencies.slice(0, 12).map((freq, i) => {
            const angle = i * 30;
            const spokeLen = 65 + freq * 20;
            return (
              <line
                key={`spoke-${i}`}
                x1="120"
                y1="120"
                x2="120"
                y2={120 - spokeLen}
                stroke={coreColor}
                strokeWidth="2"
                strokeOpacity={0.3 + freq * 0.7}
                transform={`rotate(${angle} 120 120)`}
              />
            );
          })}
        </g>

        {/* Inner Reactor Triangle / Star Matrix */}
        <motion.g
          animate={{ scale: coreScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ originX: '120px', originY: '120px' }}
        >
          <polygon
            points="120,68 165,145 75,145"
            stroke={coreColor}
            strokeWidth="2"
            fill="none"
            opacity={0.7}
          />
          <polygon
            points="120,172 75,95 165,95"
            stroke={coreColor}
            strokeWidth="1.5"
            fill="none"
            opacity={0.5}
          />
        </motion.g>

        {/* Central Core Sphere */}
        <motion.circle
          cx="120"
          cy="120"
          r="38"
          fill="url(#coreGrad)"
          filter="url(#glow)"
          animate={{
            scale: coreScale,
            opacity: isListening ? [0.8, 1, 0.8] : 0.95,
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '120px', originY: '120px' }}
        />

        {/* Center Iris Light */}
        <circle cx="120" cy="120" r="14" fill="#ffffff" opacity={0.9} />
      </svg>

      {/* State Badge Overlay underneath */}
      <div className="absolute -bottom-6 px-3 py-1 rounded-full bg-jarvis-card border border-jarvis-border text-xs font-hud uppercase tracking-wider flex items-center space-x-2">
        <span 
          className="w-2 h-2 rounded-full animate-ping" 
          style={{ backgroundColor: coreColor }} 
        />
        <span style={{ color: coreColor }}>{state.replace('_', ' ')}</span>
      </div>
    </div>
  );
};
