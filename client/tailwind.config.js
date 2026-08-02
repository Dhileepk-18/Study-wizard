/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#6366F1',
          violet: '#8B5CF6',
          pink: '#EC4899',
          obsidian: '#0B0F19',
          slateDark: '#0F172A',
          cardDark: '#1E293B',
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(99, 102, 241, 0.15)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
        'glass-dark': '0 16px 40px 0 rgba(0, 0, 0, 0.45)',
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-pink': '0 0 25px -5px rgba(236, 72, 153, 0.4)'
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' }
        }
      }
    },
  },
  plugins: [],
}

