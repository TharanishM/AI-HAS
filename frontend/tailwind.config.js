
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#badefe',
          300: '#7cc0fd',
          400: '#389dfa',
          500: '#0e7ff0',
          600: '#025ec7',
          700: '#034ba1',
          800: '#073f85',
          900: '#0c356e',
          950: '#082149',
        },
      },
    },
  },
  plugins: [],
}
