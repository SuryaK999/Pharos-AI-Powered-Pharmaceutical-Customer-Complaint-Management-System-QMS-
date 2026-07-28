/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F2F5F0',
        ink: '#0F1F1B',
        pine: '#0C1B17',
        brand: { DEFAULT: '#0E5E52', dark: '#0A463E', soft: '#E3F1ED', glow: '#17A08C' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,27,.05), 0 4px 14px -6px rgba(15,31,27,.08)',
        lift: '0 2px 4px rgba(15,31,27,.06), 0 12px 28px -10px rgba(14,94,82,.22)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
