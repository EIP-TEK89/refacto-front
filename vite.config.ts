import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wasm()],
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
