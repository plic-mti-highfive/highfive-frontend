import { Fragment, type ReactNode } from "react";

import { Section } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { useAnnouncements } from "@/api/queries/announcements";
import type { TeamMember } from "@/api/memberships";
import type { CustomizationSectionId, Project } from "@/domain";
import { resolveSections } from "../lib/customization";
import { renderRestrictedMarkdown } from "../lib/markdown";
import { CommentsSection } from "./CommentsSection";
import { PinnedAnnouncementPreview } from "./PinnedAnnouncementPreview";
import { NearbyProjects } from "./NearbyProjects";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectNeeds } from "./ProjectNeeds";
import { ProjectPanel } from "./ProjectPanel";
import { ProjectOverviewSidebar } from "./ProjectOverviewSidebar";

/**
 * Contenu de l'onglet Apercu : colonne principale (sections dans l'ordre
 * choisi par le porteur, masquables, chacune dans un bloc), sidebar fixe, puis
 * les projets proches en bande pleine largeur. Compose pour deux
 * usages : la page Apercu (`ProjectDetailPage`) et l'apercu live de
 * l'editeur de personnalisation (`preview`, qui remplace les commentaires
 * par un bloc leger : ni requetes ni formulaire dans une zone inerte).
 *
 * Sans `project.customization`, l'ordre et le rendu sont ceux de la fiche
 * d'origine (annonce epinglee, a propos, commentaires ; galerie vide = rien).
 */
export function ProjectOverview({
  project,
  members,
  canComment,
  canModerateComments,
  preview = false,
}: {
  project: Project;
  members: TeamMember[];
  canComment: boolean;
  canModerateComments: boolean;
  preview?: boolean;
}) {
  const announcementsQuery = useAnnouncements(project.slug);
  const pinned = announcementsQuery.data?.find((item) => item.pinned);
  const customization = project.customization;
  const accented = customization?.theme !== undefined;
  const gallery = customization?.gallery ?? [];

  const sections: Record<CustomizationSectionId, ReactNode> = {
    pinned: pinned ? (
      <PinnedAnnouncementPreview
        slug={project.slug}
        announcement={pinned}
        inheritAccent={accented}
      />
    ) : null,
    needs: <ProjectNeeds needs={project.needs} />,
    about: (
      <ProjectPanel>
        <Section title="À propos">
          {project.description ? (
            <div
              className={cn(
                "prose-sm max-w-none text-body-md leading-relaxed text-foreground",
                accented && "[&_a]:text-[var(--accent-dark)]",
              )}
              dangerouslySetInnerHTML={{
                __html: renderRestrictedMarkdown(project.description),
              }}
            />
          ) : (
            <p className="text-body-md text-muted-foreground">
              Aucune description détaillée pour le moment.
            </p>
          )}
        </Section>
      </ProjectPanel>
    ),
    gallery:
      gallery.length > 0 ? (
        <ProjectPanel>
          <Section title="Galerie">
            <ProjectGallery gallery={gallery} projectTitle={project.title} />
          </Section>
        </ProjectPanel>
      ) : null,
    comments: preview ? (
      <ProjectPanel>
        <Section title="Commentaires">
          <p className="text-body-sm text-muted-foreground">
            Les commentaires s'affichent ici.
          </p>
        </Section>
      </ProjectPanel>
    ) : (
      <ProjectPanel>
        <CommentsSection
          slug={project.slug}
          isAuthenticated={canComment}
          canModerate={canModerateComments}
        />
      </ProjectPanel>
    ),
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {resolveSections(customization)
            .filter((section) => section.visible)
            .map((section) => {
              const node = sections[section.id];
              return node ? <Fragment key={section.id}>{node}</Fragment> : null;
            })}
        </div>

        <ProjectOverviewSidebar project={project} members={members} />
      </div>

      <NearbyProjects project={project} />
    </div>
  );
}
