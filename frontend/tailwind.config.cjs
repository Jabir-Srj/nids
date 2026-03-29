module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cybersecurity dark theme
        'cyber': {
          'dark': '#0a0e27',
          'darker': '#050810',
          'card': '#0f192e',
          'border': '#1a2b4d',
        },
        // Neon accents
        'neon': {
          'cyan': '#00D9FF',
          'pink': '#FF006E',
          'yellow': '#FFBE0B',
          'green': '#00F5A0',
          'purple': '#9D4EDD',
          'orange': '#FF6B35',
        },
        // Glass effect support
        'glass': 'rgba(15, 25, 50, 0.4)',
      },
      backgroundColor: {
        'glass-light': 'rgba(15, 25, 50, 0.4)',
        'glass-dark': 'rgba(5, 8, 16, 0.6)',
        'glass-hover': 'rgba(15, 25, 50, 0.6)',
      },
      backdropBlur: {
        'glass': '10px',
        'glass-heavy': '16px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.3), 0 0 40px rgba(0, 217, 255, 0.1)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.3), 0 0 40px rgba(255, 0, 110, 0.1)',
        'neon-green': '0 0 20px rgba(0, 245, 160, 0.3), 0 0 40px rgba(0, 245, 160, 0.1)',
        'glass': '0 8px 32px rgba(0, 217, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 48px rgba(0, 217, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
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
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px rgba(0, 217, 255, 0.5)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 217, 255, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(0, 217, 255, 0.8)' },
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
        'gradient-neon': 'linear-gradient(135deg, #00D9FF 0%, #FF006E 50%, #9D4EDD 100%)',
        'gradient-cyber': 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 110, 0.1) 100%)',
      },
    },
  },
  plugins: [],
}
