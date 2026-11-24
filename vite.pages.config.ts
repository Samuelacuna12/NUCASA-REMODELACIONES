import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = fileURLToPath(new URL(".", import.meta.url));
const requestedBase = process.env.PAGES_BASE_PATH || "/";
const base = "/" + requestedBase.replace(/^\/+|\/+$/g, "") + "/";
const quoteEntries = Object.fromEntries(
  globSync("cotizaciones/*/index.html", { cwd: root }).map((path) => [
    `quote-${basename(dirname(path))}`,
    resolve(root, path),
  ]),
);

/** The GitHub Pages target has no server or hosting-service dependency. */
export default defineConfig({
  root,
  base: base.replace(/\/{2,}/g, "/"),
  plugins: [react()],
  resolve: { alias: { "@": root } },
  build: {
    outDir: "out",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: resolve(root, "index.html"),
        about: resolve(root, "quienes-somos/index.html"),
        services: resolve(root, "servicios/index.html"),
        ...quoteEntries,
      },
      output: {
        codeSplitting: {
          groups: [{
            name: "react-vendor",
            test: /node_modules[\\/](?:react|react-dom|scheduler)(?:[\\/]|$)/,
            priority: 20,
          }, {
            // These small modules are used by both the placeholder and the lazy viewer.
            // Keeping them outside the entry prevents CSS edits invalidating the 3D chunks.
            name: "viewer-shared",
            test: /(?:preload-helper|mobiliario-3d\.module\.css)/,
            priority: 10,
          }],
        },
      },
    },
  },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
});
