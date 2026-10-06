import { useMemo } from "react";

import { ProjectCard } from "@shared/components/projects";
import { accentAttributes } from "@shared/lib/accentColor";
import type { TeamMember } from "@/api/memberships";
import type { Project, ProjectCustomization } from "@/domain";
import { toCardPreview } from "../../lib/customization";
import { ProjectFicheHeader } from "../ProjectFicheHeader";
import { ProjectOverview } from "../ProjectOverview";

/**
 * Apercu live : la carte de projet puis la vraie fiche (banniere, header,
 * Apercu), rendues avec le brouillon a la place de la personnalisation
 * enregistree. La carte recadre la banniere autrement que la fiche : le
 * porteur y verifie son point focal. Zone `inert` :
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
  const cardPreview = useMemo(
    () => toCardPreview(project, members, draft),
    [project, members, draft],
  );

  return (
    <div
      inert
      {...accentAttributes(draft.accent)}
      className="flex flex-col gap-6 bg-background p-4 sm:p-6"
    >
      {cardPreview && (
        <section
          aria-labelledby="customize-card-preview"
          className="flex flex-col gap-2"
        >
          <h2
            id="customize-card-preview"
            className="text-label font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Aperçu de la carte
          </h2>
          <div className="max-w-md">
            <ProjectCard project={cardPreview} />
          </div>
        </section>
      )}
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
