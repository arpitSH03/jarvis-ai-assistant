/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          dark: '#030712',
          navy: '#070f1e',
          card: '#0a1628',
          border: '#152e4d',
          cyan: '#00f0ff',
          blue: '#0284c7',
          glow: '#38bdf8',
          accent: '#06b6d4',
          alert: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 15s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.2))' },
        }
      }
    },
  },
  plugins: [],
}
