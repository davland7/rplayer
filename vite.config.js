import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "RPlayer",
      fileName: (format) =>
        format === "umd" ? "rplayer.umd.js" : "rplayer.js",
      formats: ["es", "umd"],
    },
  },
});
