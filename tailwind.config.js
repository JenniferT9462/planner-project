/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🔑 CRITICAL FIX: Tell Tailwind to look inside the 'public' folder
  content: [
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}