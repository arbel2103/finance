/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
      },
      colors: {
        // מינימליסטי, השראת Squarespace/Allbirds
        sand: {
          50: '#faf9f6',
          100: '#f4f2ec',
          200: '#e9e5db',
        },
        ink: {
          900: '#1c1b19',
          700: '#3d3b37',
          500: '#6b6862',
          400: '#8f8c85',
        },
        sage: {
          50: '#eef2ee',
          100: '#dce6dc',
          400: '#7d9b7d',
          500: '#5f7f5f',
          600: '#4c684c',
          700: '#3c523c',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.12)',
        soft: '0 1px 3px rgba(28,27,25,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
