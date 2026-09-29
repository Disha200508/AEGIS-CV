/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          900: '#070b12',
          800: '#0e1626',
          700: '#152238',
          600: '#1e3250',
          500: '#2d4b75',
          cyan: '#00f0ff',
          green: '#00ff88',
          red: '#ff3366',
          amber: '#ffaa00',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
