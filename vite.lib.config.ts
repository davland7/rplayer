import { defineConfig } from "vite";
import type { UserConfigExport } from "vite";

const config: UserConfigExport = defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "./src/lib/index.ts",
      name: "RPlayer",
      formats: ["es"],
      fileName: () => "rplayer.es.js",
    },
    rollupOptions: {
      external: ["hls.js"],
      output: {
        globals: {
          "hls.js": "Hls",
        },
        manualChunks: undefined,
        inlineDynamicImports: true,
        preserveModules: false,
      },
    },
    outDir: "lib",
    sourcemap: true,
    minify: false, // Désactiver la minification pour débugger
    emptyOutDir: false, // Ne pas vider le répertoire de sortie pour préserver les fichiers UMD
  },
});

export default config;
