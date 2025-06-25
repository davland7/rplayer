import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://rplayer.js.org",
	devToolbar: {
		enabled: false,
	},
	integrations: [react()],
	markdown: {
		syntaxHighlight: "prism",
		remarkPlugins: [],
		rehypePlugins: [],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
