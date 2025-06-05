/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: { // Example: extending or customizing colors
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        teal: {
          // ... you can add teal shades if needed
        }
      },
      // For the glass-morphism effect if you want to refine it globally
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'glass': 'rgba(255, 255, 255, 0.15)', // Example glass background
      }),
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}