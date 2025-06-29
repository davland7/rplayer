import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

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
	env: {
		schema: {
			PUBLIC_RECAPTCHA_SITE_KEY: envField.string({ context: "client", access: "public" }),
			PUBLIC_FORMSPREE_FORM_ID: envField.string({ context: "client", access: "public" }),
			PUBLIC_GOOGLE_ANALYTICS_ID: envField.string({
				context: "client",
				access: "public",
				optional: true,
			}),
		},
	},
});
