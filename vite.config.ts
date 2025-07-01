import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    {
      name: "handle-react-native-imports",
      resolveId(id) {
        // Redirect react-native-fs imports to our polyfill
        if (id === "react-native-fs") {
          return path.resolve(
            __dirname,
            "src/lib/sign_recognizer/react-native-fs-polyfill.ts"
          );
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    exclude: ["@mediapipe/tasks-vision", "onnxruntime-web"],
  },
  build: {
    target: "esnext",
    sourcemap: true,
  },
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
      "react-native-fs": "/src/lib/sign_recognizer/react-native-fs-polyfill.ts",
    },
  },
});
