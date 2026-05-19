/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'neon-purple': '#bc13fe',
        'neon-cyan': '#00ffff',
        'neon-red': '#ff003c',
        'dark-bg': '#050510',
        'glass-bg': 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.1)'
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
        'sans': ['Inter', 'sans-serif']
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.9' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.85' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      }
    },
  },
  plugins: [],
}
