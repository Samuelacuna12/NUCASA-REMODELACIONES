# nu casa — Remodelaciones

Sitio informativo de Nu Casa, Bucaramanga, con Inicio y Quiénes somos como páginas independientes. Inicio incluye un recorrido arquitectónico fotorrealista controlado con el scroll, cuatro servicios desplegables, comparador conceptual, sofá en L interactivo, catálogo visual con seis categorías y contacto.

## Desarrollo

Node 24 recomendado; dependencias fijadas en package-lock.json. La web se compila como archivos estáticos para GitHub Pages, sin servidor de aplicaciones.

    npm ci
    npm run dev
    npm run build
    npm run preview

La implementación usa React, Vite, GSAP/ScrollTrigger, Three.js y React Three Fiber. El destino principal es GitHub Pages. El código anterior de Vinext/Sites se conserva como integración heredada y no interviene en `dev`, `build` ni `preview`.

## GitHub Pages

Repositorio: https://github.com/Samuelacuna12/NUCASA-REMODELACIONES

`npm run build` genera `out/`: Inicio y Quiénes somos prerenderizados, tres documentos legales completos, archivos optimizados, `.nojekyll`, robots y sitemap con cinco URLs. Los originales de stock y los archivos de trabajo no forman parte de esta salida.

La base es `/NUCASA-REMODELACIONES/`. Para otro repositorio o un dominio propio se puede cambiar `PAGES_BASE_PATH` y, cuando corresponda, `PAGES_ORIGIN` al compilar. Cliente y prerenderizado usan la misma configuración de Vite para que medios, estilos, enlaces e hidratación coincidan.

La rama `main` contiene las fuentes. La rama `gh-pages` contiene solamente el contenido compilado de `out/`. En Settings → Pages, el origen de publicación debe ser `gh-pages` y la carpeta `/ (root)`. Una actualización de las fuentes requiere volver a compilar y actualizar esa rama.

Dirección prevista una vez activada la publicación: https://samuelacuna12.github.io/NUCASA-REMODELACIONES/

La activación de Pages depende de la visibilidad del repositorio y del plan de GitHub. La existencia del repositorio o de la rama compilada no significa que la dirección ya esté publicada.

## Quiénes somos

La ruta `/quienes-somos/` se publica como un archivo físico en `out/quienes-somos/index.html`, bajo la misma base del repositorio. Se accede desde la navegación de escritorio y móvil de Inicio y desde el enlace «Conoce nuestra mirada» de su sección editorial.

La página contiene seis secciones:

1. **Nuestra mirada:** apertura «Cada decisión se vive», fotografía de referencia y navegación por capítulos.
2. **El origen:** exploración conceptual de idea, materiales y transformación, con controles de etapas y muestras de material.
3. **Nuestro criterio:** distribución, materiales y detalles; permite cambiar el encuadre de un mismo ambiente y explorar puntos de interés.
4. **Espacios y piezas:** el sofá en L interactivo incorpora anotaciones sobre configuración, proporción y acabado. No configura ni personaliza un producto.
5. **Contigo:** paneles de alcance, materiales y ejecución para explicar cómo se conversa sobre las decisiones del proyecto.
6. **Tu próxima casa:** selección del espacio y nota opcional para preparar una consulta en WhatsApp. El visitante confirma el envío en WhatsApp.

Inicio y Quiénes somos tienen entradas de cliente separadas: ninguna importa el módulo de la otra página. Comparten React, utilidades y estilos base; About añade su propia hoja de estilos. El visor 3D sigue cargándose al acercarse a él. La entrada de servidor reúne ambas páginas únicamente para prerenderizarlas durante la compilación.

El HTML de cada página incluye su contenido, canonical, Open Graph y precargas de imagen correspondientes. Las tres páginas legales son HTML completos sin JavaScript ni precargas de módulos o imágenes. La preferencia de movimiento reducido y el consentimiento de privacidad se mantienen entre páginas.

## Contenido y recursos

