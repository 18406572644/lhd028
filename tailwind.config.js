/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        retro: {
          brown: '#2C1810',
          'brown-light': '#3D2517',
          'brown-dark': '#1A0E08',
          gold: '#D4A574',
          'gold-light': '#E8C9A0',
          'gold-dark': '#B8864A',
          crimson: '#C41E3A',
          'crimson-light': '#E03050',
          cream: '#FFF8F0',
          'cream-dark': '#F0E6D8',
          orange: '#B8602A',
          'orange-light': '#D4783A',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Noto Serif SC', 'serif'],
        serif: ['Noto Serif SC', 'Playfair Display', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        filmGrain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1px, -1px)' },
          '30%': { transform: 'translate(-1px, 1px)' },
          '50%': { transform: 'translate(-1px, 0)' },
          '70%': { transform: 'translate(0, -1px)' },
          '90%': { transform: 'translate(1px, 0)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        boxFlip: {
          '0%': { transform: 'perspective(800px) rotateY(0deg)' },
          '50%': { transform: 'perspective(800px) rotateY(90deg) scale(1.1)' },
          '100%': { transform: 'perspective(800px) rotateY(0deg)' },
        },
        spotlight: {
          '0%': { transform: 'rotate(-15deg)', opacity: '0.3' },
          '50%': { transform: 'rotate(15deg)', opacity: '0.6' },
          '100%': { transform: 'rotate(-15deg)', opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        filmGrain: 'filmGrain 0.5s steps(4) infinite',
        glow: 'glow 2s ease-in-out infinite',
        boxFlip: 'boxFlip 1s ease-in-out',
        spotlight: 'spotlight 8s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
