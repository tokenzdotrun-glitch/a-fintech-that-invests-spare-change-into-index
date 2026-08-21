/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },
      colors: {
        sprout: {
          50: '#effdf4',
          100: '#d9f9e5',
          200: '#b5f1cd',
          300: '#7fe3aa',
          400: '#43cd7f',
          500: '#1eb464',
          600: '#12934f',
          700: '#127343',
          800: '#145b39',
          900: '#124b31',
          950: '#042a1b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        lift: '0 12px 32px -8px rgba(16, 24, 40, 0.14)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
