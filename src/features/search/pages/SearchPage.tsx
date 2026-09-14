import { useNavigate, useSearchParams } from "react-router-dom";
import { FolderOpen, Tag as TagIcon, Users, X } from "lucide-react";

import {
  Avatar,
  Button,
  EmptyState,
  IconButton,
  Section,
  TagPill,
} from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import { cn } from "@shared/lib/cn";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useSearch, useTrendingTags } from "@/api/queries/search";
import { getTagById, type SearchEntityType, type SearchSort } from "@/domain";
import { SearchResultsSkeleton } from "../components/SearchResultsSkeleton";

/**
 * `/recherche` (doc 12 E-02, R-R4) : filtres dans la query string —
 * `q`, `type` (projets/personnes/tags, francais cote URL par mission), `tags`
 * (liste, comme le reste de R-R4), `tri`. Traduits ici vers les enums anglais
 * du domaine (`SearchEntityType`, `SearchSort`) au moment de l'appel API.
 */

type UrlType = "projets" | "personnes" | "tags";
type UrlSort = "recents" | "populaires" | "actifs";

const TYPE_TO_DOMAIN: Record<UrlType, SearchEntityType> = {
  projets: "projects",
  personnes: "users",
  tags: "tags",
};

const SORT_TO_DOMAIN: Record<UrlSort, SearchSort> = {
  recents: "recent",
  populaires: "popular",
  actifs: "active",
};

const TABS: { value: UrlType; label: string; icon: typeof FolderOpen }[] = [
  { value: "projets", label: "Projets", icon: FolderOpen },
  { value: "personnes", label: "Personnes", icon: Users },
  { value: "tags", label: "Thèmes", icon: TagIcon },
];

const SORTS: { value: UrlSort; label: string }[] = [
  { value: "recents", label: "Les plus récents" },
  { value: "populaires", label: "Les plus highfivés" },
  { value: "actifs", label: "Les plus actifs" },
];

function toggleCls(active: boolean) {
  return cn(
    "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-ui-md font-semibold transition-colors duration-fast outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50",
    active
      ? "bg-foreground text-background"
      : "bg-muted text-muted-foreground hover:text-foreground",
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type");
  const activeType: UrlType =
    typeParam === "personnes" || typeParam === "tags" ? typeParam : "projets";
  const activeTags = (searchParams.get("tags") ?? "")
    .split(",")
    .filter(Boolean);
  const sortParam = searchParams.get("tri");
  const activeSort: UrlSort =
    sortParam === "populaires" || sortParam === "actifs"
      ? sortParam
      : "recents";

  const hasQuery = Boolean(q.trim()) || activeTags.length > 0;

  useDocumentTitle(q ? `Résultats pour « ${q} »` : "Recherche");

  const results = useSearch({
    q: q || undefined,
    types: [TYPE_TO_DOMAIN[activeType]],
    tags: activeTags.length ? activeTags : undefined,
    sort: SORT_TO_DOMAIN[activeSort],
  });

  // R-R2 : recherche vide -> les themes les plus actifs plutot qu'un ecran blanc.
  const trendingTags = useTrendingTags();

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  function removeTag(tagId: string) {
    const next = activeTags.filter((id) => id !== tagId);
    updateParams({ tags: next.length ? next.join(",") : null });
  }

  function clearFilters() {
    updateParams({ tags: null });
  }

  const projectItems = results.data?.projects?.items ?? [];
  const userItems = results.data?.users?.items ?? [];
  const tagItems = results.data?.tags?.items ?? [];
  const resultsCount =
    activeType === "projets"
      ? (results.data?.projects?.total ?? 0)
      : activeType === "personnes"
        ? (results.data?.users?.total ?? 0)
        : (results.data?.tags?.total ?? 0);

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-heading-lg font-semibold text-foreground">
          {q ? (
            <>
              Résultats pour{" "}
              <span className="text-muted-foreground">« {q} »</span>
            </>
          ) : (
            "Recherche"
          )}
        </h1>
        {hasQuery && (
          <p aria-live="polite" className="text-body-md text-muted-foreground">
            {resultsCount} résultat{resultsCount > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {hasQuery && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={activeType === value}
                onClick={() => updateParams({ type: value })}
                className={cn(
                  toggleCls(activeType === value),
                  "flex items-center gap-1.5",
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}

            {activeType === "projets" && (
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {SORTS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={activeSort === value}
                    onClick={() =>
                      updateParams({ tri: value === "recents" ? null : value })
                    }
                    className={toggleCls(activeSort === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeTags.map((tagId) => {
                const tag = getTagById(tagId);
                return (
                  <div key={tagId} className="flex items-center gap-1">
                    <TagPill
                      label={tag?.label ?? tagId}
                      accent={tag?.accent}
                      size="sm"
                    />
                    <IconButton
                      aria-label={`Retirer le thème ${tag?.label ?? tagId}`}
                      size="xs"
                      onClick={() => removeTag(tagId)}
                    >
                      <X size={12} />
                    </IconButton>
                  </div>
                );
              })}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Effacer
              </Button>
            </div>
          )}
        </div>
      )}

      {!hasQuery ? (
        <Section title="Thèmes les plus actifs">
          {trendingTags.isLoading ? (
            <SearchResultsSkeleton />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(trendingTags.data ?? []).map(({ tag, projectsCount }) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    updateParams({ tags: tag.id, type: "projets" })
                  }
                  className="flex items-center gap-1.5 rounded-pill bg-muted px-3 py-1.5 text-ui-md text-foreground transition-colors duration-fast hover:bg-muted/70"
                >
                  <TagPill label={tag.label} accent={tag.accent} size="sm" />
                  <span className="text-body-sm text-muted-foreground">
                    {projectsCount} projet{projectsCount > 1 ? "s" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Section>
      ) : results.isLoading ? (
        <SearchResultsSkeleton />
      ) : results.isError ? (
        <EmptyState
          title="Impossible de charger les résultats"
          description="Vérifie ta connexion et réessaie."
          action={
            <Button variant="outline" onClick={() => results.refetch()}>
              Réessayer
            </Button>
          }
        />
      ) : (
        <>
          {activeType === "projets" &&
            (projectItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectItems.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant="feed"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun projet trouvé"
                description={
                  q
                    ? `Rien ne correspond à « ${q} » pour l'instant.`
                    : undefined
                }
                action={
                  <div className="flex gap-2">
                    {activeTags.length > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        Élargir la recherche
                      </Button>
                    )}
                    <Button onClick={() => navigate("/projets/nouveau")}>
                      Créer un projet sur ce sujet
                    </Button>
                  </div>
                }
              />
            ))}

          {activeType === "personnes" &&
            (userItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userItems.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => navigate(`/u/${user.username}`)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors duration-fast hover:bg-muted"
                  >
                    <Avatar
                      name={user.displayName ?? user.username}
                      src={user.avatar}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-body-lg font-semibold text-foreground">
                        {user.displayName ?? user.username}
                      </p>
                      <p className="truncate text-body-md text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Aucune personne trouvée" />
            ))}

          {activeType === "tags" &&
            (tagItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tagItems.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      updateParams({ tags: tag.id, type: "projets" })
                    }
                  >
                    <TagPill label={tag.label} accent={tag.accent} size="sm" />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Aucun thème trouvé" />
            ))}
        </>
      )}
    </div>
  );
}
