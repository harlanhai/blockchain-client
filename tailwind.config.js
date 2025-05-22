module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#FF93B3",
          DEFAULT: "#FF007A",
          dark: "#B3005C"
        },
        secondary: {
          light: "#CBD5E0",
          DEFAULT: "#2D3748",
          dark: "#1A202C"
        }
      }
    }
  },
  plugins: [],
}