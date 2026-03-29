module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode Theme
        'cyber': {
          'dark': '#0f172a',
          'darker': '#1e293b',
          'card': '#1e293b',
          'border': '#334155',
        },
        // Dark mode accents
        'neon': {
          'cyan': '#06b6d4',
          'pink': '#ec4899',
          'yellow': '#f59e0b',
          'green': '#10b981',
          'purple': '#a855f7',
          'orange': '#f97316',
        },
        // Glass effect support
        'glass': 'rgba(30, 41, 59, 0.7)',
      },
      backgroundColor: {
        'glass-light': 'rgba(30, 41, 59, 0.7)',
        'glass-dark': 'rgba(30, 41, 59, 0.8)',
        'glass-hover': 'rgba(51, 65, 85, 1)',
      },
      backdropBlur: {
        'glass': '8px',
        'glass-heavy': '12px',
      },
      boxShadow: {
        'neon-cyan': '0 2px 8px rgba(6, 182, 212, 0.16)',
        'neon-pink': '0 2px 8px rgba(236, 72, 153, 0.16)',
        'neon-green': '0 2px 8px rgba(16, 185, 129, 0.16)',
        'glass': '0 2px 8px rgba(0, 0, 0, 0.24), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        'glass-lg': '0 4px 16px rgba(6, 182, 212, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1', boxShadow: '0 2px 8px rgba(6, 182, 212, 0.16)' },
          '50%': { opacity: '0.8', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.20)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 8px rgba(6, 182, 212, 0.3)' },
          '50%': { textShadow: '0 0 12px rgba(6, 182, 212, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        scan: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 0%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
      },
      borderRadius: {
        'glass': '12px',
        'md-glass': '8px',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #06b6d4 0%, #ec4899 50%, #a855f7 100%)',
        'gradient-cyber': 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
      },
    },
  },
  plugins: [],
}
