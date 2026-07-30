export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
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
          650: '#0758b7',
          700: '#034ba1',
          800: '#073f85',
          900: '#0c356e',
          950: '#082149',
        },
        slate: {
          350: '#cbd5e1',
          450: '#94a3b8',
          455: '#94a3b8',
          550: '#64748b',
          650: '#475569',
          655: '#475569',
          750: '#334155',
          805: '#1e293b',
          850: '#1e293b',
        },
      },
    },
  },
  plugins: [],
};
