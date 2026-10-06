import { useState } from "react";
import { ImageOff, Maximize2 } from "lucide-react";

import {
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Skeleton,
  Textarea,
} from "@shared/ui";
import { ImageViewer, type ViewerImage } from "@shared/components/ImageViewer";
import {
  useAdminProjectMedia,
  useAdminRemoveProjectMedia,
} from "@/api/queries/admin";
import type { ProjectSummary } from "@/domain";
import { ConfirmActionDialog } from "./ConfirmActionDialog";

interface MediaEntry {
  id: string;
  /** « Bannière » ou « Image N » (position dans la galerie). */
  label: string;
  image: ViewerImage;
}

/**
 * Moderation des medias de personnalisation d'un projet : l'administration
 * voit la banniere et la galerie (y compris d'un projet prive ou en
 * brouillon), peut en agrandir chaque image et la retirer avec un motif
 * facultatif. Le retrait est journalise cote serveur (R-S4).
 */
export function ProjectMediaDialog({
  project,
  onClose,
}: {
  project: ProjectSummary;
  onClose: () => void;
}) {
  const mediaQuery = useAdminProjectMedia(project.slug);
  const removeMedia = useAdminRemoveProjectMedia(project.slug);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<MediaEntry | null>(null);
  const [reason, setReason] = useState("");

  const media = mediaQuery.data;
  const entries: MediaEntry[] = media
    ? [
        ...(media.banner
          ? [{ id: media.banner.id, label: "Bannière", image: media.banner }]
          : []),
        ...media.gallery.map((item, index) => ({
          id: item.id,
          label: `Image ${index + 1}`,
          image: item,
        })),
      ]
    : [];

  function closeConfirm() {
    setToRemove(null);
    setReason("");
  }

  async function confirmRemove() {
    if (!toRemove) return;
    await removeMedia.mutateAsync({
      imageId: toRemove.id,
      reason: reason.trim() || undefined,
    });
    closeConfirm();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Médias de « {project.title} »</DialogTitle>
        <DialogDescription>
          Bannière et galerie personnalisées par le porteur. Retirer un média le
          supprime de la fiche du projet ; l'action est journalisée.
        </DialogDescription>

        <div className="mt-4 flex flex-col gap-3">
          {mediaQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : mediaQuery.isError ? (
            <ErrorState
              message="Les médias n'ont pas pu être chargés."
              onRetry={() => mediaQuery.refetch()}
            />
          ) : entries.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title="Ce projet n'a ni bannière ni image de galerie."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="relative shrink-0">
                    <img
                      src={entry.image.url}
                      alt=""
                      className="aspect-[3/2] w-32 rounded-md border border-border object-cover"
                    />
                    <IconButton
                      aria-label={`Agrandir : ${entry.label}`}
                      variant="outline"
                      size="xs"
                      className="absolute top-1 right-1 bg-card transition-none"
                      onClick={() => setViewIndex(index)}
                    >
                      <Maximize2 size={12} />
                    </IconButton>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="font-medium text-foreground">{entry.label}</p>
                    <p className="text-body-sm text-muted-foreground">
                      Texte alternatif : {entry.image.alt}
                    </p>
                    {entry.image.caption && (
                      <p className="text-body-sm text-muted-foreground">
                        Légende : {entry.image.caption}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setToRemove(entry)}
                  >
                    Retirer
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dialogues imbriques DANS la popup : base-ui gere alors le focus et
              l'inertie des dialogues parent/enfant (des freres se disputeraient le focus). */}
        <ImageViewer
          images={entries.map((entry) => entry.image)}
          index={viewIndex}
          title={`Médias du projet ${project.title}`}
          onIndexChange={setViewIndex}
          onClose={() => setViewIndex(null)}
        />

        <ConfirmActionDialog
          open={toRemove !== null}
          onOpenChange={(open) => !open && closeConfirm()}
          title={`Retirer « ${toRemove?.label} » ?`}
          description="L'image disparaît de la fiche du projet. Le porteur pourra en ajouter une autre. L'action est journalisée."
          confirmLabel="Retirer l'image"
          destructive
          pending={removeMedia.isPending}
          onConfirm={confirmRemove}
        >
          <Field label="Motif (facultatif)" htmlFor="media-removal-reason">
            <Textarea
              id="media-removal-reason"
              value={reason}
              maxLength={1000}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
        </ConfirmActionDialog>
      </DialogPopup>
    </Dialog>
  );
}
