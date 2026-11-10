import { createRoot, hydrateRoot } from "react-dom/client";
import ServicesExperience from "../app/ServicesExperience";
import "../app/nucasa.css";
import "../app/services.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró la página de servicios de Nu Casa.");
const serviceId = root.dataset.serviceId || undefined;
const page = <ServicesExperience serviceId={serviceId} />;
if (root.firstElementChild) hydrateRoot(root, page);
else createRoot(root).render(page);
