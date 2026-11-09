"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { Mobiliario3DProps } from "./Mobiliario3D";
import styles from "./mobiliario-3d.module.css";

/** Keep the entire 3D runtime outside the initial page's static import graph. */
export default function DeferredMobiliario3D(props: Mobiliario3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [Viewer, setViewer] = useState<ComponentType<Mobiliario3DProps> | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!host.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearViewport(true);
      observer.disconnect();
    }, { rootMargin: "1200px 0px", threshold: 0 });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport) return;
    let mounted = true;
    setFailed(false);
    void import("./Mobiliario3D").then((module) => {
      if (mounted) setViewer(() => module.default);
    }).catch(() => {
      if (mounted) setFailed(true);
    });
    return () => { mounted = false; };
  }, [nearViewport, attempt]);

  return <div ref={host}>
    {Viewer ? <Viewer {...props} /> : <section
      className={[styles.explorer, props.className].filter(Boolean).join(" ")}
      aria-label="Visualización 3D de mobiliario"
      aria-busy={nearViewport && !failed}
    >
      <div className={styles.heading}><h3>Explorador 3D</h3><span aria-hidden="true">Interactivo</span></div>
      <div className={styles.stage}>
        <div className={styles.notice} role={failed ? "alert" : "status"}>
          {!failed && <span className={styles.loadingMark} aria-hidden="true" />}
          <p>{failed ? "No pudimos cargar el visor 3D. Puedes volver a intentarlo." : nearViewport ? "Preparando el visor 3D…" : "El modelo se activa al entrar en pantalla."}</p>
          {failed && <button type="button" className={styles.retry} onClick={() => setAttempt((value) => value + 1)}>Volver a cargar</button>}
        </div>
      </div>
      <p className={styles.caption}>Pieza de referencia · Visualización 3D.</p>
    </section>}
  </div>;
}
