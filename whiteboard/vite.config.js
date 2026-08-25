import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/draw/",
  plugins: [react()],
  build: {
    outDir: "../docs/draw",
    emptyOutDir: true,
  },
  test: {
    environment: "node",
  },
});
