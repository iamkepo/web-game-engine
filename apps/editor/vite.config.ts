import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["three"]
  },
  build: {
    target: "es2022",
    sourcemap: true,
    outDir: "dist"
  }
});
