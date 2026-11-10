export type Service = {
  id: "banos" | "cocinas" | "completas" | "obra-gris";
  slug: string;
  number: string;
  name: string;
  shortName: string;
  kicker: string;
  headline: string;
  intro: string;
  lead: string;
  hero: string;
  metaDescription: string;
  problems: { title: string; text: string }[];
  scope: { title: string; text: string; items: string[] }[];
  decisions: { title: string; text: string }[];
  transformations: {
    id: string;
    title: string;
    description: string;
    beforeLabel: string;
    afterLabel: string;
    changes: string[];
  }[];
  faqs: { q: string; a: string }[];
  briefOptions: string[];
  ctaTitle: string;
  ctaText: string;
};

export const SERVICES: Service[] = [
  {
    id: "banos",
    slug: "remodelaciones-de-bano",
    number: "01",
    name: "Remodelaciones de baño",
    shortName: "Baños",
    kicker: "BAÑOS · BUCARAMANGA",
    headline: "Más espacio. Un baño mejor resuelto.",
    intro: "Si el mueble no alcanza, la distribución resulta incómoda o los acabados necesitan un cambio, empecemos por resolver lo que hoy no funciona.",
    lead: "Reunimos diseño, renders, fabricación de mobiliario y ejecución. Definimos trabajos, materiales y suministros considerando qué quieres conservar y qué necesita cambiar en tu baño.",
    hero: "/media/servicios/bano-hero.webp",
    metaDescription: "Remodelación de baños en Bucaramanga con diseño, renders, mobiliario y ejecución. Define con Nu Casa el alcance, los acabados y tu forma de pago.",
    problems: [
      { title: "Todo termina sobre el lavamanos.", text: "Los objetos de uso diario necesitan un lugar. Revisamos el mobiliario y las posibilidades de almacenamiento según el espacio disponible." },
      { title: "Moverte exige esquivar piezas.", text: "La relación entre acceso, lavamanos, sanitario y ducha puede resultar incómoda. La distribución se estudia antes de decidir qué elementos reemplazar." },
      { title: "Quieres renovar sin decidir a ciegas.", text: "Elegir revestimientos, griferías y luz por separado dificulta imaginar el conjunto. El diseño y los renders ayudan a revisar esas decisiones." },
    ],
    scope: [
      { title: "Diseño y renders", text: "Damos forma a la distribución y a la propuesta visual para que puedas revisar el baño antes de ejecutar lo contratado.", items: ["Organización del espacio", "Propuesta de materiales e iluminación", "Visualización del ambiente"] },
      { title: "Preparación del espacio", text: "Definimos qué conservar y qué retirar. Demoliciones, preparación y manejo de residuos quedan descritos entre los trabajos contratados.", items: ["Elementos por conservar", "Retiros por realizar", "Preparación de superficies"] },
      { title: "Revisión de instalaciones", text: "Los puntos hidráulicos, desagües, conexiones eléctricas e impermeabilización se revisan según el estado del baño; las intervenciones necesarias se definen y cotizan.", items: ["Necesidades hidráulicas", "Puntos eléctricos e iluminación", "Tratamiento de zonas húmedas"] },
      { title: "Superficies y piezas", text: "Seleccionamos acabados y elementos en relación con el diseño. La propuesta debe precisar referencias, cantidades y quién suministra cada pieza.", items: ["Pisos y revestimientos", "Lavamanos y griferías", "Divisiones y accesorios acordados"] },
      { title: "Mobiliario y ejecución", text: "Fabricamos el mobiliario definido para el proyecto y ejecutamos los trabajos contratados. La entrega permite revisar el resultado frente al alcance acordado.", items: ["Mueble y almacenamiento", "Instalación de elementos contratados", "Revisión de terminaciones"] },
    ],
    decisions: [
      { title: "Qué superficies necesitas renovar", text: "Define si quieres cambiar piso, paredes o ambos. Los acabados se eligen considerando la zona de uso y los encuentros entre materiales." },
      { title: "Qué necesitas guardar", text: "Productos, toallas y elementos de aseo tienen tamaños distintos. Cuéntanos cuáles deben quedar a mano y cuáles prefieres fuera de vista." },
      { title: "Qué luz necesitas para usarlo", text: "El espejo, la ducha y la circulación tienen necesidades distintas. Revisamos dónde necesitas luz de uso y dónde buscas una iluminación más suave." },
    ],
    transformations: [
      { id: "bano-1", title: "Mueble suspendido y ducha con perfiles negros", description: "La misma distribución cambia de carácter: el mueble tradicional da paso a frentes oscuros de madera, un espejo con luz y una división de ducha de líneas negras.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Mueble suspendido con frentes de madera oscura","Espejo amplio con iluminación","Grifería y perfiles de ducha negros"] },
      { id: "bano-2", title: "Revestimiento continuo y grifería negra", description: "Los enchapes pequeños se sustituyen por una superficie de apariencia pétrea. El mueble flotante, la grifería negra y el nicho iluminado definen la nueva composición.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Revestimiento de apariencia pétrea y lectura continua","Mueble flotante con frentes de madera","Grifería negra y nicho iluminado"] },
    ],
    faqs: [
      { q: "¿Puedo ver el diseño antes de comenzar la obra?", a: "Sí. Ofrecemos diseño y renders para revisar la propuesta. El alcance de esa etapa y los entregables se especifican antes de contratar." },
      { q: "¿Es necesario cambiar todo el baño?", a: "Depende de lo que buscas y del estado del espacio. Indica qué quieres conservar para considerarlo al definir los trabajos y la cotización." },
      { q: "¿De qué depende el precio?", a: "Del tamaño, el estado actual, las intervenciones y los materiales elegidos. Fotografías y medidas aproximadas ayudan a iniciar la conversación; el valor corresponde a una propuesta definida." },
      { q: "¿Cuánto tiempo toma la remodelación?", a: "El calendario se acuerda según el alcance, las condiciones del inmueble y los suministros. Cuéntanos tu fecha deseada para revisar la viabilidad antes de comprometernos." },
      { q: "¿El trabajo tiene garantía?", a: "Sí. Las condiciones de garantía se establecen según el tipo de trabajo y se detallan en la propuesta, sin afectar los derechos que te correspondan como consumidor." },
      { q: "¿Tienen facilidades de pago?", a: "Sí. Consulta las opciones disponibles para tu proyecto. Las condiciones y el calendario de pagos se acuerdan antes de aceptar la propuesta." },
    ],
    briefOptions: ["Renovar el baño completo", "Cambiar el mueble y el almacenamiento", "Revisar la distribución", "Renovar pisos y revestimientos", "Conservar algunas piezas", "Aún necesito definir el alcance"],
    ctaTitle: "Cuéntanos qué necesita cambiar en tu baño.",
    ctaText: "Comparte fotos, medidas aproximadas si las tienes y el sector de Bucaramanga donde está el inmueble. Indica también qué quieres conservar y cuándo te gustaría comenzar.",
  },
  {
    id: "cocinas",
    slug: "remodelaciones-de-cocina",
    number: "02",
    name: "Remodelaciones de cocina",
    shortName: "Cocinas",
    kicker: "COCINAS · BUCARAMANGA",
    headline: "Más mesón. Mejor almacenamiento.",
    intro: "¿El mesón se queda corto, los cajones no te sirven o abrir un electrodoméstico bloquea el paso? Tu nueva cocina debe empezar por esas necesidades.",
    lead: "Diseñamos tu cocina, la mostramos en renders, fabricamos el mobiliario y ejecutamos la remodelación. Distribución, mesones, almacenamiento e iluminación se definen juntos, con trabajos y suministros expresamente acordados.",
    hero: "/media/cocina.webp",
    metaDescription: "Remodelación de cocinas en Bucaramanga: diseño, renders, fabricación de mobiliario y ejecución. Consulta alcance, materiales, garantía y opciones de pago.",
    problems: [
      { title: "Preparar exige despejar primero.", text: "Pequeños electrodomésticos y utensilios ocupan la superficie de trabajo. Revisamos qué necesitas guardar y qué debe permanecer disponible para cocinar." },
      { title: "Los muebles tienen espacio, pero no te sirven.", text: "Profundidad, altura y acceso importan tanto como la cantidad de puertas. La organización del mobiliario parte de los objetos y hábitos reales." },
      { title: "El paso se cruza con todo.", text: "Puertas, cajones y electrodomésticos comparten un espacio limitado. Su relación con la zona de preparación y los asientos debe estudiarse desde el diseño." },
    ],
    scope: [
      { title: "Distribución y renders", text: "Estudiamos la relación entre almacenamiento, preparación y uso compartido. El diseño permite revisar ubicaciones y acabados antes de fabricar o ejecutar.", items: ["Organización de zonas de uso", "Ubicación del mobiliario", "Renders de la propuesta"] },
      { title: "Fabricación del mobiliario", text: "Fabricamos los muebles de tu cocina con materiales, organización interior, aperturas y herrajes definidos en la propuesta.", items: ["Muebles superiores e inferiores", "Distribución de cajones y puertas", "Soluciones de guardado acordadas"] },
      { title: "Mesones y superficies", text: "Relacionamos mesón, salpicadero y acabados con el conjunto. Se especifican los materiales elegidos y los trabajos necesarios para su instalación.", items: ["Superficies de preparación", "Encuentros y salpicaderos", "Acabados definidos en el diseño"] },
      { title: "Preparación e instalaciones", text: "Retiros y necesidades hidráulicas, eléctricas o de gas se revisan según el inmueble. Cualquier intervención técnica debe definirse expresamente en la propuesta.", items: ["Elementos que deben retirarse", "Puntos técnicos por revisar", "Condiciones para instalar equipos"] },
      { title: "Ejecución e instalación", text: "Ejecutamos el alcance contratado y montamos el mobiliario. La propuesta precisa suministros, conexiones y elementos cuya instalación esté contemplada.", items: ["Montaje del mobiliario", "Instalaciones expresamente contratadas", "Revisión de ajustes y terminaciones"] },
    ],
    decisions: [
      { title: "Dónde necesitas capacidad", text: "Vajilla, ollas, alimentos y equipos pequeños piden soluciones diferentes. Prioriza lo que más usas y lo que hoy cuesta guardar." },
      { title: "Dónde preparas y qué equipos usas", text: "La superficie de trabajo y los electrodomésticos deben relacionarse. Indica qué equipos conservarás, sus medidas y dónde necesitas más lugar para preparar." },
      { title: "Quién comparte la cocina", text: "Cuéntanos si cocinas a solas, si participan varias personas o si quieres asientos. Esas rutinas orientan el espacio de encuentro y circulación." },
    ],
    transformations: [
      { id: "cocina-1", title: "De muebles blancos a madera oscura y grafito", description: "La cocina en U mantiene su organización y cambia los frentes, el mesón y la iluminación. La madera oscura se combina con muebles altos en grafito y luz sobre la preparación.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Frentes de madera oscura y grafito","Mesón y salpicadero claros","Luz bajo los muebles superiores"] },
      { id: "cocina-2", title: "Isla con mesón claro y caída lateral", description: "La isla recibe un mesón claro con caída lateral. Los frentes de madera se relacionan con muebles altos oscuros, luminarias negras y una franja de luz sobre el mesón del fondo.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Mesón claro con caída en el lateral de la isla","Frentes de madera y muebles altos en grafito","Luminarias colgantes y luz sobre el mesón"] },
    ],
    faqs: [
      { q: "¿Fabrican el mobiliario de la cocina?", a: "Sí. Nu Casa ofrece fabricación de mobiliario. La propuesta define las piezas, materiales, herrajes y condiciones de instalación correspondientes a tu proyecto." },
      { q: "¿Puedo conservar mis electrodomésticos?", a: "Podemos considerarlos desde el diseño. Comparte modelos, medidas y cuáles deseas mantener para revisar su relación con la distribución y las instalaciones." },
      { q: "¿Puedo contratar solo el cambio de muebles?", a: "Puedes consultar por mobiliario o por una remodelación más amplia. Indicarlo desde el inicio permite definir los trabajos que realmente necesitas cotizar." },
      { q: "¿Los electrodomésticos están incluidos?", a: "No debe darse por incluido ningún suministro. La propuesta identifica qué aporta Nu Casa, qué suministras tú y qué instalaciones se contratan." },
      { q: "¿Qué garantía tiene la cocina?", a: "Las condiciones de garantía se detallan según el mobiliario, los suministros y los trabajos contratados. Se acuerdan sin afectar tus derechos como consumidor." },
      { q: "¿Puedo consultar facilidades de pago?", a: "Sí. Tenemos opciones de pago para consultar antes de contratar. Confirma las condiciones aplicables a tu proyecto y el calendario de pagos en la propuesta." },
    ],
    briefOptions: ["Remodelar la cocina completa", "Cambiar únicamente el mobiliario", "Ganar superficie de preparación", "Mejorar el almacenamiento", "Conservar mis electrodomésticos", "Revisar la distribución actual"],
    ctaTitle: "Dinos qué se queda corto en tu cocina.",
    ctaText: "Envíanos fotos y los cambios que más necesitas. Si tienes medidas o modelos de electrodomésticos, compártelos para conversar sobre una propuesta concreta en Bucaramanga.",
  },
  {
    id: "completas",
    slug: "remodelaciones-completas",
    number: "03",
    name: "Remodelaciones completas",
    shortName: "Remodelaciones completas",
    kicker: "ESPACIOS COMPLETOS · BUCARAMANGA",
    headline: "Toda tu casa. Un proyecto bien definido.",
    intro: "Cuando cocina, baños, sala y mobiliario necesitan cambios, las decisiones se afectan entre sí. Pensar el conjunto permite definir los trabajos y su relación entre ambientes.",
    lead: "Reunimos diseño, renders, fabricación de mobiliario y ejecución para varios ambientes. Tus prioridades y el inmueble existente orientan una propuesta con espacios, intervenciones, materiales y suministros expresamente definidos.",
    hero: "/media/servicios/completas-hero.webp",
    metaDescription: "Remodelaciones completas en Bucaramanga con diseño, renders, mobiliario y ejecución. Define ambientes, alcance de obra, materiales y facilidades de pago.",
    problems: [
      { title: "Cada ambiente pide una decisión distinta.", text: "Elegir pisos, muebles, iluminación y acabados por separado puede complicar el conjunto. El proyecto permite revisar sus relaciones antes de ejecutar." },
      { title: "No sabes hasta dónde conviene intervenir.", text: "Quizás necesitas cambiar varios espacios y conservar otros. Definir prioridades ayuda a distinguir lo necesario, lo deseado y lo que puede evaluarse después." },
      { title: "Te preocupa contratar una obra poco definida.", text: "Un nombre como remodelación completa no explica por sí solo lo incluido. La propuesta debe detallar los ambientes y los trabajos acordados." },
    ],
    scope: [
      { title: "Lectura del inmueble y prioridades", text: "Organizamos las necesidades por ambiente y revisamos qué quieres conservar. El punto de partida es el estado real de la vivienda y el alcance solicitado.", items: ["Ambientes por intervenir", "Necesidades de cada espacio", "Elementos existentes por conservar"] },
      { title: "Diseño y visualización del conjunto", text: "Desarrollamos diseño y renders para relacionar los ambientes. Distribución, acabados, iluminación y mobiliario se revisan dentro de la propuesta del proyecto.", items: ["Criterio común entre ambientes", "Selección de materiales y tonos", "Renders de espacios acordados"] },
      { title: "Definición de obra e instalaciones", text: "Identificamos retiros, preparaciones y necesidades técnicas. Las intervenciones hidráulicas, eléctricas u otras deben revisarse y describirse según las condiciones del inmueble.", items: ["Retiros expresamente definidos", "Preparación de superficies", "Intervenciones técnicas por acordar"] },
      { title: "Mobiliario para los ambientes", text: "Fabricamos las piezas contratadas con ubicación, configuración, materiales y condiciones de suministro e instalación definidos.", items: ["Mobiliario de cocina y baño", "Almacenamiento de otros espacios", "Piezas acordadas en la propuesta"] },
      { title: "Ejecución y revisión del alcance", text: "Ejecutamos los trabajos contratados según una secuencia acordada. Intervenciones y suministros determinan el calendario y las condiciones de entrega.", items: ["Secuencia de los trabajos", "Instalaciones y terminaciones contratadas", "Revisión del alcance ejecutado"] },
    ],
    decisions: [
      { title: "Qué debe cambiar primero", text: "Separa las necesidades de uso diario de las preferencias estéticas. Esto ayuda a ordenar prioridades al definir la propuesta y su alcance." },
      { title: "Qué permanecerá en la casa", text: "Muebles, electrodomésticos y acabados existentes influyen en las decisiones nuevas. Identifica lo que deseas conservar antes de revisar el conjunto." },
      { title: "Cómo se usará el inmueble durante la obra", text: "Cuéntanos si estará ocupado, vacío o pendiente de mudanza. Las condiciones de uso deben considerarse al conversar sobre la ejecución." },
    ],
    transformations: [
      { id: "integral-1", title: "Sofá en L, mueble de TV y luz indirecta", description: "La sala conserva la ventana y reorganiza sus piezas. El sofá en L se relaciona con un frente continuo de madera para el televisor, estantes y luz indirecta junto al techo.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Sofá en L y mesa de centro circular","Frente de TV integrado con estantes de madera","Luz indirecta en el encuentro con el techo"] },
      { id: "integral-2", title: "Sala y comedor con mobiliario y acabados coordinados", description: "La sala y el comedor comparten madera oscura, tapizados claros e iluminación definida por zonas. El mobiliario continuo junto al muro conecta visualmente ambos ambientes.", beforeLabel: "Situación ilustrativa", afterLabel: "Propuesta conceptual", changes: ["Mobiliario continuo entre sala y comedor","Madera oscura y tapizados claros en ambos ambientes","Luz integrada en muebles y luminaria sobre la mesa"] },
    ],
    faqs: [
      { q: "¿Qué significa remodelación completa?", a: "Es un proyecto que relaciona varios ambientes. No significa que cualquier trabajo esté incluido: la propuesta especifica los espacios, intervenciones y suministros contratados." },
      { q: "¿Se puede plantear por etapas?", a: "Puedes solicitar que se evalúe esa posibilidad. Su viabilidad depende de la relación entre trabajos, las condiciones del inmueble y la secuencia que se acuerde." },
      { q: "¿Incluye diseño y renders de todos los espacios?", a: "Ofrecemos diseño y renders. La propuesta precisa qué ambientes se desarrollan y qué entregables se contratan; no se asume una cantidad ilimitada de visualizaciones." },
      { q: "¿Podemos permanecer en la vivienda?", a: "Debe revisarse para tu caso. Comunica esa necesidad desde el inicio para considerar accesos, ambientes disponibles y condiciones durante los trabajos, sin asumir habitabilidad continua." },
      { q: "¿Cómo se define la garantía?", a: "Las condiciones se establecen según los trabajos y elementos contratados, se detallan en la propuesta y no afectan los derechos que correspondan al consumidor." },
      { q: "¿Tienen facilidades de pago para una obra completa?", a: "Sí. Consulta las opciones para tu proyecto. Importes, condiciones y calendario de pagos deben quedar acordados antes de aceptar la propuesta." },
    ],
    briefOptions: ["Cocina y baños", "Varios ambientes de la vivienda", "Toda la vivienda", "Diseño y mobiliario del conjunto", "Evaluar una ejecución por etapas", "Necesito ordenar mis prioridades"],
    ctaTitle: "Empecemos por los espacios que necesitas resolver.",
    ctaText: "Cuéntanos qué ambientes quieres intervenir, qué deseas conservar y si la vivienda estará ocupada. Comparte fotos y la fecha que tienes en mente para hablar del alcance.",
  },
  {
    id: "obra-gris",
    slug: "de-obra-gris-a-espectaculo",
    number: "04",
    name: "De obra gris a espectáculo",
    shortName: "Obra gris",
    kicker: "DE OBRA GRIS A ESPECTÁCULO · BUCARAMANGA",
    headline: "De obra gris a espectáculo.",
    intro: "Pisos, paredes, cocina, baños y almacenamiento: un inmueble en obra gris concentra muchas decisiones. Organizarlas desde el principio permite definir qué necesitas contratar para terminarlo.",
    lead: "Diseño, renders, mobiliario propio y ejecución de los acabados acordados. Partimos del estado real de entrega para definir los trabajos que completarán cada ambiente.",
    hero: "/media/transformacion-despues-1280.webp",
    metaDescription: "De obra gris a casa terminada en Bucaramanga. Diseño, renders, fabricación de mobiliario y ejecución de los trabajos definidos con Nu Casa.",
    problems: [
      { title: "La entrega no dice todo lo que falta.", text: "El estado de pisos, paredes, puntos y elementos instalados puede variar entre inmuebles. La propuesta necesita partir de lo que existe en el tuyo." },
      { title: "Tienes referencias, pero falta un conjunto.", text: "Una cocina, un piso y un baño elegidos por separado no explican toda la vivienda. El diseño relaciona esas decisiones antes de comprar o fabricar." },
      { title: "Quieres mudarte, pero necesitas un plan.", text: "La fecha deseada debe contrastarse con el alcance y los suministros. Definir la secuencia ayuda a conversar sobre un calendario viable para el proyecto." },
    ],
    scope: [
      { title: "Revisión del punto de partida", text: "Identificamos el estado de entrega y los trabajos que faltan para el alcance solicitado; cada inmueble presenta condiciones distintas.", items: ["Superficies y elementos existentes", "Pendientes por ambiente", "Necesidades que deben revisarse"] },
      { title: "Diseño y renders antes de ejecutar", text: "Desarrollamos una propuesta visual que relacione pisos, revestimientos, iluminación y mobiliario. Los renders permiten revisar el conjunto y orientar las elecciones.", items: ["Organización de los ambientes", "Materiales y acabados propuestos", "Renders de espacios contratados"] },
      { title: "Preparación e intervenciones técnicas", text: "Revisamos las necesidades hidráulicas, eléctricas y de preparación. Cada intervención debe definirse según el inmueble y quedar contemplada expresamente en la propuesta.", items: ["Condiciones de las superficies", "Puntos e instalaciones por revisar", "Preparaciones requeridas para los acabados"] },
      { title: "Acabados de los espacios", text: "Ejecutamos los acabados contratados con sus materiales y cantidades definidos. La propuesta diferencia trabajos de pisos, paredes y zonas específicas de cocina y baño.", items: ["Pisos y revestimientos acordados", "Terminaciones de paredes", "Elementos definidos para cocina y baños"] },
      { title: "Mobiliario, montaje y entrega", text: "Fabricamos e instalamos el mobiliario acordado, ejecutamos las terminaciones y revisamos la entrega. Los equipos y suministros deben estar expresamente definidos.", items: ["Mobiliario contratado por ambiente", "Montaje y ajustes de las piezas", "Revisión de trabajos y terminaciones"] },
    ],
    decisions: [
      { title: "Qué superficies faltan por terminar", text: "El estado de pisos y paredes define las preparaciones y acabados por contratar. Comparte fotografías y la información de entrega disponible." },
      { title: "Dónde necesitas luz", text: "Preparar, leer y circular requieren soluciones distintas. La ubicación de los puntos existentes se revisa junto con la iluminación que buscas para cada ambiente." },
      { title: "Qué mobiliario necesitas desde el comienzo", text: "Cocina, muebles de baño y almacenamiento deben relacionarse con el espacio disponible. Prioriza las piezas necesarias para habitarlo y las que evaluarás después." },
    ],
    transformations: [
      { id: "obra-gris-1", title: "Del concreto a una sala clara con un frente de madera", description: "La estructura de concreto recibe pisos, paredes terminadas e iluminación indirecta. Una sala de tonos claros se organiza frente al mueble de TV de madera oscura, manteniendo los ventanales.", beforeLabel: "Obra gris conceptual", afterLabel: "Ambiente conceptual", changes: ["Pisos y paredes con acabados claros","Sofá claro y frente de TV en madera oscura","Iluminación indirecta y cortinas junto a los ventanales"] },
      { id: "obra-gris-2", title: "Doble altura con escalera de madera y luz integrada", description: "El espacio en doble altura se completa con pisos claros, carpintería de muro y una escalera con huellas de madera, baranda negra e iluminación bajo los peldaños.", beforeLabel: "Obra gris conceptual", afterLabel: "Ambiente conceptual", changes: ["Pisos claros y carpintería integrada en el muro","Escalera con huellas de madera y baranda negra","Luz en los peldaños y en los nichos de madera"] },
    ],
    faqs: [
      { q: "¿Qué información necesitan para comenzar?", a: "La ubicación en Bucaramanga, fotografías, medidas aproximadas y el estado de entrega. Comparte también qué ambientes necesitas completar y qué fecha de mudanza tienes en mente." },
      { q: "¿Puedo revisar el diseño antes de elegir acabados?", a: "Sí. Ofrecemos diseño y renders para revisar la propuesta. Los ambientes, entregables y decisiones contempladas se definen en el alcance contratado." },
      { q: "¿Revisan las instalaciones existentes?", a: "Las necesidades técnicas se revisan según el inmueble. Si hacen falta intervenciones, deben describirse y cotizarse; no se presumen incluidas por contratar acabados." },
      { q: "¿Pueden entregarlo para mi fecha de mudanza?", a: "Cuéntanos tu fecha para evaluar la viabilidad. El compromiso de ejecución se acuerda según el alcance, el estado del inmueble y los suministros necesarios." },
      { q: "¿Hay garantía sobre los trabajos?", a: "Sí. Las condiciones se definen por tipo de trabajo y elemento contratado, se detallan en la propuesta y no afectan tus derechos como consumidor." },
      { q: "¿Qué facilidades de pago ofrecen?", a: "Las opciones se consultan para cada proyecto antes de contratar. El calendario, los importes y las condiciones deben quedar claros en la propuesta que aceptes." },
    ],
    briefOptions: ["Completar toda la vivienda", "Terminar cocina y baños", "Definir pisos y revestimientos", "Diseño y renders del conjunto", "Fabricar el mobiliario", "Revisar pendientes de la entrega"],
    ctaTitle: "Muéstranos qué recibiste y qué te falta por terminar.",
    ctaText: "Comparte fotos o información de la entrega, el sector donde está el inmueble y tu fecha deseada de mudanza. Conversemos sobre los trabajos que necesitas definir.",
  },
];
