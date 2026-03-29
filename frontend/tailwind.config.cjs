module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claude Light Theme
        'cyber': {
          'dark': '#FAFAF8',
          'darker': '#f5f3f0',
          'card': '#ebe8e3',
          'border': '#e5e3e0',
        },
        // Light theme accents
        'neon': {
          'cyan': '#0066cc',
          'pink': '#cc0066',
          'yellow': '#cc8800',
          'green': '#006633',
          'purple': '#6600cc',
          'orange': '#cc5500',
        },
        // Glass effect support
        'glass': 'rgba(245, 243, 240, 0.7)',
      },
      backgroundColor: {
        'glass-light': 'rgba(245, 243, 240, 0.7)',
        'glass-dark': 'rgba(235, 232, 227, 0.8)',
        'glass-hover': 'rgba(235, 232, 227, 1)',
      },
      backdropBlur: {
        'glass': '8px',
        'glass-heavy': '12px',
      },
      boxShadow: {
        'neon-cyan': '0 2px 8px rgba(0, 102, 204, 0.12)',
        'neon-pink': '0 2px 8px rgba(204, 0, 102, 0.12)',
        'neon-green': '0 2px 8px rgba(0, 102, 51, 0.12)',
        'glass': '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
        'glass-lg': '0 4px 16px rgba(0, 102, 204, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
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
          '0%, 100%': { opacity: '1', boxShadow: '0 2px 8px rgba(0, 102, 204, 0.12)' },
          '50%': { opacity: '0.8', boxShadow: '0 4px 16px rgba(0, 102, 204, 0.16)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 8px rgba(0, 102, 204, 0.2)' },
          '50%': { textShadow: '0 0 12px rgba(0, 102, 204, 0.3)' },
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
        'gradient-neon': 'linear-gradient(135deg, #0066cc 0%, #cc0066 50%, #6600cc 100%)',
        'gradient-cyber': 'linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(204, 0, 102, 0.08) 100%)',
      },
    },
  },
  plugins: [],
}