- app/HomeExperience.tsx: página de inicio e interacciones.
- app/AboutExperience.tsx y app/about.css: Quiénes somos, sus seis secciones y adaptación responsive.
- app/nucasa.css: identidad visual y adaptación responsive.
- components/DeferredMobiliario3D.tsx: difiere la descarga y evaluación de todo el visor hasta acercarse a la sección.
- components/Mobiliario3D.tsx: GLB, iluminación, acabado fijo, controles de vista y carga al entrar en pantalla.
- components/PhotorealWalkthrough.tsx: video de interior licenciado, poster inmediato y búsquedas de tiempo agrupadas. El navegador decodifica el video nativamente; el scroll controla su posición.
- components/CatalogoMobiliario.tsx: filtros de categorías, fotografías y detalles ampliables dentro de la página.
- components/AboutFurniture.tsx y components/about-furniture.module.css: anotaciones editoriales sobre el modelo de referencia de Quiénes somos.
- components/SitePrivacy.tsx: banner y diálogo de privacidad de Quiénes somos, con el mismo registro y caducidad que Inicio.
- pages/entry-client.tsx: hidratación de la página de inicio.
- pages/about-client.tsx: hidratación independiente de Quiénes somos.
- pages/entry-server.tsx y pages/LegalStatic.tsx: prerenderizado de Inicio, Quiénes somos y los documentos legales completos.
- quienes-somos/index.html: plantilla de la nueva ruta, con precargas de hero para escritorio y móvil.
- scripts/build-pages.mjs y vite.pages.config.ts: compilación estática para el subdirectorio del repositorio.
- app/legal/[slug]/page.tsx: ruta de la integración heredada.
- content/legal.json: datos reales del responsable y textos de privacidad, cookies y términos.
- content/estructura-web.json: arquitectura prevista para la ampliación de la web.
- public/brand: SVG oficiales con currentColor.
- public/fonts: Manrope local y licencia OFL.
- public/media: derivados optimizados para ambas páginas; public/media/about contiene los ambientes y muestras de Quiénes somos.

Los originales descargados y su manifiesto de procedencia permanecen fuera del sitio, en la carpeta hermana articulos. No se publican los ZIP originales ni se ofrecen recursos de stock para descarga.

El recorrido y las fotografías son ambientes de referencia, no obras ejecutadas por Nu Casa. El comparador está rotulado como visualización conceptual con IA. Las obras y los clientes reales se añadirán con su material y autorización. El catálogo contiene diseños de referencia; los materiales, las medidas y la disponibilidad comercial se definen al cotizar.

## Rendimiento: revisión del 9 de noviembre de 2026

Los archivos servidos por GitHub ya tenían compresión, caché y soporte de rangos. El problema principal de transferencia estaba en los recursos de varios megabytes; el scroll también programaba búsquedas y escrituras de diagnóstico redundantes.

| Recurso activo | Antes | Ahora |
| --- | ---: | ---: |
| Recorrido escritorio | 5.314.357 B | 2.632.627 B |
| Recorrido móvil | 3.831.120 B | 1.791.831 B |
| Modelo del sofá | 5.979.552 B | 1.798.836 B |
| Fuente Manrope | 164.700 B | 30.712 B |
| Poster escritorio | 170.011 B | 50.478 B |
| Poster móvil | 117.804 B | 38.316 B |

Los videos conservan los 480 cuadros, 25 fps, 19,2 s, H.264 sin B-frames, metadatos al inicio y keyframes cada 0,32 s. El escritorio usa 1280×720 y el móvil 540×960; las variantes reducen los píxeles que el navegador debe decodificar. SSIM frente al original reducido: 0,9762 y 0,9728. Hay un leve suavizado de textura fina; el recorrido y el encuadre se mantienen.

