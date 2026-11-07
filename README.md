# nu casa — Remodelaciones

Página de inicio para Nu Casa, Bucaramanga. Incluye un recorrido arquitectónico fotorrealista controlado con el scroll, cuatro servicios desplegables, comparador conceptual, sofá en L interactivo, catálogo visual con seis categorías y contacto.

## Desarrollo

Node 24 recomendado; dependencias fijadas en package-lock.json. La web se compila como archivos estáticos para GitHub Pages, sin servidor de aplicaciones.

    npm ci
    npm run dev
    npm run build
    npm run preview

La implementación usa React, Vite, GSAP/ScrollTrigger, Three.js y React Three Fiber. El destino principal es GitHub Pages. El código anterior de Vinext/Sites se conserva como integración heredada y no interviene en `dev`, `build` ni `preview`.

## GitHub Pages

Repositorio: https://github.com/Samuelacuna12/NUCASA-REMODELACIONES

`npm run build` genera `out/`: inicio prerenderizado, tres documentos legales completos, archivos optimizados, `.nojekyll`, robots y sitemap. Los originales de stock y los archivos de trabajo no forman parte de esta salida.

La base es `/NUCASA-REMODELACIONES/`. Para otro repositorio o un dominio propio se puede cambiar `PAGES_BASE_PATH` y, cuando corresponda, `PAGES_ORIGIN` al compilar. Cliente y prerenderizado usan la misma configuración de Vite para que medios, estilos, enlaces e hidratación coincidan.

La rama `main` contiene las fuentes. La rama `gh-pages` contiene solamente el contenido compilado de `out/`. En Settings → Pages, el origen de publicación debe ser `gh-pages` y la carpeta `/ (root)`. Una actualización de las fuentes requiere volver a compilar y actualizar esa rama.

Dirección prevista una vez activada la publicación: https://samuelacuna12.github.io/NUCASA-REMODELACIONES/

La activación de Pages depende de la visibilidad del repositorio y del plan de GitHub. La existencia del repositorio o de la rama compilada no significa que la dirección ya esté publicada.

## Contenido y recursos

- app/HomeExperience.tsx: página de inicio e interacciones.
- app/nucasa.css: identidad visual y adaptación responsive.
- components/DeferredMobiliario3D.tsx: difiere la descarga y evaluación de todo el visor hasta acercarse a la sección.
- components/Mobiliario3D.tsx: GLB, iluminación, acabado fijo, controles de vista y carga al entrar en pantalla.
- components/PhotorealWalkthrough.tsx: video de interior licenciado, poster inmediato y búsquedas de tiempo agrupadas. El navegador decodifica el video nativamente; el scroll controla su posición.
- components/CatalogoMobiliario.tsx: filtros de categorías, fotografías y detalles ampliables dentro de la página.
- pages/entry-client.tsx: hidratación de la página de inicio.
- pages/entry-server.tsx y pages/LegalStatic.tsx: prerenderizado del inicio y los documentos legales completos.
- scripts/build-pages.mjs y vite.pages.config.ts: compilación estática para el subdirectorio del repositorio.
- app/legal/[slug]/page.tsx: ruta de la integración heredada.
- content/legal.json: datos reales del responsable y textos de privacidad, cookies y términos.
- content/estructura-web.json: arquitectura de la futura web multipágina.
- public/brand: SVG oficiales con currentColor.
- public/fonts: Manrope local y licencia OFL.
- public/media: derivados optimizados para esta página.

Los originales descargados y su manifiesto de procedencia permanecen fuera del sitio, en la carpeta hermana articulos. No se publican los ZIP originales ni se ofrecen recursos de stock para descarga.

El recorrido y las fotografías son ambientes de referencia, no obras ejecutadas por Nu Casa. El comparador está rotulado como visualización conceptual con IA. Las obras y los clientes reales se añadirán con su material y autorización. El catálogo contiene diseños de referencia; los materiales, las medidas y la disponibilidad comercial se definen al cotizar.

## Criterios de interacción

La apertura usa una secuencia de interior de stock para conservar la luz, los materiales y el acabado fotográfico. Un lector nativo de desplazamiento controla el recorrido; GSAP anima las secciones editoriales por separado. El scroll solicita posiciones del video con una sola búsqueda en curso y conserva el último destino. Los MP4 tienen inicio rápido y fotogramas clave cada 0,32 s. El explorador de mobiliario sí muestra geometría GLB en tiempo real, con giro por arrastre o teclado.

Se aplicaron las guías instaladas de GSAP/ScrollTrigger, React Three Fiber, composición responsive y movimiento. La preferencia de movimiento reducido se escucha también durante la sesión. Las búsquedas y el render se suspenden cuando están fuera de pantalla; los diálogos mantienen el foco y las categorías muestran imágenes antes de ofrecer contacto.

## Privacidad

Esta versión no integra analítica, publicidad, mapas incrustados, chat externo ni formularios que almacenen datos. WhatsApp, correo, teléfono y mapa se abren por acción del visitante.

La elección de privacidad se guarda con versión y caducidad de 180 días. Las categorías opcionales permanecen en false porque no hay proveedores activos. Añadir un proveedor exige actualizar política, inventario y versión, y solicitar una nueva elección antes de cargarlo.

Responsable: Omar Gonzalez; identificación 1098623128. Correo: nucasa@gmail.com. Dirección: Carrera 29 #30-39, barrio La Aurora, Bucaramanga. Teléfono: +57 321 307 8837.

La tienda, carrito, pagos y contratos electrónicos no se han habilitado en esta primera fase. Antes de incorporarlos se debe confirmar RUT/NIT y completar las condiciones comerciales correspondientes. Los documentos actuales cubren el inicio informativo y el contacto.

La pieza de Envato se utiliza como exhibición interactiva, sin personalización de un producto a pedido, exportación ni descarga del modelo en la interfaz. Para un configurador comercial se emplearán modelos propios o con derechos específicos.

