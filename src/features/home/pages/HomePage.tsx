import { useNavigate } from "react-router-dom";

import { Button, EmptyState, ErrorState, Section, Spinner } from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useDiscoverFeed } from "@/api/queries/search";
import { TagFilterBar } from "../components/TagFilterBar";
import { DiscoverSectionBlock } from "../components/DiscoverSectionBlock";
import { CreateProjectCta } from "../components/CreateProjectCta";
import { FeedSkeleton } from "../components/FeedSkeleton";
import type { DiscoverSection, DiscoverSectionId } from "@/domain";

/**
 * Ordre d'affichage volontairement distinct de l'ordre serveur (V2, retour
 * util. "donner du rythme") : "Pour toi" juste après le projet du moment,
 * `near_your_projects` masquée (redondante avec "Pour toi" côté Découvrir).
 */
const SECTION_DISPLAY_ORDER: DiscoverSectionId[] = [
  "for_you",
  "trending_highfives",
  "needs_help",
  "starting",
];

function orderedSections(sections: DiscoverSection[]): DiscoverSection[] {
  return SECTION_DISPLAY_ORDER.map((id) =>
    sections.find((section) => section.id === id),
  ).filter((section): section is DiscoverSection => Boolean(section));
}

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
          <div className="flex flex-col gap-9">
            {feed.data?.moment && (
              <Section title="Le projet du moment" titleSize="lg">
                <ProjectCard project={feed.data.moment} variant="hero" />
              </Section>
            )}

            {orderedSections(feed.data?.sections ?? []).map((section) => (
              <DiscoverSectionBlock key={section.id} section={section} />
            ))}

            <CreateProjectCta />
          </div>
        )}
      </main>
    </>
  );
}
