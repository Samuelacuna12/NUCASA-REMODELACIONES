import { notFound } from "next/navigation";
import type { Metadata } from "next";
import legal from "@/content/legal.json";

type Props = { params: Promise<{ slug: string }> };
type LegalSection = { title: string; paragraphs?: string[]; bullets?: string[]; links?: { label: string; url: string }[] };
export function generateStaticParams() { return legal.documents.map(d => ({ slug: d.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = legal.documents.find(d => d.id === slug);
  return { title: (doc?.title || "Información legal") + " — nu casa" };
}
export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const doc = legal.documents.find(d => d.id === slug);
  if (!doc) notFound();
  return <main className="legal-page">
    <header className="legal-header"><a href="/" aria-label="Nu Casa, volver al inicio"><span className="brand-logo" role="img" aria-label="nu casa" /></a><a href="/">← Volver al inicio</a></header>
    <article className="legal-content">
      <p className="eyebrow">NU CASA / INFORMACIÓN LEGAL</p><h1>{doc.title}</h1>
      <p className="legal-date">Vigencia: 7 de noviembre de 2026</p><p className="legal-introduction">{doc.introduction}</p>
      {(doc.sections as LegalSection[]).map(section => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map(p => <p key={p}>{p}</p>)}{section.bullets && <ul>{section.bullets.map(b => <li key={b}>{b}</li>)}</ul>}{section.links && <ul className="legal-links">{section.links.map(l => <li key={l.url}><a href={l.url} target={l.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" referrerPolicy="no-referrer">{l.label} ↗</a></li>)}</ul>}</section>)}
      <aside className="legal-contact"><h2>Contacta al responsable</h2><p>Omar Gonzalez · Identificación: 1098623128<br />Carrera 29 #30-39, barrio La Aurora, Bucaramanga</p><a href="mailto:nucasa@gmail.com">nucasa@gmail.com</a><br /><a href="tel:+573213078837">+57 321 307 8837</a></aside>
    </article>
    <footer className="legal-footer"><a href="/legal/privacidad">Privacidad y datos</a><a href="/legal/cookies">Cookies</a><a href="/legal/terminos">Términos de uso</a><a href="/?privacidad=1">Configurar privacidad</a><a href="/">Inicio</a></footer>
  </main>;
}
