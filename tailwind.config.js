/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F0E',
        surface: '#1A2220',
        surface2: '#212B28',
        paper: '#F4EFE6',
        paperdim: '#A9A296',
        ember: '#FF6B35',
        emberdim: '#7A3A21',
        teal: '#3FA796',
        rust: '#C9402A',
        line: '#2B3633',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.01em',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(255,107,53,0.35)',
      },
    },
  },
  plugins: [],
}
