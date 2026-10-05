import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Dialog, DialogPopup, DialogTitle, IconButton } from "@shared/ui";
import type { GalleryItem } from "@/domain";

/**
 * Visionneuse de la galerie. Dialog base-ui : piege du focus, Echap et
 * restitution du focus au declencheur sont geres par la primitive. On y
 * ajoute les fleches gauche/droite, la navigation circulaire et un
 * compteur annonce aux lecteurs d'ecran (`aria-live`).
 */
export function ProjectGalleryLightbox({
  gallery,
  index,
  projectTitle,
  onIndexChange,
  onClose,
}: {
  gallery: GalleryItem[];
  /** `null` = fermee. */
  index: number | null;
  projectTitle: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const item = index === null ? undefined : gallery[index];
  const total = gallery.length;

  function move(step: 1 | -1) {
    if (index === null || total < 2) return;
    onIndexChange((index + step + total) % total);
  }

  // Sur le document, en phase de capture : le Dialog base-ui arrete la
  // propagation des touches au sein de la popup, un ecouteur en phase de bulle
  // (ou un `onKeyDown` sur la popup) ne verrait pas les fleches de facon fiable.
  useEffect(() => {
    if (index === null || total < 2) return;
    const current = index;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange((current + 1) % total);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange((current - 1 + total) % total);
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [index, total, onIndexChange]);

  return (
    <Dialog
      open={item !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {item && index !== null && (
        <DialogPopup
          animated={false}
          className="flex max-h-[90vh] max-w-4xl flex-col gap-3 p-4"
        >
          <DialogTitle className="sr-only">
            Galerie du projet {projectTitle}
          </DialogTitle>
          <p aria-live="polite" className="pr-8 text-body-md text-foreground">
            Image {index + 1} sur {total}
          </p>
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted">
            <img
              src={item.url}
              alt={item.decorative ? "" : item.alt}
              className="max-h-[70vh] w-full object-contain"
            />
            {total > 1 && (
              <>
                <IconButton
                  aria-label="Image précédente"
                  variant="default"
                  className="absolute inset-y-0 left-3 my-auto size-12 rounded-pill shadow-overlay transition-none"
                  onClick={() => move(-1)}
                >
                  <ChevronLeft size={24} />
                </IconButton>
                <IconButton
                  aria-label="Image suivante"
                  variant="default"
                  className="absolute inset-y-0 right-3 my-auto size-12 rounded-pill shadow-overlay transition-none"
                  onClick={() => move(1)}
                >
                  <ChevronRight size={24} />
                </IconButton>
              </>
            )}
          </div>
          {item.caption && (
            <p className="text-body-md text-foreground">{item.caption}</p>
          )}
        </DialogPopup>
      )}
    </Dialog>
  );
}
