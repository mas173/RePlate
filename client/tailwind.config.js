/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
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
        // Primary Emerald Green
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Main emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46', // Forest green (dark)
          900: '#064e3b',
          950: '#022c22',
        },
        // Teal Accent (AI/Tech feel)
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Main teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Slate (backgrounds, dark mode)
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Dark background
          950: '#020617',
        },
        // Semantic
        danger:   '#ef4444',
        warning:  '#f97316',
        success:  '#10b981',
        info:     '#14b8a6',
        // Background tokens
        bg: {
          DEFAULT: '#f9fafb',
          dark:    '#0f172a',
        },
        // Text tokens
        text: {
          primary:   '#111827',
          secondary: '#6b7280',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.25)',
        'glow-teal':  '0 0 24px rgba(20, 184, 166, 0.25)',
        'elevated':   '0 20px 60px -15px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':        'fadeIn 0.5s ease-out',
        'fade-in-up':     'fadeInUp 0.6s ease-out',
        'fade-in-down':   'fadeInDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in':       'scaleIn 0.3s ease-out',
        'float':          'float 4s ease-in-out infinite',
        'pulse-soft':     'pulseSoft 2.5s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'spin-slow':      'spin 8s linear infinite',
        'counter':        'counter 1s ease-out',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:     { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown:   { '0%': { opacity: '0', transform: 'translateY(-24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:      { '0%': { opacity: '0', transform: 'scale(0.94)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        float:        { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseSoft:    { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
        'hero-grid':        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(16 185 129 / 0.06)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
