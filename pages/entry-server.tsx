import { renderToString } from "react-dom/server";
import HomeExperience from "../app/HomeExperience";
import AboutExperience from "../app/AboutExperience";
import LegalStatic from "./LegalStatic";

export const renderHome = () => renderToString(<HomeExperience />);
export const renderAbout = () => renderToString(<AboutExperience />);
export const renderLegal = (slug: string) => renderToString(<LegalStatic slug={slug} />);
