"use client";

import { Link } from "react-router-dom";
import { Header } from "@features/layout";
import { Footer } from "@features/layout";
import { FeaturedLayout } from "../components/FeaturedLayout";
import { ProjectFeedSection } from "../components/ProjectFeedSection";
import { ProfilePanel } from "../components/ProfilePanel";
import { TrendingUsersPanel } from "../components/TrendingUsersPanel";
import { TrendingTagsPanel } from "../components/TrendingTagsPanel";
import { TagNavBar } from "../components/TagNavBar";
import { HomePageSkeleton } from "../components/HomePageSkeleton";
import { useHomeTrendingAndRecommended } from "../hooks/useHomeTrendingAndRecommended";
import { useHomeProjects } from "../hooks/useHomeProjects";
import { useAuth } from "@shared/contexts";

const SIDEBAR_STICKY_TOP = "6.25rem";

export default function HomePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  // Fetch other project categories from client-side logic
  const {
    featured,
    endingSoon,
    successful,
    recent,
    isLoading: homeProjectsLoading,
    error: homeProjectsError,
  } = useHomeProjects();

  // Fetch trending and recommended from IA backend
  const {
    trending,
    recommended,
    isLoading: iaLoading,
    error: iaError,
  } = useHomeTrendingAndRecommended();

  const isLoading = homeProjectsLoading || iaLoading;
  const error = homeProjectsError || iaError;

  const allLoadedProjects = [
    ...(featured ? [featured] : []),
    ...recommended,
    ...trending,
    ...endingSoon,
    ...successful,
    ...recent,
  ];

  if (isAuthLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background" />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-3xl font-bold text-primary mb-4">
              Bienvenue sur HighFive!
            </h1>
            <p className="text-ink-muted mb-8">
              Connectez-vous pour découvrir et rejoindre des projets.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
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
                  title="Recommandés"
                  projects={recommended}
                />
                <ProjectFeedSection
                  title="Projets tendance"
                  projects={trending}
                />
                <ProjectFeedSection
                  title="Se terminent bientôt"
                  projects={endingSoon}
                />
                <ProjectFeedSection
                  title="Projets qui ont réussi"
                  projects={successful}
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
      <Footer />
    </>
  );
}
