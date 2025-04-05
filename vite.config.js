import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "./src/lib/index.ts",
      name: "rPlayer",
      fileName: (format) => `rplayer.${format}.js`,
    },
    rollupOptions: {
      external: ["hls.js"],
      output: { globals: { "hls.js": "Hls",} },
    },
    outDir: "lib",
  },
});
