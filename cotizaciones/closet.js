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
      name: "Principal · Puertas con espejo",
      mechanism: "Puertas corredizas sobre rieles de aluminio, con espejos en el centro.",
      dimensions: [222, 170, 60],
      compartments: [[0, 0, 25, 100], [26, 0, 48, 100], [75, 0, 25, 100]],
      dividers: [25, 74],
      shelves: [[0, 19, 25], [0, 63, 25], [75, 19, 25], [75, 55, 25], [75, 70, 25], [75, 84, 25]],
      rails: [[4, 25, 15], [80, 25, 15]],
      drawers: [[0, 65, 25, 11], [0, 77, 25, 11], [0, 89, 25, 11]],
      fronts: [
        [0, 0, 25, 100, "slide", "left", 100],
        [25, 0, 25, 100, "fixed", "right", 0, "mirror"],
        [50, 0, 25, 100, "fixed", "left", 0, "mirror"],
        [75, 0, 25, 100, "slide", "right", -100],
      ],
      assembly: [
        "La base, los laterales y la cubierta forman el cuerpo empotrado.",
        "Se colocan los compartimientos interiores y los rieles de aluminio.",
        "Se instalan los frentes corredizos, con espejo en los paneles centrales.",
      ],
    },
    "03": {
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
    "04": {
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
    model.style.setProperty("--qc-model-ratio", design.dimensions[0] / design.dimensions[1]);

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

    if (variant !== "01") {
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
        dimensions.textContent = `${design.dimensions.join(" × ")} cm`;
        modelIndex.textContent = `${state.variant} / 04`;
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
