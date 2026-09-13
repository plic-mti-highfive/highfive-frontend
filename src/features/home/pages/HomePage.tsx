"use client";

import { FeaturedLayout } from "../components/FeaturedLayout";
import { ProjectFeedSection } from "../components/ProjectFeedSection";
import { ProfilePanel } from "../components/ProfilePanel";
import { TrendingUsersPanel } from "../components/TrendingUsersPanel";
import { TrendingTagsPanel } from "../components/TrendingTagsPanel";
import { TagNavBar } from "../components/TagNavBar";
import { HomePageSkeleton } from "../components/HomePageSkeleton";
import { useHomeFeed } from "../hooks/useHomeFeed";
import { useAuth } from "@shared/contexts";

const SIDEBAR_STICKY_TOP = "6.25rem";

export default function HomePage() {
  const { isLoading: isAuthLoading } = useAuth();
  // Fetch other project categories from client-side logic
  // Une seule source pour tout le fil : sections deduplquees entre elles et
  // erreur limitee au service projets. Une panne du service de recommandation,
  // qui n'alimente que deux sections, faisait auparavant basculer la page
  // entiere en ecran d'erreur alors que les projets etaient bien charges.
  const {
    featured,
    recommended,
    trending,
    popular,
    active,
    recent,
    isLoading,
    error,
  } = useHomeFeed();

  const allLoadedProjects = [
    ...(featured ? [featured] : []),
    ...recommended,
    ...trending,
    ...popular,
    ...active,
    ...recent,
  ];

  if (isAuthLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  // R-V1/doc 06 §5 : Decouvrir montre de vrais projets, connecte ou non — la
  // page "Bienvenue sur HighFive!" (deux boutons, aucun contenu) est
  // explicitement supprimee par la refonte v2 (doc 17 §4, textes interdits).
  return (
    <>
      <TagNavBar />
      <div className="bg-background" style={{ height: "2.75rem" }} />
      <main className="relative z-0 min-h-screen bg-background">
        <div className="max-w-[100rem] mx-auto px-8 2xl:px-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl font-bold">!</span>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-1">
                    Impossible de charger les projets
                  </h3>
                  <p className="text-red-700 text-sm mb-2">{error.message}</p>
                  <details className="text-xs text-red-600">
                    <summary className="cursor-pointer hover:underline">
                      Informations de debug
                    </summary>
                    <div className="mt-2 p-2 bg-red-100 rounded font-mono">
                      <p>Mode API: {import.meta.env.VITE_API_MODE || "mock"}</p>
                      <p>URL API: {import.meta.env.VITE_API_URL || "N/A"}</p>
                      <p>Erreur: {error.stack || error.message}</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <HomePageSkeleton />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-ink-muted">
                En mode dégradé. Vérifiez que le backend est lancé ou passez en
                mode mock.
              </p>
              <p className="text-sm text-ink-muted mt-2">
                Pour mode mock:{" "}
                <code className="bg-cream-dark px-2 py-1 rounded">
                  VITE_API_MODE=mock
                </code>
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-10 py-10">
              {/* LEFT: profil */}
              <aside
                className="hidden xl:block w-[260px] shrink-0 sticky self-start"
                style={{ top: SIDEBAR_STICKY_TOP }}
              >
                <ProfilePanel />
              </aside>

              {/* CENTER: fil */}
              <div className="flex-1 min-w-0 flex flex-col gap-11 xl:px-10 xl:border-x xl:border-border">
                {featured && <FeaturedLayout hero={featured} />}
                <ProjectFeedSection
                  title="Recommandés pour vous"
                  projects={recommended}
                />
                <ProjectFeedSection
                  title="Projets tendance"
                  projects={trending}
                />
                <ProjectFeedSection
                  title="Les plus soutenus"
                  projects={popular}
                />
                <ProjectFeedSection
                  title="Les plus grandes équipes"
                  projects={active}
                />
                <ProjectFeedSection title="Projets récents" projects={recent} />
              </div>

              {/* RIGHT: tendances */}
              <aside
                className="hidden xl:flex w-[280px] shrink-0 flex-col gap-9 sticky self-start"
                style={{ top: SIDEBAR_STICKY_TOP }}
              >
                <TrendingUsersPanel />
                <TrendingTagsPanel projects={allLoadedProjects} />
              </aside>
            </div>
          )}

          <div className="pb-20" />
        </div>
      </main>
    </>
  );
}
