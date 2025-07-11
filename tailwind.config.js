/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,svelte}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        }
      },
      gridTemplateColumns: {
        '8': 'repeat(8, minmax(0, 1fr))',
        'planning': 'min-content repeat(7, 1fr)',
        'planning-mobile': '1fr',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}