/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 1. Registering our custom CSS variable colors
      colors: {
        'bg-dark-purple': 'var(--bg-dark-purple)',
        'primary-cyan': 'var(--primary-cyan)',
        'accent-magenta': 'var(--accent-magenta)',
        'accent-purple': 'var(--accent-purple)',
        'semantic-green': 'var(--semantic-green)',
        'semantic-red': 'var(--semantic-red)',
        'text-primary': 'var(--text-primary)',
        'border-color': 'var(--border-color)',
      },
      // 2. Registering the new font family
      fontFamily: {
        display: ['Oxanium', 'sans-serif'],
      },
      // 3. Adding custom animations and keyframes
      animation: {
        'fade-in-up': 'fade-in-up 0.9s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.25' },
        },
      },
      // 4. Adding custom letter spacing for the title
      letterSpacing: {
        tightest: '-0.075em',
      },
      // 5. Adding custom background image for the radial gradients (optional but clean)
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};