/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-sea': {
          950: '#050D18',
          900: '#0B1929',
          800: '#0F2338',
          700: '#16324F',
          600: '#1E446B',
        },
        'cyber': {
          cyan: '#00D4FF',
          'cyan-dim': '#0099B8',
          blue: '#64D2FF',
          green: '#30D158',
          orange: '#FF9F0A',
          red: '#FF2D55',
          'red-dim': '#B8203D',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        'sans': ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-border': 'pulse-border 1.5s ease-in-out infinite',
        'blink': 'blink 1s steps(2) infinite',
        'scanline': 'scanline 6s linear infinite',
        'glow-red': 'glow-red 2s ease-in-out infinite',
        'float-up': 'float-up 0.3s ease-out',
        'digit-roll': 'digit-roll 0.6s ease-out',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 45, 85, 0.7), inset 0 0 20px rgba(255, 45, 85, 0.1)' },
          '50%': { boxShadow: '0 0 0 4px rgba(255, 45, 85, 0), inset 0 0 30px rgba(255, 45, 85, 0.25)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glow-red': {
          '0%, 100%': { textShadow: '0 0 10px rgba(255, 45, 85, 0.8), 0 0 20px rgba(255, 45, 85, 0.4)' },
          '50%': { textShadow: '0 0 20px rgba(255, 45, 85, 1), 0 0 40px rgba(255, 45, 85, 0.6)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'digit-roll': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
