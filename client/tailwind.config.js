/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['"Playfair Display"', 'serif'],
        'body': ['"Cormorant Garamond"', 'serif'],
        'cinzel': ['"Cinzel"', 'serif'],
        'cinzel-decorative': ['"Cinzel Decorative"', 'serif'],
        'montserrat-alt': ['"Montserrat Alternates"', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      colors: {
        'neutral': '#E8E5E0',
        'primary': {
          DEFAULT: '#A5616C',
          'washed': '#C8959A',
        },
        'secondary': {
          DEFAULT: '#9B7D7D',
          'washed': '#E5CEC0',
        },
        'accent': '#5B484A',
        'base-100': '#FFFFFF',
        'info': '#3ABFF8',
        'success': '#36D399',
        'warning': '#FBBD23',
        'error': '#F87272',
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
  // Purge unused CSS in production
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    options: {
      safelist: [
        // Add any classes that might be dynamically created and should not be purged
        /^bg-/,
        /^text-/,
        /^border-/,
        /^hover:/,
        /^focus:/,
        'active',
        'disabled',
      ],
    },
  },
}