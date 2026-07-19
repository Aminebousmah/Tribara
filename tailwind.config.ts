/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        text: '#000000',
        primary: {
          DEFAULT: '#23606E',
          light: '#2A7587',
          dark: '#1C4856'
        },
        secondary: {
          DEFAULT: '#FACFCE',
          light: '#FDDDDD',
          dark: '#F5B6B5'
        },
        accent: {
          DEFAULT: '#008F8C',
          light: '#00A6A4',
          dark: '#007675'
        },
        success: {
          DEFAULT: '#015958',
          light: '#027271',
          dark: '#004140'
        },
        background: {
          DEFAULT: '#023535',
          light: '#034848',
          dark: '#012424'
        },
        muted: {
          DEFAULT: '#E0E0E0',
          light: '#F5F5F5',
          dark: '#C0C0C0'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        slideDown: {
          '0%': { maxHeight: '0px', opacity: '0' },
          '100%': { maxHeight: '1000px', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        slideDown: 'slideDown 0.5s ease-in-out',
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
