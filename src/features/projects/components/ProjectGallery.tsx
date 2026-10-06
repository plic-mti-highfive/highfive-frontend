import { useState } from "react";

import type { GalleryItem } from "@/domain";
import { ImageViewer } from "@shared/components/ImageViewer";

/**
 * Grille de la galerie (images uniquement en v1). Chaque vignette est un
 * vrai `<button>` qui ouvre la visionneuse ; son nom accessible reprend la
 * legende, a defaut le texte alternatif. Rien n'est rendu si la galerie est vide.
 */
export function ProjectGallery({
  gallery,
  projectTitle,
}: {
  gallery: GalleryItem[];
  projectTitle: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (gallery.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((item, index) => {
          const label = item.caption || item.alt;
          return (
            <li key={item.id}>
              <figure className="flex flex-col gap-1.5">
                <button
                  type="button"
                  aria-label={`Agrandir l'image : ${label}`}
                  onClick={() => setOpenIndex(index)}
                  className="block overflow-hidden rounded-lg border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-base,var(--ring))]"
                >
                  <img
                    src={item.url}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/2] w-full object-cover"
                  />
                </button>
                {item.caption && (
                  <figcaption className="text-body-sm text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>
      <ImageViewer
        images={gallery}
        index={openIndex}
        title={`Galerie du projet ${projectTitle}`}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
