import { useState, type CSSProperties } from "react";

import type { ProjectBanner as ProjectBannerData } from "@/domain";
import { ImageViewer } from "@shared/components/ImageViewer";

/**
 * Banniere de la fiche, au-dessus du header : le titre n'est jamais
 * superpose a l'image (contraste garanti). Le point focal reste visible
 * quand le ratio change (16:9 sur mobile, 3:1 des `md`). Un clic (ou Entree) l'ouvre en grand
 * dans la visionneuse, avec zoom : utile pour un schema ou une capture dense.
 *
 * Aucun rendu sans banniere (pas de bloc vide, pas de placeholder).
 */
export function ProjectBanner({
  banner,
  projectTitle,
}: {
  banner?: ProjectBannerData;
  projectTitle: string;
}) {
  const [open, setOpen] = useState(false);
  if (!banner) return null;
  // Variable CSS dynamique uniquement (V2-2) ; construite hors JSX pour
  // rester sur une seule ligne et passer `check-tokens` apres prettier.
  const focalStyle = {
    "--focal": `${banner.focal.x}% ${banner.focal.y}%`,
  } as CSSProperties;
  const label = `Agrandir la bannière : ${banner.alt}`;

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-muted">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-[color:var(--accent-base,var(--ring))]"
      >
        <div className="aspect-video md:aspect-[3/1]">
          <img
            src={banner.url}
            alt={banner.alt}
            fetchPriority="high"
            decoding="async"
            style={focalStyle}
            className="size-full object-cover object-[position:var(--focal)]"
          />
        </div>
      </button>
      <ImageViewer
        images={[banner]}
        index={open ? 0 : null}
        title={`Bannière du projet ${projectTitle}`}
        onIndexChange={() => {}}
        onClose={() => setOpen(false)}
      />
    </figure>
  );
}
