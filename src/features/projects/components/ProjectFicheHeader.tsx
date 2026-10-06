import type { Project, UserSummary } from "@/domain";
import { ProjectBanner } from "./ProjectBanner";
import { ProjectHeader } from "./ProjectHeader";

/**
 * Haut de la fiche : banniere puis header. Partage entre la fiche
 * (`ProjectLayout`) et l'apercu live de l'editeur de personnalisation, pour
 * que l'apercu rende exactement la fiche. Avec un theme, le header est pose
 * sur un fond teinte ; sans, rien ne change par rapport a la fiche d'origine.
 */
export function ProjectFicheHeader({
  project,
  owner,
  isAuthenticated,
  isMember,
  canEdit,
  highfiveGiven,
}: {
  project: Project;
  owner?: UserSummary;
  isAuthenticated: boolean;
  isMember: boolean;
  canEdit: boolean;
  highfiveGiven: boolean;
}) {
  const themed = project.customization?.theme !== undefined;
  const header = (
    <ProjectHeader
      project={project}
      owner={owner}
      isAuthenticated={isAuthenticated}
      isMember={isMember}
      canEdit={canEdit}
      highfiveGiven={highfiveGiven}
      tinted={themed}
    />
  );

  return (
    <>
      <ProjectBanner
        banner={project.customization?.banner}
        projectTitle={project.title}
      />
      {themed ? (
        <div className="rounded-xl bg-[var(--accent-light)] p-6">{header}</div>
      ) : (
        header
      )}
    </>
  );
}
