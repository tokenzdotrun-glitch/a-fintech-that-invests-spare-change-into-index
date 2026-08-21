/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Dark-first neutral scale: ink-50 = deep background, ink-900 = near white.
        ink: {
          50: '#0a0d13',
          100: '#1b2230',
          200: '#28303f',
          300: '#3a4353',
          400: '#7e8698',
          500: '#98a1b2',
          600: '#b2bac7',
          700: '#cdd3dd',
          800: '#e4e8ee',
          900: '#f5f7fa',
          950: '#05070b',
        },
        // Elevated surfaces on top of the ink-50 background.
        surface: {
          DEFAULT: '#111722',
          raised: '#1c2431',
          sunken: '#0c1017',
        },
      },
      fontFamily: {
        sans: [
          'Geist Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.35), 0 12px 28px -14px rgba(0,0,0,0.6)',
        soft: '0 2px 8px rgba(0,0,0,0.35)',
        rail: '24px 0 48px -24px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
