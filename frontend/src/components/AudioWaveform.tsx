import React from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  frequencies: number[];
  active: boolean;
  color?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  frequencies, 
  active, 
  color = '#00f0ff' 
}) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-10 px-4">
      {frequencies.map((val, idx) => {
        const height = active ? Math.max(4, val * 36) : 4;
        return (
          <motion.div
            key={idx}
            className="w-1 rounded-full transition-all duration-75"
            style={{
              height: `${height}px`,
              backgroundColor: color,
              opacity: active ? 0.3 + val * 0.7 : 0.2,
              boxShadow: active && val > 0.3 ? `0 0 8px ${color}` : 'none'
            }}
          />
        );
      })}
    </div>
  );
};
