/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002855',       // Azul Marino
        secondary: '#6AA9DB',     // Azul Claro
        accent: '#FEC45C',        // Amarillo Claro
        gold: '#D6A41D',          // Dorado
        danger: '#EE3E2E',        // Rojo
        light: '#ffffff',         // Blanco
      },
    },
  },

  plugins: [],
}

