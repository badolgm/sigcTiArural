/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        text: '#e6edf3',
        muted: '#a0b4c0',
        neon: {
          cyan: '#00e5ff',
          magenta: '#ff3cc7',
          lime: '#a3ff12',
        },
      },
      boxShadow: {
        neon: '0 0 8px rgba(0,229,255,0.35), 0 0 16px rgba(0,229,255,0.18)',
        magenta: '0 0 8px rgba(255,60,199,0.35), 0 0 16px rgba(255,60,199,0.18)',
        lime: '0 0 8px rgba(163,255,18,0.35), 0 0 16px rgba(163,255,18,0.18)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'grid-dark':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};