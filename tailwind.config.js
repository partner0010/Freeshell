/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        pastel: {
          lavender: '#E8E0F0',
          sky: '#D6EAF8',
          mint: '#D4EDE1',
          rose: '#FCDEDE',
          peach: '#F5D7E3',
          cream: '#FDF6E3',
          sage: '#C4E4D4',
          lilac: '#E1D5F0',
        },
        accent: {
          teal: '#14B8A6',
          purple: '#8B5CF6',
        },
        surface: {
          light: '#FAFAFA',
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        display: ['Outfit', 'Pretendard', 'sans-serif'],
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

