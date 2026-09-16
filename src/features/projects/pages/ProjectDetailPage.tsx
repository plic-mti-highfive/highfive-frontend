import { useOutletContext } from "react-router-dom";

import { EmptyState } from "@shared/ui";
import { useAnnouncements } from "@/api/queries/announcements";
import type { ProjectOutletContext } from "../components/ProjectLayout";
import { ProjectOverviewSidebar } from "../components/ProjectOverviewSidebar";
import { PinnedAnnouncementPreview } from "../components/PinnedAnnouncementPreview";
import { CommentsSection } from "../components/CommentsSection";
import { renderRestrictedMarkdown } from "../lib/markdown";

/**
 * Onglet Aperçu (`/projets/:slug`, doc 13 E-10) : annonce épinglée en
 * rappel, description, commentaires. L'en-tête (titre/accroche/tags/action
 * principale) vit dans `ProjectLayout`, partagé par les trois onglets.
 */
export function ProjectDetailPage() {
  const { project, members, capabilities } =
    useOutletContext<ProjectOutletContext>();

  const announcementsQuery = useAnnouncements(project.slug);
  const pinned = announcementsQuery.data?.find((item) => item.pinned);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col gap-10 lg:col-span-2">
        {pinned && (
          <PinnedAnnouncementPreview
            slug={project.slug}
            announcement={pinned}
          />
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-heading-md font-semibold text-foreground">
            À propos
          </h2>
          {project.description ? (
            <div
              className="prose-sm max-w-none text-body-md leading-relaxed text-foreground"
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
        </section>

        <CommentsSection
          slug={project.slug}
          isAuthenticated={capabilities.canComment}
          canModerate={capabilities.canModerateComments}
        />
      </div>

      <ProjectOverviewSidebar project={project} members={members} />
    </div>
  );
}
