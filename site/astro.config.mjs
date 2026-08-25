import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://imarchuang.github.io",
  trailingSlash: "always",
  markdown: {
    shikiConfig: { theme: "github-dark-default", wrap: true },
  },
});
