/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand = lime / chartreuse ("Connectly"-style). Lime buttons use DARK text.
        brand: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
        // Near-black dark green used for the hero / dark surfaces.
        ink: '#14180f',
        night: {
          DEFAULT: '#14180f',
          700: '#1e2415',
          600: '#2a3320',
        },
        // Warm off-white used for light surfaces.
        cream: {
          DEFAULT: '#f6f6ee',
          100: '#fbfbf5',
          200: '#eeeee2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 24, 15, 0.04), 0 1px 3px rgba(20, 24, 15, 0.06)',
        'card-hover': '0 14px 36px -14px rgba(101, 163, 13, 0.30)',
        soft: '0 2px 8px rgba(20, 24, 15, 0.06)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(14px)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        float: 'float 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
