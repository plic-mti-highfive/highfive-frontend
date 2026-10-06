import { useMemo } from "react";

import { ProjectCard } from "@shared/components/projects";
import { Section } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { projectThemeAttributes } from "@shared/lib/projectTheme";
import type { TeamMember } from "@/api/memberships";
import type { Project, ProjectCustomization } from "@/domain";
import { toCardPreview } from "../../lib/customization";
import { ProjectFicheHeader } from "../ProjectFicheHeader";
import { ProjectOverview } from "../ProjectOverview";

/**
 * Apercu live en deux sections distinctes : la carte de projet, puis la vraie
 * fiche (banniere, header, Apercu), rendues avec le brouillon a la place de la
 * personnalisation enregistree. La carte recadre la banniere autrement que la
 * fiche : le porteur y verifie son point focal. Pas de cadre ni de marge
 * propres, la page qui l'accueille en decide. Zone `inert` :
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
    <div inert className="flex flex-col gap-10 bg-background">
      {cardPreview && (
        <Section title="Carte du projet">
          <div className="max-w-md">
            <ProjectCard project={cardPreview} />
          </div>
        </Section>
      )}
      <Section title="Fiche du projet">
        {/* Le theme couvre la fiche seule : la carte garde le theme du site,
            comme dans les listes. */}
        <div
          {...projectThemeAttributes(draft.theme)}
          className={cn(
            "flex flex-col gap-6",
            draft.theme && "rounded-xl p-4 sm:p-6",
          )}
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
      </Section>
    </div>
  );
}
