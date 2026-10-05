import type { CSSProperties } from "react";

import type { ProjectBanner as ProjectBannerData } from "@/domain";

/**
 * Banniere de la fiche, au-dessus du header : le titre n'est jamais
 * superpose a l'image (contraste garanti). Le point focal reste visible
 * quand le ratio change (16:9 sur mobile, 3:1 des `md`). L'image
 * decorative est rendue avec `alt=""`.
 *
 * Aucun rendu sans banniere (pas de bloc vide, pas de placeholder).
 */
export function ProjectBanner({ banner }: { banner?: ProjectBannerData }) {
  if (!banner) return null;
  // Variable CSS dynamique uniquement (V2-2) ; construite hors JSX pour
  // rester sur une seule ligne et passer `check-tokens` apres prettier.
  const focalStyle = {
    "--focal": `${banner.focal.x}% ${banner.focal.y}%`,
  } as CSSProperties;

  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-muted">
      <div className="aspect-video md:aspect-[3/1]">
        <img
          src={banner.url}
          alt={banner.decorative ? "" : banner.alt}
          fetchPriority="high"
          decoding="async"
          style={focalStyle}
          className="size-full object-cover object-[position:var(--focal)]"
        />
      </div>
    </figure>
  );
}
