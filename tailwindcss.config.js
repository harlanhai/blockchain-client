/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 配置Tailwind与MUI协同工作
  important: true,
  // 支持暗色模式
  darkMode: 'class',
}