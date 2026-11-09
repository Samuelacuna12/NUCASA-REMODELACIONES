import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const configFile = resolve(root, "vite.pages.config.ts");
const temporary = resolve(root, ".pages-ssr");
const output = resolve(root, "out");
const base = ("/" + (process.env.PAGES_BASE_PATH || "/NUCASA-REMODELACIONES/").replace(/^\/+|\/+$/g, "") + "/").replace(/\/{2,}/g, "/");
const origin = process.env.PAGES_ORIGIN || "https://samuelacuna12.github.io";
const legal = JSON.parse(await readFile(resolve(root, "content/legal.json"), "utf8"));
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function metadata(path, title, description) {
  const url = new URL(base + path, origin).href;
  return `<meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${escape(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="es_CO" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${escape(url)}" />
    <meta property="og:image" content="${escape(new URL(base + "media/recorrido-poster.jpg", origin).href)}" />`;
}

try {
  await build({ configFile });
  await build({
    configFile,
    publicDir: false,
    build: {
      ssr: resolve(root, "pages/entry-server.tsx"),
      outDir: temporary,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: "entry-server.mjs" } },
    },
  });
  const { renderHome, renderLegal } = await import(pathToFileURL(resolve(temporary, "entry-server.mjs")).href);
  const template = await readFile(resolve(output, "index.html"), "utf8");
  const title = "nu casa — Espacios que se sienten tuyos";
  const description = "Remodelaciones de cocinas, baños y espacios completos en Bucaramanga. Diseño, materiales y una nueva forma de vivir tu casa.";
  if (!template.includes("<!--page-html-->")) throw new Error("Falta el punto de inserción del contenido estático.");
  await writeFile(resolve(output, "index.html"), template.replace("<!--page-html-->", renderHome()).replace("<!--page-meta-->", metadata("", title, description)));

  // Legal documents are full physical HTML pages; they need neither routing nor JavaScript.
  const legalTemplate = template
    .replace(/\s*<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/\s*<link\b[^>]*\brel="modulepreload"[^>]*>/g, "")
    .replace(/\s*<link\b[^>]*\bas="image"[^>]*>/g, "");
  for (const doc of legal.documents) {
    const path = "legal/" + doc.id + "/";
    const docTitle = doc.title + " | nu casa";
    await mkdir(resolve(output, path), { recursive: true });
    await writeFile(resolve(output, path, "index.html"), legalTemplate
      .replace(/<title>[\s\S]*?<\/title>/, "<title>" + escape(docTitle) + "</title>")
      .replace("<!--page-meta-->", metadata(path, docTitle, doc.introduction))
      .replace("<!--page-html-->", renderLegal(doc.id)));
  }
  await writeFile(resolve(output, ".nojekyll"), "");
  await writeFile(resolve(output, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${new URL(base + "sitemap.xml", origin).href}\n`);
  const urls = ["", ...legal.documents.map((doc) => "legal/" + doc.id + "/")];
  await writeFile(resolve(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => "<url><loc>" + escape(new URL(base + path, origin).href) + "</loc></url>").join("")}</urlset>\n`);
  console.log(`GitHub Pages: inicio + ${legal.documents.length} documentos legales en out/ (base ${base}).`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
