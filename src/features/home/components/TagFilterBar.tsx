import { useSearchParams } from "react-router-dom";

import { cn } from "@shared/lib/cn";
import { useTags } from "@/api/queries/tags";
import { TAGS } from "@/domain";

const pillBase =
  "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-ui-md font-semibold transition-colors duration-fast outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50";

/**
 * Barre de themes (doc 12 E-01) : groupe de cases a cocher, selection
 * multiple, ecrite dans l'URL (`?tags=id1,id2`, coherent avec la recherche
 * R-R4). Sticky sous l'en-tete (56 px).
 */
export function TagFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagsQuery = useTags();
  // Liste fermee (R-T1/R-T2) : la constante du domaine sert de repli tant que
  // la requete n'a pas encore resolu, pour eviter une barre vide au chargement.
  const tags = tagsQuery.data ?? TAGS;
  const active = new Set(
    (searchParams.get("tags") ?? "").split(",").filter(Boolean),
  );

  function setActiveTags(next: Set<string>) {
    const params = new URLSearchParams(searchParams);
    if (next.size === 0) params.delete("tags");
    else params.set("tags", [...next].join(","));
    setSearchParams(params, { replace: true });
  }

  function toggleTag(tagId: string) {
    const next = new Set(active);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setActiveTags(next);
  }

  return (
    <div
      role="group"
      aria-label="Filtrer par theme"
      className="sticky top-14 z-sticky border-b border-sidebar-border bg-sidebar"
    >
      <div className="mx-auto flex max-w-content items-center gap-1.5 overflow-x-auto px-6 py-2">
        <button
          type="button"
          aria-pressed={active.size === 0}
          onClick={() => setActiveTags(new Set())}
          className={cn(
            pillBase,
            active.size === 0
              ? "bg-foreground text-background"
              : "text-foreground hover:bg-muted",
          )}
        >
          Tous
        </button>
        {tags.map((tag) => {
          const isActive = active.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              aria-pressed={isActive}
              data-accent={tag.accent}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                pillBase,
                isActive
                  ? "bg-[var(--accent-light)] text-[var(--accent-dark)] ring-1 ring-current/20"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {tag.label}
            </button>
          );
        })}
        {active.size > 0 && (
          <button
            type="button"
            onClick={() => setActiveTags(new Set())}
            className={cn(
              pillBase,
              "ml-1 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  );
}
