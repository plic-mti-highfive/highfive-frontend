import { useEffect, useState } from "react";

import { Avatar, Spinner } from "@shared/ui";
import { useSearch } from "@/api/queries/search";

const sectionTitleCls =
  "px-3 py-1.5 text-label uppercase tracking-wide text-muted-foreground";
const resultItemCls =
  "flex w-full items-center gap-3 px-3 py-2 text-left outline-none transition-colors duration-fast hover:bg-muted";

interface SearchResultsDropdownProps {
  query: string;
  navigate: (to: string) => void;
}

/** Apercu rapide (en-tete, doc 06 §3.1) : quelques projets et personnes, "Voir tout" renvoie vers `/recherche`. */
export function SearchResultsDropdown({
  query,
  navigate,
}: SearchResultsDropdownProps) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const { data, isLoading } = useSearch({
    q: debounced,
    types: ["projects", "users"],
    limit: 4,
  });

  const projects = data?.projects?.items ?? [];
  const users = data?.users?.items ?? [];
  const isEmpty = !isLoading && projects.length === 0 && users.length === 0;

  return (
    <div className="py-1.5">
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <>
          <p className={sectionTitleCls}>Projets</p>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={resultItemCls}
              onClick={() => navigate(`/projets/${project.slug}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-foreground">
                  {project.title}
                </p>
                <p className="truncate text-body-sm text-muted-foreground">
                  {project.tagline}
                </p>
              </div>
            </button>
          ))}
        </>
      )}

      {!isLoading && users.length > 0 && (
        <>
          <p className={sectionTitleCls}>Personnes</p>
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className={resultItemCls}
              onClick={() => navigate(`/u/${user.username}`)}
            >
              <Avatar
                name={user.displayName ?? user.username}
                src={user.avatar}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-body-md font-medium text-foreground">
                  {user.displayName ?? user.username}
                </p>
                <p className="truncate text-body-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </button>
          ))}
        </>
      )}

      {!isLoading && (projects.length > 0 || users.length > 0) && (
        <button
          type="button"
          className={`${resultItemCls} justify-center text-body-sm font-semibold text-foreground`}
          onClick={() => navigate(`/recherche?q=${encodeURIComponent(query)}`)}
        >
          Voir tous les résultats
        </button>
      )}

      {isEmpty && (
        <p className="px-4 py-6 text-center text-body-sm text-muted-foreground">
          Aucun résultat pour « {query} »
        </p>
      )}
    </div>
  );
}
