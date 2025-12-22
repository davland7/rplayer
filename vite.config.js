import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    publicDir: false,
    build: {
      lib: {
        entry: 'src/index.js',
        name: 'RPlayer',
        fileName: (format) => {
          if (format === 'umd') return 'rplayer.umd.js';
          if (format === 'iife') return 'rplayer.min.js';
          return 'rplayer.js';
        },
        formats: ['es', 'umd']
      },
    }
  };
});
