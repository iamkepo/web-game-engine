import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["three"]
  },
  server: {
    port: 5174,
    strictPort: true
  },
  build: {
    target: "es2022",
    sourcemap: true,
    outDir: "dist"
  }
});
