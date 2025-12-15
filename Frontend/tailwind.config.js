/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-mono': ['"DM Mono"', 'monospace'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        'kyiv-serif': ['"Kyiv Type Serif"', 'Georgia', 'serif'],
      },
      colors: {
        'border-gray': '#999090',
        'footer-dark': '#282C2D',
      },
    },
  },
  plugins: [],
}