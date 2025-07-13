import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: "https://rplayer.js.org", // adapte si besoin
  devToolbar: {
	enabled: false,
  },
  integrations: [react(), sitemap()],
  markdown: {
	syntaxHighlight: "prism",
	remarkPlugins: [],
	rehypePlugins: [],
  },
  vite: {
    // biome-ignore lint/suspicious/noExplicitAny: false
	  plugins: [tailwindcss() as any],
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
