import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { cn } from "@shared/lib/cn";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useTrendingTags } from "@/api/queries/search";
import { getTagById, type Tag } from "@/domain";

function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 10) {
        setHidden(false);
      } else if (y > lastY.current + 4) {
        setHidden(true);
      } else if (y < lastY.current - 4) {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

const pillBase =
  "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-ui-md font-semibold transition-colors duration-fast outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/** Tient sans defilement horizontal (V2, retour utilisateur "sous-barre de tags"). */
const DESKTOP_LIMIT = 8;
const MOBILE_LIMIT = 4;

/**
 * Sous-barre de themes (doc 12 E-01, V2 item 3) : ne filtre plus Decouvrir
 * sur place — un clic navigue vers `/recherche?type=projets&tags=<id>`. Pas
 * d'etat "actif" (il n'y a plus de filtre ici). Themes affiches : les
 * interets de la personne connectee en priorite, completes par les themes
 * tendance (`GET /feed/tags-trending`, deja limite a 5 cote serveur) ;
 * repli sur la tendance seule pour un visiteur. Capage cote front
 * (`hidden sm:inline-flex` au-dela de `MOBILE_LIMIT`) plutot qu'une
 * detection JS de la largeur d'ecran.
 */
export function TagFilterBar() {
  const hidden = useScrollDirection();
  const { user } = useCurrentUser();
  const trendingQuery = useTrendingTags();

  const interestTags = (user?.interests ?? [])
    .map((id) => getTagById(id))
    .filter((t): t is Tag => Boolean(t));
  const trendingTags = (trendingQuery.data ?? []).map((row) => row.tag);

  const seen = new Set<string>();
  const tags: Tag[] = [];
  for (const tag of [...interestTags, ...trendingTags]) {
    if (seen.has(tag.id) || tags.length >= DESKTOP_LIMIT) continue;
    seen.add(tag.id);
    tags.push(tag);
  }

  return (
    <nav
      aria-label="Parcourir les thèmes"
      className={cn(
        "sticky top-14 z-sticky border-b border-sidebar-border bg-sidebar",
        "transition-transform duration-300 ease-in-out",
        hidden && "-translate-y-full",
      )}
    >
      <div className="justify-center mx-auto flex max-w-content flex-wrap items-center gap-1.5 px-6 py-2">
        {tags.map((tag, index) => (
          <Link
            key={tag.id}
            to={`/recherche?type=projets&tags=${encodeURIComponent(tag.id)}`}
            data-accent={tag.accent}
            className={cn(
              pillBase,
              "text-foreground hover:bg-muted",
              index >= MOBILE_LIMIT && "hidden sm:inline-flex",
            )}
          >
            {tag.label}
          </Link>
        ))}
        <Link
          to="/recherche?type=tags"
          className={cn(
            pillBase,
            "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Tous les thèmes
        </Link>
      </div>
    </nav>
  );
}
