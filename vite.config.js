import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDemo = mode === "demo";

  return {
    base: "./",
    root: isDemo ? "demo" : ".",
    publicDir: false,
    build: isDemo
      ? {
          outDir: "../docs",
          emptyOutDir: true,
          assetsDir: "assets",
          rollupOptions: {
            input: "index.html",
          },
        }
      : {
          lib: {
            entry: "src/index.js",
            name: "RPlayer",
            fileName: (format) => {
              if (format === "umd") return "rplayer.umd.js";
              if (format === "iife") return "rplayer.min.js";
              return "rplayer.js";
            },
            formats: ["es", "umd"],
          },
        },
  };
});
