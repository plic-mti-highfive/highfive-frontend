import { useOutletContext } from "react-router-dom";

import { EmptyState, ErrorState, Skeleton } from "@shared/ui";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  usePinAnnouncement,
} from "@/api/queries/announcements";
import type { ProjectOutletContext } from "../components/ProjectLayout";
import { AnnouncementCard } from "../components/AnnouncementCard";
import { AnnouncementForm } from "../components/AnnouncementForm";

/** Onglet Annonces (`/projets/:slug/annonces`, doc 13 E-11). R-A2 : l'epinglee en tete. */
export function ProjectNewsPage() {
  const { project, members, capabilities } =
    useOutletContext<ProjectOutletContext>();

  const announcementsQuery = useAnnouncements(project.slug);
  const createAnnouncement = useCreateAnnouncement(project.slug);
  const pinAnnouncement = usePinAnnouncement(project.slug);
  const deleteAnnouncement = useDeleteAnnouncement(project.slug);

  const announcements = announcementsQuery.data ?? [];
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {capabilities.canPostAnnouncement && (
        <AnnouncementForm
          membersCount={members.length}
          isSubmitting={createAnnouncement.isPending}
          onSubmit={(input) => createAnnouncement.mutate(input)}
        />
      )}

      {announcementsQuery.isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : announcementsQuery.error ? (
        <ErrorState
          message="Les annonces n'ont pas pu être chargées."
          onRetry={() => announcementsQuery.refetch()}
        />
      ) : sorted.length === 0 ? (
        <EmptyState title="Pas encore d'annonce." />
      ) : (
        <ul className="flex flex-col gap-4">
          {sorted.map((announcement) => (
            <li key={announcement.id}>
              <AnnouncementCard
                announcement={announcement}
                canManage={capabilities.canPinAnnouncement}
                isPinning={pinAnnouncement.isPending}
                isDeleting={deleteAnnouncement.isPending}
                onPin={() => pinAnnouncement.mutate(announcement.id)}
                onDelete={() => deleteAnnouncement.mutate(announcement.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
