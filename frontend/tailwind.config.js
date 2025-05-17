/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#81C784',
          900: '#1B5E20',
          800: '#2E7D32',
          700: '#388E3C',
          600: '#43A047',
          500: '#4CAF50',
          400: '#66BB6A',
          300: '#81C784',
          200: '#A5D6A7',
          100: '#C8E6C9',
          50: '#E8F5E9',
        },
        secondary: {
          DEFAULT: '#673AB7',
          dark: '#512DA8',
          light: '#9575CD',
        },
        forest: {
          dark: '#1A2E12',
          DEFAULT: '#2E4425',
          light: '#4A6B41',
        },
        night: {
          DEFAULT: '#121212',
          900: '#0D0D0D',
          800: '#121212',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2A2A2A',
          400: '#333333',
          300: '#444444',
          200: '#555555',
          100: '#777777',
          50: '#999999',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'forest-dark': "url('https://images.unsplash.com/photo-1483982258113-b72862e6cff6')",
        'forest-magic': "url('https://images.unsplash.com/photo-1573689705959-7786e029b31e')",
        'forest-mist': "url('https://images.unsplash.com/photo-1496526311033-8a80ae14a1f9')",
      },
    },
  },
  plugins: [],
}
