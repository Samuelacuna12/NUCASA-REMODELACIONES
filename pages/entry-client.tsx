import { createRoot, hydrateRoot } from "react-dom/client";
import HomeExperience from "../app/HomeExperience";
import "../app/nucasa.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró la página de Nu Casa.");
if (root.firstElementChild) hydrateRoot(root, <HomeExperience />);
else createRoot(root).render(<HomeExperience />);
