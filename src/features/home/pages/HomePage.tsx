import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, EmptyState, ErrorState, Section, Spinner } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useDiscoverFeed } from "@/api/queries/search";
import type { ProjectSummary } from "@/domain";
import { TagFilterBar } from "../components/TagFilterBar";
import { SuggestedPeoplePanel } from "../components/SuggestedPeoplePanel";
import { TrendingTagsPanel } from "../components/TrendingTagsPanel";
import { AboutBlock } from "../components/AboutBlock";
import { FeedSkeleton } from "../components/FeedSkeleton";

/**
 * Découvrir (doc 12 E-01, V2 item 2) : public ET connecté, contenu
 * différent (P1 — pas de page "Bienvenue"). Barre de thèmes filtrante,
 * "Le projet du moment" hors filtre, fil paginé par tranches de 12,
 * colonne d'appui optionnelle (doc 06 §3.1) absente en dessous de 1024 px.
 */
export default function HomePage() {
  useDocumentTitle("Découvrir");
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTags = (searchParams.get("tags") ?? "")
    .split(",")
    .filter(Boolean);
  const tagsKey = activeTags.join(",");

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<ProjectSummary[]>([]);
  const [liveMessage, setLiveMessage] = useState("");

  // Ajustements d'etat "pendant le rendu" plutot que via useEffect
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes) :
  // evite le rendu en cascade que `react-hooks/set-state-in-effect` signale
  // sur un simple useEffect([tagsKey])/useEffect([feed.data]).
  const [prevTagsKey, setPrevTagsKey] = useState(tagsKey);
  if (tagsKey !== prevTagsKey) {
    // Le filtre change : on reinterroge depuis le debut plutot que
    // d'empiler les pages d'un autre jeu de resultats.
    setPrevTagsKey(tagsKey);
    setCursor(undefined);
  }

  const feed = useDiscoverFeed(
    cursor,
    activeTags.length ? activeTags : undefined,
  );

  const [prevFeedData, setPrevFeedData] = useState(feed.data);
  if (feed.data !== prevFeedData) {
    setPrevFeedData(feed.data);
    if (feed.data) {
      const page = feed.data.items.items;
      setItems((prev) => (cursor ? [...prev, ...page] : page));
      if (cursor && page.length > 0) {
        setLiveMessage(`${page.length} projets supplémentaires`);
      }
    }
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams);
    params.delete("tags");
    setSearchParams(params, { replace: true });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isFirstLoad = feed.isLoading && !cursor;
  const showEmpty =
    !isFirstLoad && !feed.isError && !feed.data?.moment && items.length === 0;
  const sectionTitle = isAuthenticated
    ? "Pour toi"
    : "Ce qui se passe en ce moment";

  return (
    <>
      <TagFilterBar />
      <main className="mx-auto max-w-content px-6 py-8">
        {isFirstLoad ? (
          <FeedSkeleton />
        ) : feed.isError ? (
          <ErrorState
            message="Impossible de charger le fil pour l'instant."
            onRetry={() => feed.refetch()}
          />
        ) : showEmpty ? (
          activeTags.length > 0 ? (
            <EmptyState
              title="Aucun projet avec ces thèmes pour l'instant."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters}>
                    Retirer les filtres
                  </Button>
                  <Button onClick={() => navigate("/projets/nouveau")}>
                    Créer un projet sur ce thème
                  </Button>
                </div>
              }
            />
          ) : (
            <EmptyState
              title="Il n'y a encore rien ici. Tu peux être le premier."
              action={
                <Button onClick={() => navigate("/projets/nouveau")}>
                  Créer un projet
                </Button>
              }
            />
          )
        ) : (
          <div className="flex items-start gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-9">
              {feed.data?.moment && (
                <Section title="Le projet du moment">
                  <ProjectCard project={feed.data.moment} variant="featured" />
                </Section>
              )}

              <Section title={sectionTitle}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {items.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      variant="feed"
                    />
                  ))}
                </div>

                <div aria-live="polite" className="sr-only">
                  {liveMessage}
                </div>

                {feed.data?.items.nextCursor && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      disabled={feed.isFetching}
                      onClick={() =>
                        setCursor(feed.data?.items.nextCursor ?? undefined)
                      }
                    >
                      {feed.isFetching ? "Chargement…" : "Charger la suite"}
                    </Button>
                  </div>
                )}
              </Section>
            </div>

            <aside className="sticky top-shell-sticky hidden w-72 shrink-0 flex-col gap-9 self-start lg:flex">
              {!isAuthenticated && <AboutBlock />}
              <SuggestedPeoplePanel />
              <TrendingTagsPanel />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
