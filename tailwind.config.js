/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#121212",
        primary: "#6d28d9",
        secondary: "#06b6d4",
        accent: "#f472b6",
      },
    },
  },
  plugins: [],
}
