/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Clases para badges de estado (desde la base de datos)
    'bg-green-100', 'text-green-800', 'dark:bg-green-900/30', 'dark:text-green-400',
    'bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/30', 'dark:text-blue-400',
    'bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900/30', 'dark:text-yellow-400',
    'bg-red-100', 'text-red-800', 'dark:bg-red-900/30', 'dark:text-red-400',
    'bg-gray-100', 'text-gray-800', 'dark:bg-gray-900/30', 'dark:text-gray-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
