import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sow: {
          black: '#000000',
          dark: '#545454',
          light: '#FFFFFF',
          green: '#72BF03',       // Cor da marca
          'green-hover': '#5da102', // Um pouco mais escuro para o hover
          'gray-light': '#F5F5F5', // Fundo sutil
        }
      },
      fontFamily: {
        // Montserrat para o corpo, Helvetica para títulos (conforme manual)
        sans: ['var(--font-montserrat)', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;