/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf8f0',
          100: '#f9eedc',
          200: '#f0d8b0',
          300: '#e4be84',
          400: '#d4a05a',
          500: '#c8956c',
          600: '#b07840',
          700: '#8b5e3c',
          800: '#6b4530',
          900: '#3d2314',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
