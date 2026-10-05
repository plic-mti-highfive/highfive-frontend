import { useMemo } from "react";

import { accentAttributes } from "@shared/lib/accentColor";
import type { TeamMember } from "@/api/memberships";
import type { Project, ProjectCustomization } from "@/domain";
import { ProjectFicheHeader } from "../ProjectFicheHeader";
import { ProjectOverview } from "../ProjectOverview";

/**
 * Apercu live : la vraie fiche (banniere, header, Apercu) rendue avec le
 * brouillon a la place de la personnalisation enregistree. Zone `inert` :
 * aucune action reelle (rejoindre, highfive...) ni bruit pour les lecteurs
 * d'ecran, l'editeur a cote porte toute l'interaction.
 */
export function CustomizePreview({
  project,
  members,
  draft,
}: {
  project: Project;
  members: TeamMember[];
  draft: ProjectCustomization;
}) {
  const previewProject = useMemo(
    () => ({ ...project, customization: draft }),
    [project, draft],
  );
  const owner = members.find((member) => member.role === "owner")?.user;

  return (
    <div
      inert
      {...accentAttributes(draft.accent)}
      className="flex flex-col gap-6 bg-background p-4 sm:p-6"
    >
      <ProjectFicheHeader
        project={previewProject}
        owner={owner}
        isAuthenticated
        isMember
        canEdit={false}
        canCustomize={false}
        highfiveGiven={false}
      />
      <ProjectOverview
        project={previewProject}
        members={members}
        canComment={false}
        canModerateComments={false}
        preview
      />
    </div>
  );
}
