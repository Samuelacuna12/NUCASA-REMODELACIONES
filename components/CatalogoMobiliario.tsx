"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { responsiveImage } from "@/lib/responsive-image";
import styles from "./catalogo-mobiliario.module.css";

export type CategoriaMobiliario =
  | "cocinas"
  | "muebles-tv"
  | "lamparas"
  | "sillas"
  | "comedores"
  | "muebles-l";

export type CatalogoMobiliarioProps = {
  initialCategory?: CategoriaMobiliario;
  /** Optional inventory of local URLs. Omit to try the twelve configured photos. */
  availableImages?: readonly string[];
  className?: string;
};

type Category = {
  id: CategoriaMobiliario;
  label: string;
  file: string;
  description: string;
  materials: readonly string[];
  style: string;
};

type Reference = {
  id: string;
  name: string;
  image: string;
  category: Category;
};

const categories: readonly Category[] = [
  {
    id: "cocinas",
    label: "Mobiliario de cocina",
    file: "cocina",
    description: "Una referencia para conversar sobre distribución, almacenamiento y la relación entre superficies y mobiliario.",
    materials: ["Madera o acabados de apariencia natural", "Superficies minerales y detalles metálicos"],
    style: "Líneas claras, superficies continuas y una composición que acompañe el uso diario.",
  },
  {
    id: "muebles-tv",
    label: "Muebles de TV",
    file: "tv",
    description: "Ideas para integrar el televisor, organizar objetos y dar continuidad a la zona social.",
    materials: ["Madera y superficies de acabado mate", "Paneles y detalles de apariencia mineral"],
    style: "Composiciones equilibradas que combinan espacios abiertos y almacenamiento cerrado.",
  },
  {
    id: "lamparas",
    label: "Lámparas",
    file: "lampara",
    description: "Una referencia para explorar cómo la forma de una lámpara y su luz pueden acompañar un espacio.",
    materials: ["Metal y acabados de apariencia cálida", "Vidrio, fibras o difusores según la pieza"],
    style: "Formas escultóricas y una presencia medida dentro del ambiente.",
  },
  {
    id: "sillas",
    label: "Sillas",
    file: "silla",
    description: "Referencias para conversar sobre forma, comodidad y la relación entre una silla y el resto del mobiliario.",
    materials: ["Madera o estructuras metálicas", "Tapizados y texturas según el proyecto"],
    style: "Siluetas definidas y proporciones que dialogan con el espacio.",
  },
  {
    id: "comedores",
    label: "Comedores",
    file: "comedor",
    description: "Una mirada a la mesa, las sillas y el ambiente que construyen juntas las piezas de un comedor.",
    materials: ["Madera y superficies de apariencia mineral", "Tapizados y detalles metálicos"],
    style: "Composiciones pensadas para reunir, con una relación clara entre mesa, asientos y luz.",
  },
  {
    id: "muebles-l",
    label: "Muebles en L",
    file: "mueble-l",
    description: "Una referencia para explorar cómo un sofá en L puede ordenar la zona social e invitar a compartir.",
    materials: ["Tapizados de textura suave", "Estructuras y acabados por definir para el proyecto"],
    style: "Volúmenes envolventes y una configuración que aproveche la esquina del ambiente.",
  },
];

function referencesFor(category: Category): Reference[] {
  return [1, 2].map((number) => ({
    id: category.file + "-" + number,
    name: category.label + " · Referencia 0" + number,
    image: "/media/catalogo/" + category.file + "-" + number + ".jpg",
    category,
  }));
}

function Arrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** A visual reference catalogue: category buttons never start an external conversation. */
export default function CatalogoMobiliario({
  initialCategory = "cocinas",
  availableImages,
  className = "",
}: CatalogoMobiliarioProps) {
  const galleryId = useId();
  const headingId = useId();
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const focusContactRef = useRef(false);
  const [activeCategory, setActiveCategory] = useState<CategoriaMobiliario>(initialCategory);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [detailImageFailed, setDetailImageFailed] = useState(false);

  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const configuredReferences = referencesFor(category).filter(
    (item) => !availableImages || availableImages.includes(item.image),
  );
  const visibleReferences = configuredReferences.filter(
    (item) => !failedImages.includes(item.image),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedReference || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedReference]);

  function openReference(reference: Reference, event: MouseEvent<HTMLButtonElement>) {
    focusContactRef.current = false;
    openerRef.current = event.currentTarget;
    setDetailImageFailed(false);
    setSelectedReference(reference);
  }

  function closeReference() {
    dialogRef.current?.close();
    setSelectedReference(null);
  }

  function onDialogClosed() {
    setSelectedReference(null);
    if (focusContactRef.current) {
      focusContactRef.current = false;
      document.getElementById("contacto")?.focus({ preventScroll: true });
    } else openerRef.current?.focus({ preventScroll: true });
  }

  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) closeReference();
  }

  function markImageFailed(image: string) {
    setFailedImages((current) => current.includes(image) ? current : [...current, image]);
  }

  function retryImages() {
    const currentImages = configuredReferences.map((item) => item.image);
    setFailedImages((current) => current.filter((image) => !currentImages.includes(image)));
  }

  return (
    <section className={[styles.catalog, className].filter(Boolean).join(" ")} aria-labelledby={headingId}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>MOBILIARIO & OBJETOS</p>
          <h3 id={headingId}>Piezas para tu espacio.</h3>
        </div>
        <p>Explora una categoría y abre las imágenes para verlas con más detalle.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.filterColumn}>
          <nav className={styles.filters} aria-label="Categorías de mobiliario">
            {categories.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={styles.categoryButton}
                aria-pressed={item.id === category.id}
                aria-controls={galleryId}
                onClick={() => setActiveCategory(item.id)}
              >
                <span className={styles.categoryIndex} aria-hidden="true">0{index + 1}</span>
                <span>{item.label}</span>
                <span className={styles.categoryArrow} aria-hidden="true">↗</span>
              </button>
            ))}
          </nav>
          <p className={styles.filterHint}>Desliza para ver las categorías <span aria-hidden="true">→</span></p>
        </div>

        <div className={styles.galleryColumn} id={galleryId}>
          <div className={styles.galleryHeading}>
            <h4>{category.label}</h4>
            <span>{String(visibleReferences.length).padStart(2, "0")} {visibleReferences.length === 1 ? "referencia" : "referencias"}</span>
          </div>
          <p className={styles.screenReader} role="status" aria-live="polite" aria-atomic="true">
            {category.label}: {visibleReferences.length} {visibleReferences.length === 1 ? "referencia visible" : "referencias visibles"}.
          </p>

          {visibleReferences.length > 0 ? (
            <div className={styles.gallery} data-count={visibleReferences.length}>
              {visibleReferences.map((reference) => (
                <button
                  key={reference.id}
                  type="button"
                  className={styles.referenceButton}
                  onClick={(event) => openReference(reference, event)}
                  aria-label={"Ampliar " + reference.name.toLowerCase()}
                  aria-haspopup="dialog"
                >
                  <span className={styles.photoFrame}>
                    <img
                      {...responsiveImage(reference.image, "(max-width: 800px) calc(100vw - 40px), (max-width: 1100px) 65vw, 70vw")}
                      alt={"Imagen de referencia para " + reference.category.label.toLowerCase()}
                      loading="lazy"
                      onError={() => markImageFailed(reference.image)}
                    />
                    <span className={styles.photoAction} aria-hidden="true"><Arrow /></span>
                  </span>
                  <span className={styles.referenceCaption}>
                    <span>
                      <span className={styles.referenceLabel}>Referencia de diseño</span>
                      <span className={styles.referenceName}>{reference.name}</span>
                    </span>
                    <span className={styles.openLabel} aria-hidden="true">Ver detalle</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No pudimos cargar las imágenes de esta categoría.</p>
              <button type="button" onClick={retryImages}>Volver a intentar <span aria-hidden="true">↻</span></button>
            </div>
          )}

          <p className={styles.referenceNotice}>
            Diseños de referencia. Definimos materiales, medidas y acabados para tu proyecto.
          </p>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.detailDialog}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        onClose={onDialogClosed}
        onCancel={closeReference}
        onClick={onBackdropClick}
      >
        {selectedReference && (
          <>
            <button type="button" className={styles.closeButton} onClick={closeReference} aria-label="Cerrar detalle de la referencia" autoFocus>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            <div className={styles.detailLayout}>
              <div className={styles.detailImage}>
                {detailImageFailed ? (
                  <div className={styles.detailError}>
                    <p>No pudimos cargar la imagen ampliada.</p>
                    <button type="button" onClick={() => setDetailImageFailed(false)}>Volver a intentar</button>
                  </div>
                ) : (
                  <img {...responsiveImage(selectedReference.image, "(max-width: 800px) calc(100vw - 40px), 60vw")} alt={selectedReference.name} onError={() => setDetailImageFailed(true)} />
                )}
              </div>
              <div className={styles.detailBody}>
                <p className={styles.eyebrow}>REFERENCIA DE DISEÑO</p>
                <h3 id={dialogTitleId}>{selectedReference.name}</h3>
                <p id={dialogDescriptionId} className={styles.detailDescription}>{selectedReference.category.description}</p>
                <div className={styles.detailSection}>
                  <h4>Materiales a explorar</h4>
                  <ul>{selectedReference.category.materials.map((material) => <li key={material}>{material}</li>)}</ul>
                </div>
                <div className={styles.detailSection}>
                  <h4>Orientación de estilo</h4>
                  <p>{selectedReference.category.style}</p>
                </div>
                <p className={styles.detailNotice}>
                  Referencia visual. Los materiales, las medidas y los acabados se definen al cotizar tu proyecto.
                </p>
                <a className={styles.consultLink} href="#contacto" onClick={() => { focusContactRef.current = true; closeReference(); }}>
                  Consultar esta pieza <Arrow />
                </a>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}

