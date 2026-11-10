"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Mobiliario3D from "@/components/DeferredMobiliario3D";
import PhotorealWalkthrough, { type PhotorealWalkthroughHandle } from "@/components/PhotorealWalkthrough";
import CatalogoMobiliario from "@/components/CatalogoMobiliario";
import { siteUrl } from "@/lib/site-url";
import { responsiveImage } from "@/lib/responsive-image";

const WA = "https://wa.me/573213078837";
const MAP = "https://www.google.com/maps/search/?api=1&query=Carrera%2029%20%2330-39%2C%20La%20Aurora%2C%20Bucaramanga";
const CONSENT_KEY = "nucasa:consent:v1";
const POLICY_VERSION = "2026-11-07-v1";
const TTL = 180 * 24 * 60 * 60 * 1000;
const services = [
  { number: "01", name: "Remodelaciones de cocina", short: "Cocinas", id: "cocinas", image: "/media/cocina.jpg", text: "Una cocina pensada para tu ritmo. Distribución, mobiliario, superficies e iluminación que se encuentran en un espacio para compartir." },
  { number: "02", name: "Remodelaciones de baño", short: "Baños", id: "banos", image: "/media/bano.jpg", text: "Tu pausa de todos los días. Repensamos el espacio desde su distribución hasta la elección de materiales, griferías y luz." },
  { number: "03", name: "Remodelaciones completas", short: "Espacios completos", id: "completas", image: "/media/salon.jpg", text: "Una mirada completa a tu casa. Conectamos los ambientes para que diseño y funcionalidad hablen el mismo lenguaje." },
  { number: "04", name: "De obra gris a espectáculo", short: "De obra gris a espectáculo", id: "obra-gris", image: "/media/materiales.jpg", text: "El punto de partida puede ser una hoja en blanco. Damos forma a los acabados, la carpintería y los detalles que hacen tuyo un espacio." },
];
const CHAPTER_STOPS = [0, 0.3, 0.66, 0.96];
const chapters = [
  { label: "El espacio", title: ["Tu casa.", "Otra dimensión."], description: "Diseño, materiales y una nueva forma de vivir tu espacio." },
  { label: "Comedor", title: ["Donde la vida", "se encuentra."], description: "Luz, materiales y un lugar para los mejores momentos." },
  { label: "Sala", title: ["Espacios para", "quedarse."], description: "Mobiliario, texturas y proporciones que invitan a compartir." },
  { label: "Tu casa", title: ["El cambio", "se siente."], description: "Imaginemos cómo quieres vivir. Démosle forma a tu nueva casa." },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.35" /></svg>;
}
function Logo({ wordmark = false, className = "" }: { wordmark?: boolean; className?: string }) {
  return <span role="img" aria-label="nu casa, remodelaciones" className={"brand-logo " + (wordmark ? "brand-wordmark " : "") + className} />;
}
function WhatsAppLink({ children, className = "", topic = "" }: { children: React.ReactNode; className?: string; topic?: string }) {
  const text = "Hola, Nu Casa. Me gustaría conversar sobre " + (topic || "una remodelación") + ".";
  return <a className={className} href={WA + "?text=" + encodeURIComponent(text)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{children}</a>;
}
export default function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const walkthrough = useRef<PhotorealWalkthroughHandle>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const prefs = useRef<HTMLDialogElement>(null);
  const [cookieBanner, setCookieBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [activeService, setActiveService] = useState(0);
  const [motionReduced, setMotionReduced] = useState(false);
  const [comparison, setComparison] = useState(52);
  const activeChapter = useRef(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("privacidad") === "1") setPrefsOpen(true);
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const record = JSON.parse(stored);
        if (record.version === POLICY_VERSION && typeof record.updatedAt === "number" && record.updatedAt <= Date.now() && Date.now() - record.updatedAt < TTL && ["accepted", "rejected", "custom"].includes(record.status)) { setChoice(record.status); return; }
        localStorage.removeItem(CONSENT_KEY);
      }
    } catch { /* Optional technologies remain disabled. */ }
    setCookieBanner(true);
  }, []);
  function saveConsent(status: "accepted" | "rejected" | "custom") {
    const record = { version: POLICY_VERSION, status, necessary: true, analytics: false, advertising: false, externalContent: false, updatedAt: Date.now() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch { /* Keep the choice for this session. */ }
    setChoice(status); setCookieBanner(false); setPrefsOpen(false);
  }
  useEffect(() => {
    if (prefsOpen && prefs.current && !prefs.current.open) prefs.current.showModal();
    if (!prefsOpen && prefs.current?.open) prefs.current.close();
    document.body.classList.toggle("dialog-open", prefsOpen || menuOpen);
    return () => { document.body.classList.remove("dialog-open"); };
  }, [prefsOpen, menuOpen]);
  useEffect(() => {
    if (menuOpen && menu.current && !menu.current.open) menu.current.showModal();
    if (!menuOpen && menu.current?.open) menu.current.close();
  }, [menuOpen]);
  useEffect(() => {
    const reduced = motionReduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};
    let decorationObserver: IntersectionObserver | undefined;
    let decorationsStarted = false;
    let start = 0;
    let distance = 1;
    let frame = 0;
    let needsMeasure = true;
    let lastPosition = -1;
    let headerScrolled = window.scrollY > 36;
    setScrolled(headerScrolled);
    // The journey is essential: it must work before decorative animation modules load.
    const syncJourney = () => {
      if (disposed || reduced) return;
      const position = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      if (position === lastPosition) return;
      lastPosition = position;
      walkthrough.current?.seek(position);
      if (progress.current) progress.current.style.transform = "scaleX(" + position + ")";
      let next = 0;
      for (let i = 1; i < CHAPTER_STOPS.length; i++) if (position >= CHAPTER_STOPS[i] - 0.015) next = i;
      if (activeChapter.current !== next) { activeChapter.current = next; setChapter(next); }
    };
    const updateHeader = () => {
      const next = window.scrollY > 36;
      if (next !== headerScrolled) { headerScrolled = next; setScrolled(next); }
    };
    const scheduleFrame = (measure = false) => {
      if (disposed) return;
      needsMeasure = needsMeasure || measure;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (disposed) return;
        if (needsMeasure && hero.current) {
          const stage = hero.current.querySelector<HTMLElement>(".hero-stage");
          start = window.scrollY + hero.current.getBoundingClientRect().top;
          distance = Math.max(1, hero.current.offsetHeight - (stage?.clientHeight || window.innerHeight));
          needsMeasure = false;
        }
        updateHeader();
        // Ordinary scroll frames use cached geometry; resize reads finish before DOM writes.
        syncJourney();
      });
    };
    const onScroll = () => scheduleFrame();
    const measureJourney = () => scheduleFrame(true);
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measureJourney);
    if (hero.current) {
      resizeObserver?.observe(hero.current);
      const stage = hero.current.querySelector<HTMLElement>(".hero-stage");
      if (stage) resizeObserver?.observe(stage);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureJourney, { passive: true });
    window.addEventListener("pageshow", measureJourney);
    window.visualViewport?.addEventListener("resize", measureJourney);
    measureJourney();
    document.fonts.ready.then(measureJourney);
    const initializeDecorations = () => {
      if (disposed || reduced || decorationsStarted) return;
      decorationsStarted = true;
      decorationObserver?.disconnect();
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(el => gsap.from(el, { y: 24, opacity: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } }));
          gsap.to(".essence-arc", { y: -80, rotation: -8, ease: "none", scrollTrigger: { trigger: "#estudio", start: "top bottom", end: "bottom top", scrub: 0.65 } });
          ScrollTrigger.refresh();
        }, root);
        cleanup = () => ctx.revert();
        document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
      }).catch(() => { /* The native journey and visible content remain available. */ });
    };
    if (!reduced) {
      const targets = root.current?.querySelectorAll<HTMLElement>("#estudio, [data-reveal]");
      if (typeof IntersectionObserver !== "undefined" && targets?.length) {
        decorationObserver = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) initializeDecorations();
        }, { rootMargin: "800px 0px", threshold: 0 });
        targets.forEach(target => decorationObserver!.observe(target));
      } else initializeDecorations();
    }
    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      cleanup();
      decorationObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureJourney);
      window.removeEventListener("pageshow", measureJourney);
      window.visualViewport?.removeEventListener("resize", measureJourney);
    };
  }, [motionReduced]);
  function goChapter(index: number) {
    if (!hero.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      activeChapter.current = index;
      setChapter(index);
      walkthrough.current?.seek(CHAPTER_STOPS[index]);
      if (progress.current) progress.current.style.transform = "scaleX(" + CHAPTER_STOPS[index] + ")";
      return;
    }
    const stage = hero.current.querySelector<HTMLElement>(".hero-stage");
    const distance = Math.max(1, hero.current.offsetHeight - (stage?.clientHeight || window.innerHeight));
    const start = window.scrollY + hero.current.getBoundingClientRect().top;
    window.scrollTo({ top: start + distance * CHAPTER_STOPS[index], behavior: "smooth" });
  }
  return <div ref={root} className="nu-site">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className={"site-header " + (scrolled ? "is-scrolled" : "")}>
      <a href="#inicio" className="header-brand" aria-label="Nu Casa, ir al inicio"><Logo /></a>
      <nav className="desktop-nav" aria-label="Navegación principal">
        <a href="#inicio">Inicio</a><a href={siteUrl("/quienes-somos/")}>Quiénes somos</a>
        <div className="nav-services"><a href="#servicios">Servicios <span aria-hidden="true">⌄</span></a><div className="service-menu">{services.map((s,i) => <a key={s.id} href={"#servicio-" + s.id} onClick={() => setActiveService(i)}>{s.name}</a>)}</div></div>
        <a href="#coleccion">Tienda</a><a href="#transformacion">Transformaciones</a><a href="#contacto">Contacto</a>
      </nav>
      <WhatsAppLink className="header-cta">Hablemos <Arrow diagonal /></WhatsAppLink>
      <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="mobile-nav"><span /><span /></button>
    </header>
    <main id="contenido">
      <section ref={hero} id="inicio" className="hero-track" aria-label="Recorrido fotorrealista por un interior">
        <div className="hero-stage">
          <div className="hero-scene"><PhotorealWalkthrough ref={walkthrough} frameCount={307} /></div>
          <div className="hero-shade" />
          <div className="hero-meta"><span>DISEÑO & REMODELACIONES</span><span>BUCARAMANGA, COLOMBIA</span></div>
          <div className={"hero-copy chapter-" + chapter + (chapter % 2 === 1 ? " is-right" : "")} key={chapter}>
            <p className="eyebrow light"><span className="fine-dash" /> {String(chapter + 1).padStart(2, "0")} / {chapters[chapter].label}</p>
            <h1>{chapters[chapter].title[0]}<br />{chapters[chapter].title[1]}</h1>
            <p className="hero-description">{chapters[chapter].description}</p>
            <WhatsAppLink className="text-link light">Imaginemos tu espacio <Arrow diagonal /></WhatsAppLink>
          </div>
          <div className="hero-bottom"><a href="#estudio" className="discover"><span className="circle-arrow">↓</span><span>DESLIZA PARA RECORRER</span></a><nav className="chapters" aria-label="Capítulos del recorrido">{chapters.map((c,i) => <button key={c.label} className={i === chapter ? "is-active" : ""} aria-current={i === chapter ? "step" : undefined} onClick={() => goChapter(i)}><span>0{i+1}</span> {c.label}</button>)}</nav><span className="visual-caption">RECORRIDO DE INTERIOR · DESLIZA</span></div>
          <div className="hero-progress" aria-hidden="true"><span ref={progress} /></div>
        </div>
      </section>
      <section id="estudio" className="essence section-pad">
        <div className="section-kicker" data-reveal><span>01 / LA ESENCIA</span><span>UNA NUEVA FORMA DE HABITAR</span></div>
        <div className="essence-grid"><h2 data-reveal>Todo empieza<br />por cómo quieres<br /><span>vivir.</span></h2><div className="essence-body" data-reveal><p className="large-copy">Una casa pensada<br />para tu día a día.</p><p>La manera en que entra la luz. La cocina donde todo se encuentra. Ese rincón que por fin se siente tuyo. En Nu Casa, el diseño comienza por cómo quieres vivir.</p><p>Transformamos cocinas, baños y espacios completos en Bucaramanga, conectando distribución, materiales y detalles con tu día a día.</p><a href={siteUrl("/quienes-somos/")} className="text-link light">Conoce nuestra mirada <Arrow diagonal /></a></div></div>
        <div className="essence-arc" aria-hidden="true"><svg viewBox="0 0 300 300" fill="none"><path d="M2 298V2h296v296H2Zm0-51C40 139 153 77 298 116M93 298c0-106 112-155 205-65" stroke="currentColor" strokeWidth="0.8" /></svg></div>
      </section>
      <section id="servicios" className="services-section section-pad">
        <div className="section-kicker dark" data-reveal><span>02 / LO QUE HACEMOS</span><span>DISEÑO QUE SE VIVE</span></div>
        <div className="section-heading" data-reveal><h2>Cada espacio.<br />Su mejor versión.</h2><p>Desde un ambiente que pide un cambio<br />hasta una transformación completa.</p></div>
        <div className="services-layout"><div className="services-list">{services.map((s,i) => <details key={s.id} id={"servicio-" + s.id} className="service-item" open={activeService === i}><summary onClick={e => { e.preventDefault(); setActiveService(activeService === i ? -1 : i); }}><span className="service-index">{s.number}</span><h3>{s.short}</h3><span className="service-plus" aria-hidden="true">{activeService === i ? "−" : "+"}</span></summary><div className="service-detail"><p>{s.text}</p><WhatsAppLink className="text-link" topic={s.name.toLowerCase()}>Hablemos de este espacio <Arrow diagonal /></WhatsAppLink></div></details>)}</div><figure className="service-image"><img {...responsiveImage(services[Math.max(0, activeService)].image, "(max-width: 800px) calc(100vw - 40px), 50vw")} alt={"Ambiente de referencia para " + services[Math.max(0, activeService)].name.toLowerCase()} loading="lazy" /><figcaption>AMBIENTE DE REFERENCIA / {services[Math.max(0, activeService)].number}</figcaption><span className="image-corner" aria-hidden="true">↗</span></figure></div>
      </section>
      <section id="transformacion" className="transformation section-pad">
        <div className="section-kicker" data-reveal><span>03 / EL PODER DE TRANSFORMAR</span><span>DESLIZA. IMAGINA. DESCUBRE.</span></div>
        <div className="section-heading" data-reveal><h2>El mismo lugar.<br />Otra manera de vivirlo.</h2><p>Un espacio en obra gris es el comienzo<br />de todo lo que puede llegar a ser.</p></div>
        <div className="before-after" style={{ "--reveal": comparison + "%" } as CSSProperties}><img className="comparison-after" {...responsiveImage("/media/transformacion-despues.webp", "(max-width: 800px) calc(100vw - 40px), 90vw")} alt="Visualización conceptual de cocina terminada con piedra clara y madera oscura" loading="lazy" /><div className="comparison-before"><img {...responsiveImage("/media/transformacion-antes.webp", "(max-width: 800px) calc(100vw - 40px), 90vw")} alt="La misma cocina en una visualización conceptual de obra gris" loading="lazy" /></div><span className="comparison-label before-label">OBRA GRIS</span><span className="comparison-label after-label">NUEVA POSIBILIDAD</span><div className="comparison-line"><span aria-hidden="true">← &nbsp; →</span></div><label className="sr-only" htmlFor="before-after">Comparar obra gris y diseño terminado</label><input id="before-after" type="range" min="0" max="100" value={comparison} onChange={e => setComparison(Number(e.target.value))} aria-valuetext={comparison + "% de la vista de obra gris"} /></div>
        <div className="transformation-note"><p>Visualización conceptual creada con IA. No corresponde a una obra ejecutada ni a un cliente de Nu Casa.</p><WhatsAppLink className="text-link light" topic="un espacio en obra gris">Quiero transformar el mío <Arrow diagonal /></WhatsAppLink></div>
      </section>
      <section id="coleccion" className="collection section-pad">
        <div className="section-kicker dark" data-reveal><span>04 / PIEZAS CON INTENCIÓN</span><span>MOBILIARIO & OBJETOS</span></div>
        <div className="collection-grid"><div className="collection-copy" data-reveal><h2>Mobiliario<br />que hace<br />tu espacio.</h2><p>Un mueble en L para reunir a todos. Una cocina que funciona contigo. Una pieza para cada momento de tu casa.</p><p>Explora las categorías, abre las imágenes y descubre las posibilidades de cada ambiente.</p><a className="text-link" href="#catalogo">Explorar mobiliario <Arrow diagonal /></a><p className="collection-note">Diseños y visualizaciones de referencia. Cada propuesta se define según tu espacio y tus necesidades.</p></div><div className="collection-object"><Mobiliario3D modelUrl={siteUrl("/media/sofa-l-meshopt.glb")} /><span className="object-caption">MUEBLE EN L / ARRASTRA PARA EXPLORAR</span></div></div>
        <div id="catalogo" className="catalogue-wrap"><CatalogoMobiliario initialCategory="muebles-tv" availableImages={[
          "/media/catalogo/cocina-1.jpg", "/media/catalogo/tv-1.jpg",
          "/media/catalogo/lampara-1.jpg", "/media/catalogo/silla-1.jpg",
          "/media/catalogo/comedor-1.jpg", "/media/catalogo/mueble-l-1.jpg",
        ]} /></div>
      </section>
      <section className="process section-pad">
        <div className="section-kicker" data-reveal><span>05 / DE LA IDEA AL ESPACIO</span><span>EMPEZAMOS ESCUCHÁNDOTE</span></div>
        <div className="section-heading" data-reveal><h2>Tu siguiente paso<br />es una conversación.</h2></div>
        <div className="process-grid">{[{ n: "01", title: "Lo imaginamos contigo.", text: "Nos cuentas qué necesitas, cómo vives y qué esperas de tu espacio." }, { n: "02", title: "Le damos forma.", text: "Definimos el alcance, los materiales y una propuesta para tu proyecto." }, { n: "03", title: "Lo llevamos al espacio.", text: "Acordamos los detalles y la ejecución antes de empezar la transformación." }].map(p => <article key={p.n} data-reveal><span>{p.n}</span><h3>{p.title}</h3><p>{p.text}</p></article>)}</div>
      </section>
      <section id="contacto" className="contact-section section-pad" tabIndex={-1}>
        <div className="section-kicker" data-reveal><span>06 / HABLEMOS</span><span>BUCARAMANGA, SANTANDER</span></div>
        <div className="contact-grid"><h2 data-reveal>Tu nueva casa<br />empieza aquí.</h2><div className="contact-details" data-reveal><WhatsAppLink className="contact-phone">321 307 8837 <Arrow diagonal /></WhatsAppLink><a href="mailto:nucasa@gmail.com">nucasa@gmail.com</a><p>Carrera 29 #30-39<br />Barrio La Aurora<br />Bucaramanga, Colombia</p><a href={MAP} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-link light">Cómo llegar <Arrow diagonal /></a><p className="contact-privacy">Al escribirnos, atenderemos tu solicitud de acuerdo con nuestra <a href={siteUrl("/legal/privacidad/")}>Política de privacidad</a>. WhatsApp y Google Maps se abren como servicios externos cuando los eliges.</p></div></div>
        <WhatsAppLink className="contact-button">Conversemos sobre tu proyecto <Arrow diagonal /></WhatsAppLink>
      </section>
    </main>
    <footer className="site-footer"><a href="#inicio" aria-label="Nu Casa, volver al inicio"><Logo wordmark /></a><div className="footer-bottom"><p>© {new Date().getFullYear()} NU CASA · REMODELACIONES<br /><span>Omar Gonzalez · Identificación: 1098623128</span></p><div><a href={siteUrl("/legal/privacidad/")}>Privacidad y datos</a><a href={siteUrl("/legal/cookies/")}>Cookies</a><a href={siteUrl("/legal/terminos/")}>Términos de uso</a><button onClick={() => setPrefsOpen(true)}>Configurar privacidad</button></div><a href="#inicio" className="back-top" aria-label="Volver al inicio">↑</a></div></footer>
    {cookieBanner && <aside className="cookie-banner" aria-label="Preferencias de privacidad"><div><p className="cookie-title">Tu privacidad</p><p>Usamos almacenamiento local para recordar tu elección. No cargamos analítica ni publicidad. <a href={siteUrl("/legal/cookies/")}>Ver política</a></p></div><div className="cookie-actions"><button onClick={() => saveConsent("accepted")}>Aceptar</button><button onClick={() => saveConsent("rejected")}>Rechazar</button><button onClick={() => setPrefsOpen(true)}>Configurar</button></div></aside>}
    <dialog ref={prefs} className="privacy-dialog" onCancel={() => setPrefsOpen(false)} onClick={e => { if (e.target === e.currentTarget) setPrefsOpen(false); }} aria-labelledby="privacy-title"><div className="dialog-top"><span className="eyebrow">TU ELECCIÓN</span><button onClick={() => setPrefsOpen(false)} aria-label="Cerrar preferencias de privacidad">×</button></div><h2 id="privacy-title">Tu privacidad,<br />en tus manos.</h2><p>Solo utilizamos almacenamiento necesario para recordar esta elección durante 180 días. Aceptar ahora no autoriza nuevos proveedores ni comunicaciones comerciales.</p>{[{ name: "Necesarias", text: "Recuerdan tu elección de privacidad.", checked: true }, { name: "Analítica", text: "No se utiliza en esta web.", checked: false }, { name: "Publicidad", text: "No se cargan píxeles publicitarios.", checked: false }, { name: "Contenido externo", text: "No se incrustan mapas ni videos de terceros.", checked: false }].map(c => <label key={c.name} className="consent-row"><span><strong>{c.name}</strong><small>{c.text}</small></span><input type="checkbox" checked={c.checked} disabled readOnly aria-label={c.name + (c.checked ? ", siempre activas" : ", no disponibles")} /></label>)}<p className="privacy-choice">{choice ? "Puedes actualizar tu elección en cualquier momento." : "Las tecnologías opcionales permanecen desactivadas."} <a href={siteUrl("/legal/privacidad/")}>Política de privacidad</a>.</p><div className="privacy-actions"><button onClick={() => saveConsent("accepted")}>Aceptar</button><button onClick={() => saveConsent("rejected")}>Rechazar</button><button onClick={() => saveConsent("custom")}>Guardar preferencias</button></div></dialog>
    <dialog ref={menu} id="mobile-nav" className="mobile-menu" onCancel={() => setMenuOpen(false)} aria-label="Menú de navegación"><div className="dialog-top"><Logo /><button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>×</button></div><nav>{[{ href: "#inicio", text: "Inicio" }, { href: siteUrl("/quienes-somos/"), text: "Quiénes somos" }, { href: "#servicios", text: "Servicios" }, { href: "#coleccion", text: "Tienda" }, { href: "#transformacion", text: "Transformaciones" }, { href: "#contacto", text: "Contacto" }].map((l,i) => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}><span>0{i+1}</span>{l.text}<Arrow diagonal /></a>)}</nav><p>Bucaramanga, Colombia<br /><a href="tel:+573213078837">321 307 8837</a></p></dialog>
  </div>;
}
