import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      $constants: "/src/constants",
      $services: "/src/services",
      $components: "/src/components",
      $hooks: "/src/hooks",
      $assets: "/src/assets",
      $styles: "/src/styles",
      $utils: "/src/utils",
      $context: "/src/context",
      $types: "/src/types",
      $store: "/src/store",
      $pages: "/src/pages",
    },
  },
});
