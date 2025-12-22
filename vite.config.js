import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    publicDir: false,
    build: {
      lib: {
        entry: 'src/index.js',
        name: 'RPlayer',
        fileName: 'rplayer'
      },
    }
  };
});