El GLB conserva la forma y los 95.488 triángulos. La geometría se reordena y comprime con Meshopt sin pérdida: posiciones, normales y UV coinciden exactamente tras decodificar. El decoder se incluye localmente con el visor (aproximadamente 8 KB gzip), sin solicitudes a un CDN externo. El modelo pasa de 5,38 MB a 1,61 MB con gzip. Las texturas pasan de tres PNG 2048 a albedo JPEG 1024, ORM PNG 1024 y normal PNG 1×1: esta última era completamente uniforme, por lo que conserva exactamente el mismo valor. La memoria estimada de texturas RGBA con mipmaps pasa de 64 a 10,67 MiB.

Las fotografías usan WebP y variantes de 640/1280 píxeles a través de `lib/responsive-image.ts`. La fuente se distribuye en WOFF2 con caracteres latinos, acentos y signos. El poster y la fuente se descubren desde el HTML; los documentos legales no precargan los posters.

El recorrido agrupa el scroll en un RAF, conserva la geometría entre cambios de tamaño y solo solicita un cuadro nuevo cuando corresponde. El motor mantiene una búsqueda en curso, los reintentos acotados y la recuperación de WebKit. GSAP se descarga cerca de las secciones editoriales, sin bloquear el recorrido inicial. El visor 3D prepara sus recursos antes de entrar en pantalla y detiene el render al alejarse o esconder la pestaña.

React y los módulos compartidos del visor se separan del código de la página. Dos compilaciones con cambios en el CSS global conservan idénticos los archivos de React, Three, R3F y GLTF, permitiendo reutilizar su caché. Las fotos de servicios conservan su proporción 4:5 incluso antes de descargarse y al cambiar de categoría.

Los diagnósticos de video y 3D se habilitan con `?rendimiento=1`; la visita normal no escribe contadores por cuadro. Los archivos anteriores se conservan una versión para que los clientes con HTML/JS en caché sigan funcionando: su presencia en `public/` no implica que la versión nueva los descargue.

Las reducciones de bytes y memoria no equivalen a un porcentaje universal de mejora en segundos o FPS. El resultado también depende del dispositivo y la conexión.

## Criterios de interacción

La apertura usa una secuencia de interior de stock para conservar la luz, los materiales y el acabado fotográfico. Un lector nativo de desplazamiento controla el recorrido; GSAP anima las secciones editoriales por separado. El scroll solicita posiciones del video con una sola búsqueda en curso y conserva el último destino. Los MP4 tienen inicio rápido y fotogramas clave cada 0,32 s. El explorador de mobiliario sí muestra geometría GLB en tiempo real, con giro por arrastre o teclado.

Se aplicaron las guías instaladas de GSAP/ScrollTrigger, React Three Fiber, composición responsive y movimiento. La preferencia de movimiento reducido se escucha también durante la sesión. Las búsquedas y el render se suspenden cuando están fuera de pantalla; los diálogos mantienen el foco y las categorías muestran imágenes antes de ofrecer contacto.

## Privacidad

Esta versión no integra analítica, publicidad, mapas incrustados, chat externo ni formularios que almacenen datos. WhatsApp, correo, teléfono y mapa se abren por acción del visitante.

La elección de privacidad se guarda con versión y caducidad de 180 días. Las categorías opcionales permanecen en false porque no hay proveedores activos. Añadir un proveedor exige actualizar política, inventario y versión, y solicitar una nueva elección antes de cargarlo.

Responsable: Omar Gonzalez; identificación 1098623128. Correo: nucasa@gmail.com. Dirección: Carrera 29 #30-39, barrio La Aurora, Bucaramanga. Teléfono: +57 321 307 8837.

La tienda, carrito, pagos y contratos electrónicos no se han habilitado en esta primera fase. Antes de incorporarlos se debe confirmar RUT/NIT y completar las condiciones comerciales correspondientes. Los documentos actuales cubren las páginas informativas y el contacto.

La pieza de Envato se utiliza como exhibición interactiva, sin personalización de un producto a pedido, exportación ni descarga del modelo en la interfaz. Para un configurador comercial se emplearán modelos propios o con derechos específicos.

