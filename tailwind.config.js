/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-blue': '#aee0ff',
        'pastel-yellow': '#fff3a3',
        'pastel-green': '#b7f5c4',
      },
      fontFamily: {
        'comic': ['Comic Neue', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

