import { useOutletContext } from "react-router-dom";

import type { ProjectOutletContext } from "../components/ProjectLayout";
import { ProjectOverview } from "../components/ProjectOverview";

/**
 * Onglet Aperçu (`/projets/:slug`, doc 13 E-10) : annonce épinglée en
 * rappel, description, galerie, commentaires — dans l'ordre choisi par le
 * porteur (`Project.customization.sections`). L'en-tête (titre/accroche/
 * tags/action principale) vit dans `ProjectLayout`, partagé par les trois
 * onglets.
 */
export function ProjectDetailPage() {
  const { project, members, capabilities } =
    useOutletContext<ProjectOutletContext>();

  return (
    <ProjectOverview
      project={project}
      members={members}
      canComment={capabilities.canComment}
      canModerateComments={capabilities.canModerateComments}
    />
  );
}
