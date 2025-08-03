import { defineConfig } from "vite";
import type { UserConfigExport } from "vite";

const config: UserConfigExport = defineConfig({
	publicDir: false,
	build: {
		lib: {
			entry: "./src/lib/index.ts",
			name: "RPlayer",
			fileName: (format: string) => `rplayer.${format}.min.js`,
			formats: ["umd"],
		},
		rollupOptions: {
			external: ["hls.js"],
			output: {
				globals: {
					"hls.js": "Hls",
				},
				// Make sure the UMD build sets the correct global variable
				name: "RPlayer",
			},
		},
		outDir: "lib",
		sourcemap: true,
		minify: true,
	},
});

export default config;
