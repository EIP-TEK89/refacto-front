import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wasm()],
  resolve: {
    alias: {
      $constants: path.resolve(__dirname, "src/constants"),
      $services: path.resolve(__dirname, "src/services"),
      $components: path.resolve(__dirname, "src/components"),
      $hooks: path.resolve(__dirname, "src/hooks"),
      $assets: path.resolve(__dirname, "src/assets"),
      $styles: path.resolve(__dirname, "src/styles"),
      $utils: path.resolve(__dirname, "src/utils"),
      $context: path.resolve(__dirname, "src/context"),
      $types: path.resolve(__dirname, "src/types"),
      $store: path.resolve(__dirname, "src/store"),
      $pages: path.resolve(__dirname, "src/pages"),
      "triosigno-lib": path.resolve(__dirname, "triosignolib/core/src"),
      "triosigno-web": path.resolve(__dirname, "triosignolib/web/src"),
    },
  },
  optimizeDeps: {
    include: ["triosigno-lib", "triosigno-web"],
  },
});
