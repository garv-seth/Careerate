import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  return {
    plugins: [
      react(),
    ],
    optimizeDeps: {
      exclude: ["@replit/vite-plugin-runtime-error-modal"],
    },
    build: {
      outDir: "dist/public",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Additional output options if needed
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
  };
});
