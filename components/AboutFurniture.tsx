"use client";

import { useId, useState } from "react";
import DeferredMobiliario3D from "./DeferredMobiliario3D";
import { siteUrl } from "../lib/site-url";
import styles from "./about-furniture.module.css";

const DETAILS = [
  {
    id: "configuration",
    number: "01",
    label: "Configuración en L",
    title: "Una forma de reunir.",
    text: "Dos direcciones de asiento que ayudan a imaginar un lugar para compartir. La distribución se define a partir del espacio y de cómo quieres habitarlo.",
    line: "M 145 245 H 245 L 345 300",
    point: [345, 300],
  },
  {
    id: "proportion",
    number: "02",
    label: "Proporción",
    title: "El espacio también cuenta.",
    text: "Gira la pieza y observa la relación entre el asiento, el respaldo y la extensión. Las dimensiones y el espacio de circulación se estudian para cada ambiente.",
    line: "M 855 375 H 755 L 655 330",
    point: [655, 330],
  },
  {
    id: "finish",
    number: "03",
    label: "Acabado",
    title: "La textura da carácter.",
    text: "La tapicería y el tono de esta pieza muestran una posibilidad visual. Los materiales y acabados de cada proyecto se conversan según la intención del espacio.",
    line: "M 855 165 H 740 L 600 255",
    point: [600, 255],
  },
] as const;

type DetailId = typeof DETAILS[number]["id"];

/** Adds editorial annotations to the existing reference model, without configuring it. */
export default function AboutFurniture() {
  const panelId = useId();
  const instructionId = useId();
  const [selected, setSelected] = useState<DetailId>("configuration");
  const detail = DETAILS.find((item) => item.id === selected) ?? DETAILS[0];

  return <div className={styles.module}>
    <div className={styles.viewerSurface}>
      <div className={styles.viewer}>
        <DeferredMobiliario3D modelUrl={siteUrl("/media/sofa-l-meshopt.glb")} />
      </div>

      <svg className={styles.connections} viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {DETAILS.map((item) => <g key={item.id} className={selected === item.id ? styles.activeConnection : styles.connection}>
          <path d={item.line} />
          <circle cx={item.point[0]} cy={item.point[1]} r="3" />
        </g>)}
      </svg>

      <div className={styles.hotspots} role="group" aria-label="Detalles de la pieza de referencia" aria-describedby={instructionId}>
        {DETAILS.map((item) => <button
          key={item.id}
          type="button"
          className={`${styles.hotspot} ${styles[item.id]}`}
          aria-pressed={selected === item.id}
          aria-controls={panelId}
          onClick={() => setSelected(item.id)}
        >
          <span className={styles.marker} aria-hidden="true">{item.number}</span>
          <span className={styles.hotspotLabel}>{item.label}</span>
        </button>)}
      </div>
    </div>

    <aside className={styles.details}>
      <p id={instructionId} className={styles.instruction}>Selecciona un detalle</p>
      <div id={panelId} className={styles.panel} role="status" aria-live="polite" aria-atomic="true">
        <p className={styles.detailLabel}><span>{detail.number}</span> / {detail.label}</p>
        <h3 className={styles.title}>{detail.title}</h3>
        <p className={styles.description}>{detail.text}</p>
      </div>
      <p className={styles.referenceNote}>Pieza de referencia para explorar forma, volumen y textura.</p>
    </aside>
  </div>;
}
