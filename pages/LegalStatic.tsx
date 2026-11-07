import legal from "../content/legal.json";
import { siteUrl } from "../lib/site-url";

export type LegalStaticProps = { slug: string };

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: { label: string; url: string }[];
};

/** Static equivalent of the legal document route, without a framework runtime. */
export function LegalStatic({ slug }: LegalStaticProps) {
  const doc = legal.documents.find((document) => document.id === slug);
  if (!doc) throw new Error(`Documento legal no encontrado: ${slug}`);

  return <main className="legal-page">
    <header className="legal-header">
      <a href={siteUrl("/")} aria-label="Nu Casa, volver al inicio"><span className="brand-logo" role="img" aria-label="nu casa" /></a>
      <a href={siteUrl("/")}>← Volver al inicio</a>
    </header>
    <article className="legal-content">
      <p className="eyebrow">NU CASA / INFORMACIÓN LEGAL</p>
      <h1>{doc.title}</h1>
      <p className="legal-date">Vigencia: 7 de noviembre de 2026</p>
      <p className="legal-introduction">{doc.introduction}</p>
      {(doc.sections as LegalSection[]).map((section) => <section key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        {section.links && <ul className="legal-links">{section.links.map((link) => <li key={link.url}>
          <a href={link.url.startsWith("/") ? siteUrl(link.url) : link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" referrerPolicy="no-referrer">{link.label} ↗</a>
        </li>)}</ul>}
      </section>)}
      <aside className="legal-contact">
        <h2>Contacta al responsable</h2>
        <p>Omar Gonzalez · Identificación: 1098623128<br />Carrera 29 #30-39, barrio La Aurora, Bucaramanga</p>
        <a href="mailto:nucasa@gmail.com">nucasa@gmail.com</a><br />
        <a href="tel:+573213078837">+57 321 307 8837</a>
      </aside>
    </article>
    <footer className="legal-footer">
      <a href={siteUrl("/legal/privacidad/")}>Privacidad y datos</a>
      <a href={siteUrl("/legal/cookies/")}>Cookies</a>
      <a href={siteUrl("/legal/terminos/")}>Términos de uso</a>
      <a href={siteUrl("/") + "?privacidad=1"}>Configurar privacidad</a>
      <a href={siteUrl("/")}>Inicio</a>
    </footer>
  </main>;
}

export default LegalStatic;
