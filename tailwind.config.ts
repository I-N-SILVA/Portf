import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      width: {
        '3/10': '30%',
        '7/10': '70%',
      },
      margin: {
        '30%': '30%',
      },
      colors: {
        // Backgrounds
        deepBlack: '#0a0a0a',
        charcoalGray: '#1a1a1a',
        softGray: '#e5e5e5',

        // Considered neon accents
        neonPink: '#ff006e',
        electricPurple: '#8338ec',
        brightYellow: '#ffbe0b',
        skyBlue: '#3a86ff',
        limeGreen: '#06ffa5',

        // Text
        lightGray: '#a0a0a0',
        darkGray: '#2a2a2a',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'blob': 'blob 10s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.3), 0 0 40px rgba(255, 0, 110, 0.1)',
        'glow-purple': '0 0 20px rgba(131, 56, 236, 0.3), 0 0 40px rgba(131, 56, 236, 0.1)',
        'glow-blue': '0 0 20px rgba(58, 134, 255, 0.3), 0 0 40px rgba(58, 134, 255, 0.1)',
        'glow-yellow': '0 0 20px rgba(255, 190, 11, 0.3), 0 0 40px rgba(255, 190, 11, 0.1)',
        'dramatic': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 0, 110, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
