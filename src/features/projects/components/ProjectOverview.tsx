import { Fragment, type ReactNode } from "react";

import { EmptyState, Section } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { useAnnouncements } from "@/api/queries/announcements";
import type { TeamMember } from "@/api/memberships";
import type { CustomizationSectionId, Project } from "@/domain";
import { resolveSections } from "../lib/customization";
import { renderRestrictedMarkdown } from "../lib/markdown";
import { CommentsSection } from "./CommentsSection";
import { PinnedAnnouncementPreview } from "./PinnedAnnouncementPreview";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectOverviewSidebar } from "./ProjectOverviewSidebar";

/**
 * Contenu de l'onglet Apercu : colonne principale (sections dans l'ordre
 * choisi par le porteur, masquables) et sidebar fixe. Compose pour deux
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
  const accent = customization?.accent;
  const accented = accent !== undefined;
  const gallery = customization?.gallery ?? [];

  const sections: Record<CustomizationSectionId, ReactNode> = {
    pinned: pinned ? (
      <PinnedAnnouncementPreview
        slug={project.slug}
        announcement={pinned}
        accent={accent}
      />
    ) : null,
    about: (
      <Section title="À propos" accentMarker={accented}>
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
          <EmptyState
            title="Aucune description détaillée pour le moment."
            className="rounded-lg border border-dashed border-border bg-muted"
          />
        )}
      </Section>
    ),
    gallery:
      gallery.length > 0 ? (
        <Section title="Galerie" accentMarker={accented}>
          <ProjectGallery gallery={gallery} projectTitle={project.title} />
        </Section>
      ) : null,
    comments: preview ? (
      <Section title="Commentaires" accentMarker={accented}>
        <p className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-center text-body-sm text-muted-foreground">
          Les commentaires s'affichent ici.
        </p>
      </Section>
    ) : (
      <CommentsSection
        slug={project.slug}
        isAuthenticated={canComment}
        canModerate={canModerateComments}
        accentMarker={accented}
      />
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col gap-10 lg:col-span-2">
        {resolveSections(customization)
          .filter((section) => section.visible)
          .map((section) => {
            const node = sections[section.id];
            return node ? <Fragment key={section.id}>{node}</Fragment> : null;
          })}
      </div>

      <ProjectOverviewSidebar
        project={project}
        members={members}
        accented={accented}
      />
    </div>
  );
}
