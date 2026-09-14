import { Link } from "react-router-dom";

import { Section, Skeleton, TagPill } from "@shared/ui";
import { useTrendingTags } from "@/api/queries/search";

/** Colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01), 5 maximum. */
export function TrendingTagsPanel() {
  const { data, isLoading } = useTrendingTags();

  if (isLoading) {
    return (
      <Section title="Ce qui bouge en ce moment">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-pill" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Section title="Ce qui bouge en ce moment">
      <div className="flex flex-col gap-1">
        {data.map(({ tag, projectsCount }) => (
          <Link
            key={tag.id}
            to={`/recherche?tags=${encodeURIComponent(tag.id)}`}
            className="-mx-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors duration-fast hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <TagPill label={tag.label} accent={tag.accent} size="sm" />
            <span className="text-body-sm text-muted-foreground">
              {projectsCount} projet{projectsCount > 1 ? "s" : ""}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
