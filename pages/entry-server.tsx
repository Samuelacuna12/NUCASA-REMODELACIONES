import { renderToString } from "react-dom/server";
import HomeExperience from "../app/HomeExperience";
import LegalStatic from "./LegalStatic";

export const renderHome = () => renderToString(<HomeExperience />);
export const renderLegal = (slug: string) => renderToString(<LegalStatic slug={slug} />);
