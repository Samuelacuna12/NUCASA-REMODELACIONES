(() => {
  const structure = {
    "01": {
      name: "Principal · Puertas lisas",
      mechanism: "Cuatro puertas abatibles con bisagras de cazoleta y dos cajones centrales.",
      dimensions: [222, 170, 60],
      compartments: [[0, 0, 30, 100], [31, 0, 38, 100], [70, 0, 30, 100]],
      dividers: [30, 69],
      shelves: [[0, 79, 30], [31, 31, 38], [31, 56, 38], [31, 75, 38], [70, 79, 30]],
      rails: [[7, 16, 17], [77, 16, 17]],
      drawers: [[31, 76, 38, 11], [31, 88, 38, 12]],
      fronts: [
        [0, 0, 30, 100, "hinge-left", "right"],
        [30, 0, 20, 75, "hinge-left", "right"],
        [50, 0, 20, 75, "hinge-right", "left"],
        [70, 0, 30, 100, "hinge-right", "left"],
      ],
      assembly: [
        "La base, los laterales y la cubierta forman el cuerpo del clóset.",
        "Se colocan las divisiones, las repisas centrales y las barras laterales.",
        "Se montan las cuatro puertas abatibles y los dos cajones centrales.",
      ],
    },
    "02": {
      name: "Principal · Corredizo con zapatero",
      mechanism: "Una puerta corrediza descubre el doble colgadero. Al otro lado, tres cajones y un zapatero abatible organizan la ropa y el calzado.",
      dimensions: [222, 170, 60],
      compartments: [[0, 0, 52, 100], [52, 0, 26, 100], [78, 0, 22, 100]],
      dividers: [52, 78],
      shelves: [[0, 20, 100], [52, 42, 26], [52, 55, 26], [79, 30, 21], [79, 40, 21], [79, 50, 21], [79, 60, 21], [79, 70, 21], [79, 80, 21], [79, 90, 21]],
      rails: [[3, 27, 46], [3, 65, 46]],
      drawers: [[53, 58, 25, 11], [53, 70, 25, 11], [53, 82, 25, 11]],
      fronts: [[0, 20, 50, 80, "slide", "right", 85], [50, 20, 28, 80, "slide", "left", -100], [78, 20, 22, 80, "hinge-right", "left"], [0.0, 0, 25.0, 20, "hinge-left", "right"], [25.0, 0, 25.0, 20, "hinge-left", "right"], [50.0, 0, 25.0, 20, "hinge-left", "right"], [75.0, 0, 25.0, 20, "hinge-left", "right"]],
      assembly: ["Se arma la estructura del clóset.", "Se distribuyen las barras, las repisas y los cajones.", "Se ajustan los frentes y las manijas."],
    },
    "03": {
      name: "Principal · Puertas lisas con módulo lateral",
      mechanism: "Dos puertas altas cubren los colgaderos y cuatro cajones. El módulo lateral extraíble incluye un zapatero.",
      dimensions: [222, 170, 60],
      compartments: [[0, 0, 17, 100], [17, 0, 41, 100], [58, 0, 42, 100]],
      dividers: [17, 58],
      shelves: [[18, 20, 82], [0, 13, 17], [0, 24, 17], [0, 35, 17], [0, 46, 17], [0, 57, 17], [0, 68, 17], [0, 79, 17], [0, 90, 17]],
      rails: [[20, 26, 35], [61, 26, 35]],
      drawers: [[59, 58, 41, 9], [59, 68, 41, 9], [59, 78, 41, 9], [59, 88, 41, 9]],
      fronts: [[0, 0, 17, 100, "hinge-left", "right"], [17, 0, 41, 100, "hinge-left", "right"], [58, 0, 42, 100, "hinge-right", "left"]],
      assembly: ["Se arma la estructura del clóset.", "Se distribuyen las barras, las repisas y los cajones.", "Se ajustan los frentes y las manijas."],
    },
    "04": {
      name: "Principal · Cuatro puertas con altillo",
      mechanism: "Cuatro puertas con manijas negras dan acceso a tres módulos con barras, cajones centrales y repisas para zapatos.",
      dimensions: [222, 170, 60],
      compartments: [[0, 0, 33, 100], [33, 0, 33, 100], [66, 0, 34, 100]],
      dividers: [33, 66],
      shelves: [[0, 20, 100], [0, 61, 33], [67, 70, 33], [67, 85, 33]],
      rails: [[3, 28, 26], [3, 67, 26], [36, 28, 26], [69, 28, 26]],
      drawers: [[34, 60, 32, 9], [34, 70, 32, 9], [34, 80, 32, 9], [34, 90, 32, 9]],
      fronts: [[0, 20, 25, 80, "hinge-left", "right"], [25, 20, 25, 80, "hinge-right", "left"], [50, 20, 25, 80, "hinge-left", "right"], [75, 20, 25, 80, "hinge-right", "left"], [0.0, 0, 33.333333333333336, 20, "hinge-left", "right"], [33.333333333333336, 0, 33.333333333333336, 20, "hinge-left", "right"], [66.66666666666667, 0, 33.333333333333336, 20, "hinge-left", "right"]],
      assembly: ["Se arma la estructura del clóset.", "Se distribuyen las barras, las repisas y los cajones.", "Se ajustan los frentes y las manijas."],
    },
    "05": {
      name: "Habitación auxiliar 1",
      mechanism: "Puertas corredizas con riel superior e inferior, repisas abiertas y cajones extraíbles.",
      dimensions: [125, 222, 60],
      compartments: [[0, 0, 52, 100], [53, 0, 47, 100]],
      dividers: [52],
      shelves: [[0, 23, 52], [53, 18, 47], [53, 34, 47], [53, 49, 47], [53, 63, 47]],
      rails: [[5, 28, 42]],
      drawers: [[53, 65, 47, 10], [53, 77, 47, 10], [53, 89, 47, 11]],
      fronts: [[0, 0, 52, 100, "slide", "left"], [52, 0, 48, 100, "slide", "right", -94]],
      assembly: [
        "Se forma el cuerpo empotrado con la base, los laterales y la cubierta.",
        "Se incorporan las repisas y los rieles superior e inferior.",
        "Se colocan los cajones extraíbles y los frentes corredizos.",
      ],
    },
    "06": {
      name: "Habitación auxiliar 2",
      mechanism: "Puertas corredizas con riel superior e inferior, repisas y tres cajones.",
      dimensions: [174, 222, 60],
      compartments: [[0, 0, 51, 100], [52, 0, 48, 100]],
      dividers: [51],
      shelves: [[0, 23, 51], [52, 18, 48], [52, 34, 48], [52, 49, 48], [52, 63, 48]],
      rails: [[5, 28, 41]],
      drawers: [[52, 65, 48, 10], [52, 77, 48, 10], [52, 89, 48, 11]],
      fronts: [[0, 0, 51, 100, "slide", "left"], [51, 0, 49, 100, "slide", "right", -90]],
      assembly: [
        "Se forma el cuerpo empotrado con la base, los laterales y la cubierta.",
        "Se colocan las divisiones, las repisas y los rieles.",
        "Se instalan los tres cajones y los frentes corredizos.",
      ],
    },
  };

  function part(className, bounds) {
    const element = document.createElement("div");
    element.className = className;

    if (bounds) {
      element.classList.add("qc-closet-part");
      ["x", "y", "w", "h"].forEach((dimension, index) => {
        element.style.setProperty(`--qc-${dimension}`, `${bounds[index] ?? 1.2}%`);
      });
    }

    return element;
  }

  function drawModel(model, design, variant) {
    model.style.setProperty("--qc-model-ratio", design.dimensions ? design.dimensions[0] / design.dimensions[1] : 1);

    const frame = ["side", "top", "header", "plinth", "left", "right"].map((edge) => part(`qc-casing qc-casing--${edge}`));
    const interior = part("qc-interior");
    const fronts = part("qc-door-zone");
    const dividers = design.dividers.map((x) => part("qc-divider", [x, 0, 1.4, 100]));
    const drawers = design.drawers.map((bounds, index) => {
      const drawer = part("qc-drawer", bounds);
      drawer.style.zIndex = String(index + 1);
      return drawer;
    });

    interior.append(
      ...design.compartments.map((bounds) => part("qc-compartment", bounds)),
      ...dividers,
      ...design.shelves.map((bounds) => part("qc-shelf", bounds)),
      ...design.rails.map((bounds) => part("qc-rail", bounds)),
      ...drawers,
    );

    if (design.fronts.some(front => front[4] === "slide")) {
      interior.append(part("qc-runner", [0, 0, 100, 1.7]), part("qc-runner", [0, 98.3, 100, 1.7]));
    }

    design.fronts.forEach(([x, y, width, height, type, handle, travel = 0, finish = "wood"], index) => {
      const front = part("qc-front", [x, y, width, height]);
      front.dataset.type = type;
      front.dataset.handle = handle;
      front.dataset.finish = finish;
      front.style.setProperty("--qc-travel", `${travel}%`);
      front.style.setProperty("--qc-assemble-x", index % 2 === 0 ? "-16%" : "16%");
      fronts.append(front);
    });

    model.replaceChildren(part("qc-back"), ...frame, interior, fronts);
  }

  function initCloset(section) {
    const stage = section.querySelector("[data-qc-stage]");
    const model = section.querySelector("[data-qc-model]");
    const name = section.querySelector("[data-qc-name]");
    const mechanism = section.querySelector("[data-qc-mechanism]");
    const dimensions = section.querySelector("[data-qc-dimensions]");
    const modelIndex = section.querySelector("[data-qc-model-index]");
    const status = section.querySelector("[data-qc-status]");
    const description = section.querySelector("[data-qc-step-description]");
    const operation = section.querySelector('[data-qc-control="operation"]');
    const assembly = section.querySelector('[data-qc-control="assembly"]');
    const doorsButton = section.querySelector('[data-qc-toggle="open"]');
    const drawersButton = section.querySelector('[data-qc-toggle="drawers"]');

    const state = { variant: "01", view: "operation", step: "1", open: false, drawers: false };
    let drawnVariant;

    function render() {
      const design = structure[state.variant];

      if (drawnVariant !== state.variant) {
        drawnVariant = state.variant;
        drawModel(model, design, state.variant);
        name.textContent = design.name;
        mechanism.textContent = design.mechanism;
        dimensions.textContent = design.dimensions ? `${design.dimensions.join(" × ")} cm` : "Por confirmar";
        modelIndex.textContent = `${state.variant} / 06`;
      }

      stage.dataset.model = state.variant;
      stage.dataset.view = state.view;
      stage.dataset.assemblyStep = state.step;
      stage.dataset.open = String(state.open);
      stage.dataset.drawers = String(state.drawers);
      operation.hidden = state.view !== "operation";
      assembly.hidden = state.view !== "assembly";

      doorsButton.querySelector("[data-qc-label]").textContent = state.open ? "Cerrar puertas" : "Abrir puertas";
      drawersButton.querySelector("[data-qc-label]").textContent = state.drawers ? "Guardar cajones" : "Sacar cajones";
      drawersButton.querySelector(".qc-action-symbol").textContent = state.drawers ? "−" : "+";
      description.textContent = design.assembly[Number(state.step) - 1];
    }

    function selectVariant(variant) {
      if (!Object.hasOwn(structure, variant) || state.variant === variant) return;
      Object.assign(state, { variant, open: false, drawers: false, step: "1" });
      section.querySelector(`input[name="qc-variant"][value="${variant}"]`).checked = true;
      section.querySelector('input[name="qc-step"][value="1"]').checked = true;
      render();
      status.textContent = `${structure[variant].name}. ${structure[variant].mechanism}`;
    }

    section.addEventListener("change", (event) => {
      const { name: field, value } = event.target;

      if (field === "qc-variant") {
        selectVariant(value);
      } else if (field === "qc-mode") {
        state.view = value;
        render();
        status.textContent = value === "assembly" ? description.textContent : "Vista de apertura.";
      } else if (field === "qc-step") {
        state.step = value;
        render();
        status.textContent = description.textContent;
      }
    });

    doorsButton.addEventListener("click", () => {
      state.open = !state.open;

      if (!state.open && state.variant !== "01") {
        state.drawers = false;
      }

      render();
      status.textContent = state.open ? "Puertas abiertas." : "Puertas cerradas.";
    });

    drawersButton.addEventListener("click", () => {
      const opensDoors = !state.drawers && state.variant !== "01" && !state.open;
      state.drawers = !state.drawers;

      if (opensDoors) {
        state.open = true;
      }

      render();
      status.textContent = opensDoors
        ? "Puertas abiertas y cajones extendidos."
        : (state.drawers ? "Cajones extendidos." : "Cajones guardados.");
    });

    section.addEventListener("quote-closet:select", (event) => selectVariant(String(event.detail)));
    section.querySelectorAll("[data-qc-interaction]").forEach((control) => { control.hidden = false; });
    render();
  }

  function init() {
    document.querySelectorAll("[data-quote-closet]").forEach(initCloset);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
