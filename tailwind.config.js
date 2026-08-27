/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        riverside: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ebdfca',
          300: '#dcc6a6',
          400: '#cba77d',
          500: '#b8895b',
          600: '#a3714c',
          700: '#84573e',
          800: '#6d4737',
          900: '#5a3b2f',
          950: '#321f18',
        },
        terracotta: {
          DEFAULT: '#c85a32',
          light: '#e0764e',
          dark: '#9e3f1c',
        },
        citrus: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
