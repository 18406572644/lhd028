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
        cubeShake: {
          '0%, 100%': { transform: 'perspective(800px) rotateY(0deg) rotateX(0deg)' },
          '10%': { transform: 'perspective(800px) rotateY(-5deg) rotateX(3deg)' },
          '20%': { transform: 'perspective(800px) rotateY(5deg) rotateX(-3deg)' },
          '30%': { transform: 'perspective(800px) rotateY(-5deg) rotateX(3deg)' },
          '40%': { transform: 'perspective(800px) rotateY(5deg) rotateX(-2deg)' },
          '50%': { transform: 'perspective(800px) rotateY(-3deg) rotateX(2deg)' },
          '60%': { transform: 'perspective(800px) rotateY(3deg) rotateX(-1deg)' },
          '70%': { transform: 'perspective(800px) rotateY(-2deg) rotateX(1deg)' },
          '80%': { transform: 'perspective(800px) rotateY(2deg) rotateX(-1deg)' },
          '90%': { transform: 'perspective(800px) rotateY(-1deg) rotateX(0deg)' },
        },
        lidOpen: {
          '0%': { transform: 'rotateX(0deg)' },
          '60%': { transform: 'rotateX(-120deg)' },
          '80%': { transform: 'rotateX(-100deg)' },
          '100%': { transform: 'rotateX(-110deg)' },
        },
        goldenGlow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 165, 116, 0.8), 0 0 50px rgba(212, 165, 116, 0.4), 0 0 80px rgba(212, 165, 116, 0.2)' },
          '100%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.3)' },
        },
        legendaryGlow: {
          '0%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5), 0 0 100px rgba(255, 215, 0, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)' },
        },
        revealBlur: {
          '0%': { filter: 'blur(30px) brightness(0.3)', transform: 'scale(1.1)' },
          '60%': { filter: 'blur(10px) brightness(0.6)', transform: 'scale(1.05)' },
          '100%': { filter: 'blur(0px) brightness(1)', transform: 'scale(1)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scale(0.5)' },
        },
        rareGlow: {
          '0%': { boxShadow: '0 0 8px rgba(100, 149, 237, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(100, 149, 237, 0.7), 0 0 40px rgba(100, 149, 237, 0.3)' },
          '100%': { boxShadow: '0 0 8px rgba(100, 149, 237, 0.3)' },
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
        cubeShake: 'cubeShake 0.8s ease-in-out',
        lidOpen: 'lidOpen 0.6s ease-out forwards',
        goldenGlow: 'goldenGlow 2s ease-in-out infinite',
        legendaryGlow: 'legendaryGlow 2s ease-in-out infinite',
        revealBlur: 'revealBlur 2s ease-out forwards',
        sparkle: 'sparkle 0.6s ease-in-out',
        floatUp: 'floatUp 1s ease-out forwards',
        rareGlow: 'rareGlow 2s ease-in-out infinite',
        spotlight: 'spotlight 8s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
