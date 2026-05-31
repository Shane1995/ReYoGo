import preset from '@reyogo/config/tailwind.preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
    '../../lib/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'rg-fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'rg-glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.06)' },
        },
        'rg-step-in': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'rg-fade-up': 'rg-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        'rg-glow-pulse': 'rg-glow-pulse 5s ease-in-out infinite',
        'rg-step-in': 'rg-step-in 0.32s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
};
