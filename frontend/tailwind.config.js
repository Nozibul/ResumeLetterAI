/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        heading: 'var(--color-heading)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        destructive: 'var(--color-destructive)',
        card: 'var(--color-card)',
        popover: 'var(--color-popover)',
        sidebar: 'var(--color-sidebar)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        heading: ['var(--font-heading)', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        h3: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        h4: ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      maxWidth: {
        container: 'var(--container-max-width)',
      },
      animation: {
        fade: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
