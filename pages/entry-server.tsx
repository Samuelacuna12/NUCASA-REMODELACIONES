import { renderToString } from "react-dom/server";
import HomeExperience from "../app/HomeExperience";
import AboutExperience from "../app/AboutExperience";
import ServicesExperience from "../app/ServicesExperience";
import LegalStatic from "./LegalStatic";

export { SERVICES } from "../content/services";

export const renderHome = () => renderToString(<HomeExperience />);
export const renderAbout = () => renderToString(<AboutExperience />);
export const renderServices = (serviceId?: string) => renderToString(<ServicesExperience serviceId={serviceId} />);
export const renderLegal = (slug: string) => renderToString(<LegalStatic slug={slug} />);
