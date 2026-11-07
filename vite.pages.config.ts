import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));
const requestedBase = process.env.PAGES_BASE_PATH || "/NUCASA-REMODELACIONES/";
const base = "/" + requestedBase.replace(/^\/+|\/+$/g, "") + "/";

/** The GitHub Pages target has no server or hosting-service dependency. */
export default defineConfig({
  root,
  base: base.replace(/\/{2,}/g, "/"),
  plugins: [react()],
  resolve: { alias: { "@": root } },
  build: { outDir: "out", emptyOutDir: true },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
});
