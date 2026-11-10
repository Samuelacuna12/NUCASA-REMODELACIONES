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
const images = JSON.parse(await readFile(resolve(root, "content/image-assets.json"), "utf8"));
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function metadata(path, title, description, image = "media/recorrido-poster.jpg") {
  const url = new URL(base + path, origin).href;
  return `<meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${escape(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="es_CO" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${escape(url)}" />
    <meta property="og:image" content="${escape(new URL(base + image.replace(/^\/+/, ""), origin).href)}" />`;
}

function serviceImage(path) {
  return images[path] || Object.values(images).find((image) => image.src === path)
    || { src: path, variants: [] };
}

function servicePreload(path) {
  const image = serviceImage(path);
  const url = (source) => base + source.replace(/^\/+/, "");
  const sourceSet = image.variants.map((variant) => url(variant.src) + " " + variant.width + "w").join(", ");
  // Keep this in sync with ServicePhoto so the preload and rendered image select the same file.
  const responsive = sourceSet ? ` imagesrcset="${escape(sourceSet)}" imagesizes="(max-width: 800px) 100vw, 55vw"` : "";
  const type = image.src.endsWith(".webp") ? "image/webp" : image.src.endsWith(".png") ? "image/png" : "image/jpeg";
  return `<link rel="preload" as="image" href="${escape(url(image.src))}" type="${type}"${responsive} fetchpriority="high" />`;
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
      rolldownOptions: {
        input: resolve(root, "pages/entry-server.tsx"),
        output: { entryFileNames: "entry-server.mjs" },
      },
    },
  });
  const { renderHome, renderAbout, renderServices, renderLegal, SERVICES } = await import(pathToFileURL(resolve(temporary, "entry-server.mjs")).href);
  const template = await readFile(resolve(output, "index.html"), "utf8");
  const aboutTemplate = await readFile(resolve(output, "quienes-somos/index.html"), "utf8");
  const servicesTemplate = await readFile(resolve(output, "servicios/index.html"), "utf8");
  const title = "nu casa — Espacios que se sienten tuyos";
  const description = "Remodelaciones de cocinas, baños y espacios completos en Bucaramanga. Diseño, materiales y una nueva forma de vivir tu casa.";
  if (!template.includes("<!--page-html-->")) throw new Error("Falta el punto de inserción del contenido estático.");
  if (!aboutTemplate.includes("<!--page-html-->")) throw new Error("Falta el punto de inserción de Quiénes somos.");
  if (!servicesTemplate.includes("<!--page-html-->") || !servicesTemplate.includes('data-service-id=""') || !servicesTemplate.includes("<!--service-hero-preload-->")) {
    throw new Error("La plantilla de servicios no contiene los puntos de inserción requeridos.");
  }
  if (SERVICES.length !== 4 || new Set(SERVICES.map((service) => service.id)).size !== 4
    || new Set(SERVICES.map((service) => service.slug)).size !== 4
    || SERVICES.some((service) => !/^[a-z0-9-]+$/.test(service.slug))) {
    throw new Error("Se requieren cuatro servicios con identificadores y slugs únicos.");
  }
  await writeFile(resolve(output, "index.html"), template.replace("<!--page-html-->", renderHome()).replace("<!--page-meta-->", metadata("", title, description)));
  const aboutTitle = "Quiénes somos — nu casa";
  const aboutDescription = "Conoce la mirada de Nu Casa sobre los espacios que habitamos. Diseño, remodelaciones y mobiliario en Bucaramanga.";
  await writeFile(resolve(output, "quienes-somos/index.html"), aboutTemplate
    .replace(/<title>[\s\S]*?<\/title>/, "<title>" + escape(aboutTitle) + "</title>")
    .replace("<!--page-html-->", renderAbout())
    .replace("<!--page-meta-->", metadata("quienes-somos/", aboutTitle, aboutDescription, "media/about/hero.webp")));

  const servicePaths = ["servicios/", ...SERVICES.map((service) => "servicios/" + service.slug + "/")];
  for (const service of [undefined, ...SERVICES]) {
    const path = service ? "servicios/" + service.slug + "/" : "servicios/";
    const serviceTitle = (service?.name || "Servicios") + " — nu casa";
    const serviceDescription = service?.metaDescription
      || "Diseño, renders, fabricación de mobiliario y remodelaciones de cocinas, baños y viviendas en Bucaramanga. Explora los servicios de Nu Casa.";
    const hero = service?.hero || "/media/cocina.webp";
    // React also emits a responsive image preload; the matching hint already belongs in the head.
    const markup = renderServices(service?.id).replace(/<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")[^>]*>/gi, "");
    const html = servicesTemplate
      .replace(/<title>[\s\S]*?<\/title>/, "<title>" + escape(serviceTitle) + "</title>")
      .replace('data-service-id=""', 'data-service-id="' + escape(service?.id || "") + '"')
      .replace("<!--service-hero-preload-->", servicePreload(hero))
      .replace("<!--page-meta-->", metadata(path, serviceTitle, serviceDescription, serviceImage(hero).src))
      .replace("<!--page-html-->", markup);
    await mkdir(resolve(output, path), { recursive: true });
    await writeFile(resolve(output, path, "index.html"), html);
  }

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
  const urls = ["", "quienes-somos/", ...servicePaths, ...legal.documents.map((doc) => "legal/" + doc.id + "/")];
  await writeFile(resolve(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => "<url><loc>" + escape(new URL(base + path, origin).href) + "</loc></url>").join("")}</urlset>\n`);
  console.log(`GitHub Pages: inicio + Quiénes somos + ${servicePaths.length} páginas de servicios + ${legal.documents.length} documentos legales en out/ (base ${base}).`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
