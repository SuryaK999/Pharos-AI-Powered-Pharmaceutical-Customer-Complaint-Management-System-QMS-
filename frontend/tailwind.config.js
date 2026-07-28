/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F4F8FC',
        ink: '#0C2135',
        pine: '#0A1526',
        brand: {
          DEFAULT: '#0A6ED1',
          dark: '#08549F',
          soft: '#E1EEFB',
          glow: '#4FB8FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,33,53,.05), 0 4px 16px -6px rgba(12,33,53,.08)',
        lift: '0 2px 4px rgba(12,33,53,.06), 0 14px 32px -10px rgba(10,110,209,.24)',
        glow: '0 0 0 1px rgba(79,184,255,.25), 0 8px 28px -6px rgba(79,184,255,.45)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
