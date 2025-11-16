/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mewa-green': {
          50: '#e6f4f1',
          100: '#cfe7e1',
          200: '#a0cfc4',
          300: '#72b7a7',
          400: '#439f89',
          500: '#005D45', // Brand Dark Green (PANTONE 336-C)
          600: '#004e3a',
          700: '#003f2f',
          800: '#003024',
          900: '#002219',
        },
        'mewa-accent': {
          DEFAULT: '#46C752', // Brand Green (PANTONE 2270-C)
          50: '#ecfbef',
          100: '#d4f6db',
          200: '#a9ecb7',
          300: '#7fe293',
          400: '#54d86f',
          500: '#46C752',
          600: '#37a341',
          700: '#297f30',
          800: '#1b5b20',
          900: '#0d3710',
        },
        'mewa-yellow': {
          DEFAULT: '#FFC629', // PANTONE 116-C
          50: '#fff9e8',
          100: '#ffefc2',
          200: '#ffe49b',
          300: '#ffd974',
          400: '#ffcf4d',
          500: '#FFC629',
          600: '#cc9e21',
          700: '#997719',
          800: '#664f10',
          900: '#332808',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      },
      animation: {
        'pop-in': 'popIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}

