import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const outDir = process.env.WHITEBOARD_OUT_DIR || "../docs/draw";

export default defineConfig({
  base: "/draw/",
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: true,
  },
  test: {
    environment: "node",
  },
});
