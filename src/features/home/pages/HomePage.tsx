import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Divider,
  EmptyState,
  ErrorState,
  Section,
  Spinner,
} from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useDiscoverFeed } from "@/api/queries/search";
import { TagFilterBar } from "../components/TagFilterBar";
import { DiscoverSectionBlock } from "../components/DiscoverSectionBlock";
import { SuggestedPeoplePanel } from "../components/SuggestedPeoplePanel";
import { TrendingTagsPanel } from "../components/TrendingTagsPanel";
import { FeedSkeleton } from "../components/FeedSkeleton";

/**
 * Découvrir (doc 12 E-01, V2 retour utilisateur "Découvrir connecté trop
 * pauvre") : public ET connecté, contenu différent, plusieurs sections
 * distinctes et non vides plutôt qu'un unique "Pour toi" clairsemé
 * (voir `DiscoverSectionBlock`, `docs/v2/API-ROUTES.md`). "Le projet du
 * moment" hors sections. La barre de thèmes ne filtre plus cette page
 * (V2 item 3) : elle navigue vers `/recherche`.
 */
export default function HomePage() {
  useDocumentTitle("Découvrir");
  const navigate = useNavigate();
  const { isLoading: authLoading } = useCurrentUser();
  const feed = useDiscoverFeed();

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isFirstLoad = feed.isLoading;
  const showEmpty =
    !isFirstLoad &&
    !feed.isError &&
    !feed.data?.moment &&
    (feed.data?.sections.length ?? 0) === 0;

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
          <EmptyState
            title="Il n'y a encore rien ici. Tu peux être le premier."
            action={
              <Button onClick={() => navigate("/projets/nouveau")}>
                Créer un projet
              </Button>
            }
          />
        ) : (
          <div className="flex items-start gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-9">
              {feed.data?.moment && (
                <>
                  <Section title="Le projet du moment">
                    <ProjectCard
                      project={feed.data.moment}
                      variant="featured"
                    />
                  </Section>
                  {(feed.data.sections.length ?? 0) > 0 && <Divider />}
                </>
              )}

              {feed.data?.sections.map((section, i) => (
                <React.Fragment key={section.id}>
                  <DiscoverSectionBlock section={section} />
                  {i < (feed.data?.sections.length ?? 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </div>

            <aside className="sticky top-shell-sticky hidden w-72 shrink-0 flex-col gap-6 self-start lg:flex">
              <div className="flex flex-col gap-6 rounded-[--radius-xl] border border-[--border] bg-card p-6 shadow-[--shadow-rest]">
                <SuggestedPeoplePanel />
                <TrendingTagsPanel />
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
