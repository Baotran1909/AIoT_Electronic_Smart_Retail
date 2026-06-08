/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#06b6d4',
        'brand-dark': '#0f172a',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}