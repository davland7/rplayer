import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'rPlayer',
      fileName: 'rplayer',
    },
    rollupOptions: {
      external: ['hls.js'],
      output: {
        globals: {
          'hls.js': 'Hls',
        },
      },
    },
  },
});
