import { createRoot, hydrateRoot } from "react-dom/client";
import AboutExperience from "../app/AboutExperience";
import "../app/nucasa.css";
import "../app/about.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró la página Quiénes somos de Nu Casa.");
if (root.firstElementChild) hydrateRoot(root, <AboutExperience />);
else createRoot(root).render(<AboutExperience />);
