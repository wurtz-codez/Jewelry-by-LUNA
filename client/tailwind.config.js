/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['"Playfair Display"', 'serif'],
        'body': ['"Cormorant Garamond"', 'serif'],
        'cinzel': ['"Cinzel"', 'serif'],
        'cinzel-decorative': ['"Cinzel Decorative"', 'serif'],
      },
      colors: {
        'base': '#E8E5E0',
        'primary': {
          DEFAULT: '#A5616C',
          'washed': '#C8959A',
        },
        'secondary': {
          DEFAULT: '#9B7D7D',
          'washed': '#C8959A',
        },
        'accent': '#5B484A',
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: 'Playfair Display',
            },
            h2: {
              fontFamily: 'Playfair Display',
            },
            h3: {
              fontFamily: 'Playfair Display',
            },
            h4: {
              fontFamily: 'Playfair Display',
            },
            h5: {
              fontFamily: 'Playfair Display',
            },
            h6: {
              fontFamily: 'Playfair Display',
            },
            p: {
              fontFamily: 'Cormorant Garamond',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 