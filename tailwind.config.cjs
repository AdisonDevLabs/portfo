/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-green': '#65a30d',
        'forest-green': '#1e3932',
        'dark-green': '#0a1d1d',
        'wp-cyan-bluish-gray': '#abb8c3',
        'wp-luminous-vivid-amber': '#fcb900',
        'wp-luminous-vivid-orange': '#ff6900',
        'wp-luminous-vivid-red': '#cd133c',
        'wp-vivid-red': '#cf2e2e',
        'wp-luminous-vivid-purple': '#9b1b9e',
        'wp-vivid-purple': '#9f46b4',
        'wp-pale-pink': '#f78da7',
        'wp-vivid-pink': '#ff0084',
        'wp-strong-magenta': '#a64d79',
        'wp-light-green-cyan': '#7bdcb5',
        'wp-cadet-blue': '#cad3dc',
        'wp-cool-blues': '#46505a',
        'wp-dark-grayscale': '#31373c',
        'wp-very-dark-gray': '#1e1e1e',
        'wp-vivid-green-cyan': '#00d084',
        'wp-pale-cyan-blue': '#8ed1fc',
        'wp-electric-grass': '#caf880',
        'wp-midnight': '#020381',
        'primary-blue': '#1C63ED',
        'secondary-blue': 'rgba(28, 99, 237, 0.32)',
        'light-gray-background': '#f0f0f0',
      },
      fontFamily: {
        sans: ['Inter', 'SourceSansPro-Regular', 'SourceSansPro-Semibold', 'SourceSansPro-Bold', 'sans-serif'],
        'source-sans-pro': ['SourceSansPro-Regular', 'sans-serif'],
        'source-sans-pro-semibold': ['SourceSansPro-Semibold', 'sans-serif'],
        'source-sans-pro-bold': ['SourceSansPro-Bold', 'sans-serif'],
        'inter-light': ['Inter-Light', 'sans-serif'],
        'inter-regular': ['Inter-Regular', 'sans-serif'],
        'inter-medium': ['Inter-Medium', 'sans-serif'],
      },
      fontSize: {
        'wp-small': '13px',
        'wp-medium': '20px',
        'wp-large': '36px',
        'wp-x-large': '42px',
      },
      spacing: {
        'wp-20': '0.44rem',
        'wp-30': '0.67rem',
        'wp-40': '1rem',
        'wp-50': '1.5rem',
        'wp-60': '2.25rem',
        'wp-70': '3.38rem',
        'wp-80': '5.06rem',
      },
      boxShadow: {
        'wp-natural': '6px 6px 9px rgba(0, 0, 0, .2)',
        'wp-deep': '12px 12px 50px rgba(0, 0, 0, .4)',
        'wp-sharp': '6px 6px 0px rgba(0, 0, 0, .2)',
        'wp-outlined': '6px 6px 0px -3px rgba(255, 255, 255, 1), 6px 6px rgba(0, 0, 0, 1)',
        'wp-crisp': '6px 6px 0px rgba(0, 0, 0, 1)',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        'spin-slow': 'spin-slow 3s infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}