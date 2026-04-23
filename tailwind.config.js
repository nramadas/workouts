/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#171717',
          700: '#1f1f1f',
          600: '#2a2a2a',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          50: '#fff1f1',
          100: '#ffdede',
          400: '#ff8a8a',
          500: '#ff6b6b',
          600: '#ef4f4f',
          700: '#cc3a3a',
        },
        muted: {
          DEFAULT: '#8a8a8a',
          light: '#a0a0a0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
