"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import AboutFurniture from "../components/AboutFurniture";
import SitePrivacy from "../components/SitePrivacy";
import { siteUrl } from "../lib/site-url";

const CHAPTERS = [
  { id: "about-inicio", label: "Nuestra mirada" },
  { id: "about-historia", label: "El origen" },
  { id: "about-criterio", label: "Nuestro criterio" },
  { id: "about-piezas", label: "Espacios y piezas" },
  { id: "about-contigo", label: "Contigo" },
  { id: "about-proyecto", label: "Tu próxima casa" },
];
const STORY = [
  { label: "Idea", title: "Observar las posibilidades.", text: "Nu Casa nace de una idea: los espacios que habitamos pueden acompañarnos mejor." },
  { label: "Materiales", title: "Darle una intención al espacio.", text: "Una cocina donde reunirse. Un baño donde bajar el ritmo. Una sala que aproveche cada metro." },
  { label: "Transformación", title: "Una nueva forma de vivirlo.", text: "Esa idea guía nuestra forma de entender una remodelación: observar cómo funciona un espacio, reconocer sus posibilidades y darle forma a lo que viene." },
];
const CRITERIA = [
  { id: "distribucion", name: "Distribución", short: "Cómo se recorre.", text: "Cómo entras, cómo te mueves y dónde guardas lo que usas. Pensar una casa también es hacer más sencillos esos recorridos cotidianos.", alt: "Comedor contemporáneo visto desde el acceso, con mesa de madera y luz natural", points: [{ x: 45, y: 80, name: "Recorridos", text: "Dejar lugar para moverte entre las piezas también forma parte del diseño." }, { x: 70, y: 57, name: "Encuentro", text: "La relación entre mesa y asientos invita a imaginar cómo se comparte el espacio." }] },
  { id: "materiales", name: "Materiales", short: "Cómo se toca.", text: "La calidez de la madera. La textura de una superficie. La relación entre lo que ves y lo que tocas. Cada elección tiene un lugar y una razón.", alt: "Detalle de la mesa de madera, estructura metálica y asientos tapizados del mismo comedor", points: [{ x: 44, y: 34, name: "Madera", text: "Una superficie aporta tono, textura y una forma particular de recibir la luz." }, { x: 54, y: 76, name: "Contraste", text: "La madera y la estructura oscura se leen juntas, como parte de una misma composición." }] },
  { id: "detalles", name: "Detalles", short: "Cómo se siente.", text: "La altura de una lámpara. El encuentro entre dos acabados. La apertura de un cajón. Una casa también se define de cerca.", alt: "Detalle de la mesa, jarrón, cortinas y sillas del mismo ambiente", points: [{ x: 36, y: 42, name: "Luz", text: "La entrada de luz permite descubrir matices y cambia la lectura de los materiales." }, { x: 75, y: 64, name: "Proporción", text: "Observar las piezas de cerca ayuda a entender cómo se relacionan sus formas." }] },
];
const bounded = (value: number) => Math.max(0, Math.min(1, value));
const media = (name: string) => siteUrl("/media/about/" + name + ".webp");

function Arrow({ down = false }: { down?: boolean }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d={down ? "M12 4v15m-6-6 6 6 6-6" : "M5 19 19 5M5 5h14v14"} stroke="currentColor" strokeWidth="1.25" /></svg>;
}

