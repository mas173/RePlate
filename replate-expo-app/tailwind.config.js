/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#1F5A3A',
          green: '#2E7D32',
          sage: '#DDE8D9',
          mint: '#F3F7F1',
          bg: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        neutralText: {
          main: '#111827',
          sub: '#4B5563',
          muted: '#6B7280',
        },
        accent: {
          gold: '#D9A441',
          yellow: '#F6E8B1',
          cream: '#FFF8E8',
        },
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        display: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
