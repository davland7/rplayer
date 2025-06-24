import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://rplayer.js.org',
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    tailwind()
  ],
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [],
    rehypePlugins: []
  }
});
