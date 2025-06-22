import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "./src/lib/index.ts",
      name: "RPlayer",
      fileName: (format) => `rplayer.${format}.min.js`,
      formats: ["umd"],
    },
    rollupOptions: {
      external: ["hls.js"],
      output: {
        globals: {
          "hls.js": "Hls",
        },
      },
    },
    outDir: "lib",
    sourcemap: true,
    minify: true,
    emptyOutDir: false, // Ne pas vider le répertoire de sortie pour préserver les fichiers ES
  },
});