function Arch({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 300 300" fill="none" aria-hidden="true"><path d="M3 297V3h294v294H3Zm0-51C39 138 153 77 297 116M92 297c0-106 112-155 205-65" stroke="currentColor" strokeWidth="1" /></svg>;
}

function ConceptPlan() {
  return <svg viewBox="0 0 800 500" className="about-plan" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.5"><path d="M115 64H692V426H115V64ZM125 74H682V416H125V74ZM125 135H230V337H125M230 135v202M125 237h105M288 74v36m0 70v236M447 74v36m0 70v236M606 74v36m0 70v236" /><path d="M355 171h238v136H355zM374 189h200v99H374zM115 363h76M115 363a76 76 0 0 1 76 63" /><path d="M373 139h42v27h-42zM448 139h42v27h-42zM523 139h42v27h-42zM373 312h42v27h-42zM448 312h42v27h-42zM523 312h42v27h-42z" /></g>
    <g stroke="currentColor" strokeWidth=".7" opacity=".5"><path d="M115 42H692M115 31v22M692 31v22M90 64V426M79 64h22M79 426h22M312 240h325M476 119v240" strokeDasharray="3 5" /></g>
    <g fill="currentColor" fontFamily="inherit" fontSize="12" letterSpacing="3"><text x="125" y="466">ESQUEMA CONCEPTUAL</text><text x="558" y="466">SIN ESCALA</text></g>
  </svg>;
}

function AboutDecisionTabs() {
  const [active, setActive] = useState(0);
  const id = useId();
  const choices = [
    { label: "Alcance", title: "Poner el proyecto en claro.", text: "Conversamos sobre lo que quieres cambiar, los espacios que intervienen y las necesidades que debe resolver la propuesta.", detail: "Qué transformamos · Qué conservamos · Qué necesitamos revisar" },
    { label: "Materiales", title: "Elegir con una idea en mente.", text: "Relacionamos referencias, superficies y acabados con el uso de cada espacio. Las decisiones se entienden mejor cuando puedes ver cómo funcionan juntas.", detail: "Uso del espacio · Texturas y tonos · Relación entre acabados" },
    { label: "Ejecución", title: "Darle un orden al cambio.", text: "Antes de comenzar, conversamos sobre las etapas y las condiciones de la intervención. Cada proyecto necesita un alcance definido y decisiones compartidas.", detail: "Etapas del proyecto · Condiciones del espacio · Acuerdos previos" },
  ];
  return <div className="about-decisions">
    <div className="about-decision-options" role="group" aria-label="Qué quieres conocer de nuestra forma de acompañarte">{choices.map((choice, i) => <button id={id + "-choice-" + i} key={choice.label} aria-pressed={active === i} aria-controls={id + "-panel"} onClick={() => setActive(i)}><span>0{i + 1}</span>{choice.label}<Arrow /></button>)}</div>
    <div className="about-decision-panel" id={id + "-panel"} role="region" aria-labelledby={id + "-choice-" + active}>
      <span className="about-decision-number" aria-hidden="true">0{active + 1}</span>
      <div className="about-decision-copy" aria-live="polite" aria-atomic="true"><h3>{choices[active].title}</h3><p>{choices[active].text}</p><p className="about-decision-detail">{choices[active].detail}</p></div>
    </div>
  </div>;
}

function AboutProjectBrief() {
  const [space, setSpace] = useState("cocina");
  const [note, setNote] = useState("");
  const options = [{ value: "cocina", label: "Mi cocina", message: "mi cocina" }, { value: "bano", label: "Mi baño", message: "mi baño" }, { value: "vivienda", label: "Mi casa completa", message: "mi casa completa" }];
  const selected = options.find(option => option.value === space) ?? options[0];
  const message = "Hola, Nu Casa. Quiero transformar " + selected.message + "." + (note.trim() ? " " + note.trim() : " Me gustaría conversar sobre mi proyecto.");
  const id = useId();
  return <div className="about-brief">
    <fieldset><legend>Quiero transformar…</legend><div className="about-space-options">{options.map((option, i) => <label key={option.value} className={space === option.value ? "is-selected" : ""}><input type="radio" name={id + "-space"} value={option.value} checked={space === option.value} onChange={() => setSpace(option.value)} /><span className="about-space-index" aria-hidden="true">0{i + 1}</span><span>{option.label}</span><span className="about-space-check" aria-hidden="true">↗</span></label>)}</div></fieldset>
    <label className="about-note-label" htmlFor={id + "-note"}>¿Qué te gustaría cambiar? <span>Opcional</span></label>
    <textarea id={id + "-note"} maxLength={300} rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder="Por ejemplo: abrir la cocina y aprovechar mejor el espacio." />
    <div className="about-message-preview" aria-live="polite"><span>TU PRÓXIMO PASO</span><p>Conversemos sobre {selected.message}.</p></div>
    <a className="about-primary-link" href={"https://wa.me/573213078837?text=" + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Preparar consulta en WhatsApp <Arrow /></a>
    <p className="about-brief-privacy">Abrirás WhatsApp con tu selección. El mensaje se envía cuando lo confirmas allí. Consulta nuestra <a href={siteUrl("/legal/privacidad/")}>Política de privacidad</a>.</p>
  </div>;
}

export default function AboutExperience() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const heroFrame = useRef<HTMLDivElement>(null);
  const heroPhoto = useRef<HTMLImageElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLElement>(null);
  const pageProgress = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const menuOpener = useRef<HTMLButtonElement>(null);
  const chapterPositions = useRef({ historyStart: 0, historyDistance: 1, scrollable: true });
  const [chapter, setChapter] = useState(0);
  const [story, setStory] = useState(0);
  const [material, setMaterial] = useState("madera");
  const [criterion, setCriterion] = useState(0);
  const [focusPoint, setFocusPoint] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const currentChapter = useRef(0), currentStory = useRef(0);
  const pointerFrame = useRef(0);
  const detailId = useId();
  const item = CRITERIA[criterion];
  const point = focusPoint === null ? undefined : item.points[focusPoint];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const dialog = menu.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    else if (!menuOpen && dialog.open) { dialog.close(); menuOpener.current?.focus({ preventScroll: true }); }
  }, [menuOpen]);

  useEffect(() => {
    const reducedMotion = reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false, frame = 0, measure = true;
    let starts: number[] = [], heroStart = 0, heroDistance = 1, total = 1, stageHeight = 1;
    let lastChapter = currentChapter.current, lastStory = currentStory.current, header = window.scrollY > 36;
    setScrolled(header);
    const readGeometry = () => {
      const y = window.scrollY;
      const heroStage = hero.current?.querySelector<HTMLElement>(".about-hero-stage");
      const storyStage = history.current?.querySelector<HTMLElement>(".about-story-stage");
      stageHeight = heroStage?.clientHeight || window.innerHeight;
      heroStart = y + (hero.current?.getBoundingClientRect().top || 0);
      heroDistance = Math.max(1, (hero.current?.offsetHeight || stageHeight) - stageHeight);
      const storyDistance = (history.current?.offsetHeight || 1) - (storyStage?.clientHeight || stageHeight);
      chapterPositions.current = { historyStart: y + (history.current?.getBoundingClientRect().top || 0) - 106, historyDistance: Math.max(1, storyDistance), scrollable: storyDistance > 100 };
      starts = CHAPTERS.map(c => y + (document.getElementById(c.id)?.getBoundingClientRect().top || 0));
      total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      measure = false;
    };
    const update = () => {
      frame = 0;
      if (disposed) return;
      if (measure) readGeometry();
      const y = window.scrollY;
      const nextHeader = y > 36;
      if (nextHeader !== header) { header = nextHeader; setScrolled(header); }
      if (pageProgress.current) pageProgress.current.style.transform = "scaleY(" + bounded(y / total) + ")";
      let nextChapter = 0;
      starts.forEach((start, i) => { if (y + stageHeight * 0.42 >= start) nextChapter = i; });
      if (nextChapter !== lastChapter) { lastChapter = nextChapter; currentChapter.current = nextChapter; setChapter(nextChapter); }
      if (reducedMotion) return;
      const progress = bounded((y - heroStart) / heroDistance);
      if (heroFrame.current) heroFrame.current.style.transform = "translate3d(" + (-progress * 22) + "vw," + (-progress * 4) + "vh,0) scale(" + (1 + progress * 1.8) + ")";
      if (heroCopy.current) { heroCopy.current.style.transform = "translate3d(0," + (-progress * 34) + "px,0)"; heroCopy.current.style.opacity = String(Math.max(0.15, 1 - progress * 0.85)); }
      if (!chapterPositions.current.scrollable) return;
      const storyProgress = bounded((y - chapterPositions.current.historyStart) / chapterPositions.current.historyDistance);
      const nextStory = Math.min(2, Math.floor(storyProgress * 3));
      if (nextStory !== lastStory) { lastStory = nextStory; currentStory.current = nextStory; setStory(nextStory); }
    };
    const schedule = () => { if (!disposed && !frame) frame = window.requestAnimationFrame(update); };
    const resize = () => { measure = true; schedule(); };
    const observer = new ResizeObserver(resize);
    if (root.current) observer.observe(root.current);
    if (hero.current) observer.observe(hero.current);
    if (history.current) observer.observe(history.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize);
    window.addEventListener("pageshow", resize);
    document.fonts.ready.then(() => { if (!disposed) resize(); });
    schedule();
    return () => { disposed = true; if (frame) window.cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", resize); window.removeEventListener("pageshow", resize); window.visualViewport?.removeEventListener("resize", resize); };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let disposed = false, cleanup = () => {};
    const run = () => {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-about-reveal]").forEach(element => gsap.from(element, { y: 20, opacity: 0, duration: 0.5, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 94%", once: true } }));
          gsap.to(".about-thread-arch", { y: -50, rotation: -8, ease: "none", scrollTrigger: { trigger: "#about-contigo", start: "top bottom", end: "bottom top", scrub: 0.3 } });
        }, root);
        cleanup = () => context.revert();
      }).catch(() => { /* Native interactions and all editorial content remain available. */ });
    };
    const timer = window.setTimeout(run, 450);
    return () => { disposed = true; window.clearTimeout(timer); cleanup(); };
  }, [reduced]);

  useEffect(() => () => { if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current); }, []);

  function chooseStory(index: number) {
    setStory(index); currentStory.current = index;
    if (reduced || !chapterPositions.current.scrollable) return;
    const { historyStart, historyDistance } = chapterPositions.current;
    window.scrollTo({ top: historyStart + historyDistance * [0.05, 0.44, 0.82][index], behavior: "smooth" });
  }

  function moveHero(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !heroPhoto.current || (event.pointerType !== "mouse" && !event.buttons)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = window.requestAnimationFrame(() => { pointerFrame.current = 0; if (heroPhoto.current) heroPhoto.current.style.transform = `translate3d(${x}px,${y}px,0) scale(1.04)`; });
  }

  return <div className="about-page" ref={root}>
    <a className="skip-link" href="#about-contenido">Saltar al contenido</a>
    <header className={"site-header about-header " + (scrolled ? "is-scrolled" : "")}>
      <a href={siteUrl("/")} aria-label="Nu Casa, ir a Inicio"><span className="brand-logo" role="img" aria-label="nu casa, remodelaciones" /></a>
      <nav className="desktop-nav" aria-label="Navegación principal"><a href={siteUrl("/")}>Inicio</a><a href="#about-inicio" aria-current="page">Quiénes somos</a><a href={siteUrl("/#servicios")}>Servicios</a><a href={siteUrl("/#coleccion")}>Tienda</a><a href={siteUrl("/#transformacion")}>Transformaciones</a><a href={siteUrl("/#contacto")}>Contacto</a></nav>
      <a className="header-cta" href="#about-proyecto">Hablemos <Arrow /></a>
      <button className="menu-toggle" ref={menuOpener} onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} aria-controls="about-mobile-nav"><span /><span /></button>
    </header>

    <nav className="about-chapters" aria-label="Capítulos de Quiénes somos"><span className="about-chapter-line" aria-hidden="true"><span ref={pageProgress} /></span>{CHAPTERS.map((c, i) => <a key={c.id} href={"#" + c.id} aria-label={"0" + (i + 1) + " · " + c.label} aria-current={chapter === i ? "step" : undefined}><span className="about-chapter-number">0{i + 1}</span><span className="about-chapter-label">{c.label}</span></a>)}</nav>

    <main id="about-contenido">
      <section id="about-inicio" ref={hero} className="about-hero-track" aria-labelledby="about-title"><div className="about-hero-stage">
        <div className="about-hero-meta"><span>NU CASA / QUIÉNES SOMOS</span><span>BUCARAMANGA, COLOMBIA</span></div>
        <div ref={heroFrame} className="about-hero-frame" onPointerMove={moveHero} onPointerLeave={() => { if (pointerFrame.current) window.cancelAnimationFrame(pointerFrame.current); if (heroPhoto.current) heroPhoto.current.style.transform = "scale(1.04)"; }}>
          <picture><source media="(max-width: 800px)" srcSet={media("hero-mobile")} /><img ref={heroPhoto} src={media("hero")} width="1600" height="1000" fetchPriority="high" decoding="async" alt="Comedor de referencia con madera, superficies minerales oscuras y luz natural" /></picture>
          <span className="about-frame-outline" aria-hidden="true" />
        </div>
        <div className="about-hero-copy" ref={heroCopy}><p className="about-eyebrow"><span />UNA FORMA DE MIRAR</p><h1 id="about-title">Cada decisión<br />se vive.</h1><p className="about-hero-description">Somos Nu Casa. Remodelamos cocinas, baños y espacios completos en Bucaramanga, conectando distribución, materiales y mobiliario con tu manera de vivir.</p><a className="about-text-link" href="#about-historia">Descubre nuestra mirada <Arrow /></a></div>
        <div className="about-hero-bottom"><a href="#about-historia"><span className="about-down-circle"><Arrow down /></span>DESLIZA PARA DESCUBRIR</a><span>01 — UNA NUEVA CASA EMPIEZA AQUÍ</span></div>
        <Arch className="about-hero-mark" />
      </div></section>

      <section id="about-historia" ref={history} className="about-story-track" aria-labelledby="about-story-title"><div className="about-story-stage">
        <div className="about-section-top"><span>01 / EL ORIGEN</span><span>UNA IDEA, MUCHAS POSIBILIDADES</span></div>
        <div className="about-story-grid"><div className="about-story-copy"><h2 id="about-story-title">Una nueva casa<br />empieza con<br /> una intención.</h2><div className="about-story-state" aria-live="polite" aria-atomic="true"><p className="about-eyebrow">0{story + 1} / {STORY[story].label}</p><h3>{STORY[story].title}</h3><p>{STORY[story].text}</p></div><div className="about-story-controls" role="group" aria-label="Etapas de nuestra mirada">{STORY.map((phase, i) => <button key={phase.label} aria-pressed={story === i} onClick={() => chooseStory(i)}><span>0{i + 1}</span>{phase.label}</button>)}</div></div>
          <figure className={"about-story-board phase-" + story}>
            <picture className="about-story-picture"><source media="(max-width: 800px)" srcSet={media("hero-mobile")} /><img className="about-story-photo" src={media("hero")} alt="El mismo comedor de referencia durante una exploración conceptual de idea y materiales" width="1600" height="1000" loading="lazy" decoding="async" /></picture>
            <ConceptPlan />
            <div className="about-material-study"><span className="about-study-label">EXPLORACIÓN DE MATERIA</span><div className="about-sample-controls" role="group" aria-label="Explorar muestras de material">{["madera", "piedra", "metal"].map(name => <button key={name} aria-pressed={material === name} aria-label={"Explorar muestra de " + name} onClick={() => setMaterial(name)}>{name === "metal" ? <span className="about-metal-sample" /> : <img src={media("muestra-" + name)} width="128" height="128" loading="lazy" decoding="async" alt="" />}<span>{name}</span></button>)}</div><p className="about-sample-caption">{material === "madera" ? "La calidez de una textura." : material === "piedra" ? "El carácter de una superficie." : "Un contraste que define la forma."}</p></div>
            <figcaption><span>ESTUDIO / NU CASA</span><span>AMBIENTE DE REFERENCIA</span></figcaption>
          </figure>
        </div><p className="about-concept-note">Exploración conceptual del proceso. El esquema es ilustrativo, sin escala; la fotografía no corresponde a una obra de Nu Casa.</p>
      </div></section>

      <section id="about-criterio" className="about-criterion about-section" aria-labelledby="about-criterion-title"><div className="about-section-top"><span>02 / NUESTRO CRITERIO</span><span>OBSERVAR. ENTENDER. TRANSFORMAR.</span></div><div className="about-section-heading" data-about-reveal><h2 id="about-criterion-title">Lo que miramos<br />antes de transformar.</h2><p>Una imagen.<br />Tres formas de entender el espacio.</p></div>
        <div className="about-criterion-tabs" role="group" aria-label="Explora nuestro criterio">{CRITERIA.map((c, i) => <button key={c.id} aria-pressed={criterion === i} aria-controls={detailId} onClick={() => { setCriterion(i); setFocusPoint(null); }}><span>0{i + 1}</span><strong>{c.name}</strong><span>{c.short}</span><Arrow /></button>)}</div>
        <div className="about-criterion-grid"><figure className="about-criterion-figure"><div className="about-criterion-media"><img src={media(item.id)} width="960" height="640" loading="lazy" decoding="async" alt={item.alt} style={{ transform: point ? "scale(1.22)" : "scale(1)", transformOrigin: point ? `${point.x}% ${point.y}%` : "center" }} />{item.points.map((p, i) => <button className="about-photo-point" key={p.name} style={{ left: p.x + "%", top: p.y + "%" }} aria-label={"Explorar " + p.name.toLowerCase()} aria-pressed={focusPoint === i} aria-controls={detailId} onClick={() => setFocusPoint(focusPoint === i ? null : i)}><span aria-hidden="true">{focusPoint === i ? "−" : "+"}</span></button>)}{point && <button className="about-reset-zoom" onClick={() => setFocusPoint(null)}>Restablecer encuadre ↗</button>}</div><figcaption><span>SELECCIONA UN PUNTO PARA ACERCARTE</span><span>FOTOGRAFÍA DE REFERENCIA</span></figcaption></figure><div id={detailId} className="about-criterion-copy" aria-live="polite" aria-atomic="true"><p className="about-eyebrow">0{criterion + 1} / {item.name}</p><h3>{point ? point.name + "." : item.short}</h3><p>{point ? point.text : item.text}</p><span className="about-criterion-footer">EL DETALLE TAMBIÉN HACE EL CONJUNTO</span></div></div>
      </section>

      <section id="about-piezas" className="about-furniture-section about-section" aria-labelledby="about-pieces-title"><div className="about-section-top"><span>03 / ESPACIOS Y MOBILIARIO</span><span>FORMA. VOLUMEN. TEXTURA.</span></div><div className="about-section-heading" data-about-reveal><h2 id="about-pieces-title">El espacio y<br />lo que lo habita.</h2><p>Un mueble cambia cómo aprovechas una sala. Una lámpara cambia la forma de verla. Por eso pensamos la remodelación y el mobiliario como parte de una misma idea.</p></div><AboutFurniture /><a className="about-text-link about-furniture-link" href={siteUrl("/#coleccion")}>Explorar mobiliario <Arrow /></a></section>

      <section id="about-contigo" className="about-care about-section" aria-labelledby="about-care-title"><div className="about-section-top"><span>04 / CONTIGO EN LAS DECISIONES</span><span>UNA RELACIÓN QUE SE CONSTRUYE</span></div><div className="about-care-heading" data-about-reveal><h2 id="about-care-title">Claridad para tomar<br />cada decisión.</h2><p>Escuchar lo que necesitas. Entender el espacio. Conversar sobre el alcance de la transformación. Queremos que puedas comprender la propuesta, comparar posibilidades y elegir con criterio antes de comenzar.</p></div><AboutDecisionTabs /><p className="about-care-signature">Así entendemos una relación de confianza.</p><Arch className="about-thread-arch" /></section>

      <section id="about-proyecto" className="about-project about-section" aria-labelledby="about-project-title"><div className="about-section-top"><span>05 / TU PRÓXIMA CASA</span><span>BUCARAMANGA, SANTANDER</span></div><div className="about-project-grid"><div data-about-reveal><h2 id="about-project-title">Tu próxima casa<br />puede ser la<br />que ya tienes.</h2><p>Estamos en Bucaramanga. Cuéntanos qué espacio quieres transformar y qué imaginas para él.</p><a className="about-text-link" href={siteUrl("/#servicios")}>Conocer nuestros servicios <Arrow /></a></div><AboutProjectBrief /></div></section>
    </main>

    <footer className="about-footer"><a href={siteUrl("/")} aria-label="Nu Casa, volver a Inicio"><span className="brand-logo brand-wordmark about-footer-brand" role="img" aria-label="nu casa" /></a><div className="about-footer-bottom"><p>© {new Date().getFullYear()} NU CASA · REMODELACIONES<br /><span>Omar Gonzalez · Identificación: 1098623128</span></p><div className="about-footer-contact"><a href="mailto:nucasa@gmail.com">nucasa@gmail.com</a><a href="tel:+573213078837">321 307 8837</a><span>Carrera 29 #30-39 · La Aurora, Bucaramanga</span></div><div className="about-footer-links"><a href={siteUrl("/legal/privacidad/")}>Privacidad y datos</a><a href={siteUrl("/legal/cookies/")}>Cookies</a><a href={siteUrl("/legal/terminos/")}>Términos de uso</a><SitePrivacy triggerClassName="about-privacy-trigger" /></div></div></footer>

    <dialog className="mobile-menu" id="about-mobile-nav" ref={menu} onCancel={() => setMenuOpen(false)} onClose={() => setMenuOpen(false)} aria-label="Menú de navegación"><div className="dialog-top"><span className="brand-logo" role="img" aria-label="nu casa" /><button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>×</button></div><nav>{[{ href: siteUrl("/"), label: "Inicio" }, { href: "#about-inicio", label: "Quiénes somos" }, { href: siteUrl("/#servicios"), label: "Servicios" }, { href: siteUrl("/#coleccion"), label: "Tienda" }, { href: siteUrl("/#transformacion"), label: "Transformaciones" }, { href: siteUrl("/#contacto"), label: "Contacto" }].map((link, i) => <a key={link.label} href={link.href} aria-current={i === 1 ? "page" : undefined} onClick={() => setMenuOpen(false)}><span>0{i + 1}</span>{link.label}<Arrow /></a>)}</nav><p>Bucaramanga, Colombia<br /><a href="tel:+573213078837">321 307 8837</a></p></dialog>
  </div>;
}
