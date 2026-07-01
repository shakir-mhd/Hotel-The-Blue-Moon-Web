/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resort: {
          blue: {
            50: '#f2f7fc',
            100: '#e1eef7',
            200: '#cbe2f2',
            300: '#a7ceeb',
            400: '#7bb2e0',
            500: '#5895d3',
            600: '#437ac4',
            700: '#3865b1',
            800: '#315491',
            900: '#1e3054',
            950: '#0c1a30', // Deep Navy (Primary brand color)
          },
          gold: {
            50: '#fbf9f4',
            100: '#f4ebd8',
            200: '#e6d3af',
            300: '#d5b780',
            400: '#c59a58',
            500: '#b8813d', // Warm Gold (Secondary accent brand color)
            600: '#9d6730',
            700: '#7d4d27',
            800: '#663f23',
            900: '#55341f',
            950: '#2f1a0e',
          },
          accent: {
            gold: '#c5a880', // Elegant Gold
            blue: '#0077b6',   // Bright Sea Blue
          },
          dark: '#111827',
          light: '#f9fafb',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(12, 26, 48, 0.4), rgba(12, 26, 48, 0.75))',
      }
    },
  },
  plugins: [],
}
