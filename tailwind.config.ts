import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,astro,html}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffe70b',
        secondary: '#1f2937',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
