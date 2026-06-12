/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: '#1F5A3A',
          green: '#2E7D32',
          sage: '#DDE8D9',
          mint: '#F3F7F1',
          gold: '#D9A441',
          yellow: '#F6E8B1',
          cream: '#FFF8E8',
          bg: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        neutral: {
          main: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
        },
        feedback: {
          error: '#DC2626',
          success: '#16A34A',
          warning: '#D97706',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
