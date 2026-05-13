'use client'

import { Link } from 'react-router-dom'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { FeaturedLayout } from '../components/FeaturedLayout'
import { Section } from '../components/Section'
import { TagNavBar } from '../components/TagNavBar'
import { HomePageSkeleton } from '../components/HomePageSkeleton'
import { useHomeProjects } from '../hooks/useHomeProjects'
import { useAuth } from '@/contexts'

export default function HomePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const {
    featured,
    recommended,
    trending,
    endingSoon,
    successful,
    recent,
    isLoading,
    error,
  } = useHomeProjects()

  if (isAuthLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background" />
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <h1 className="text-3xl font-bold text-ink mb-4">Bienvenue sur HighFive!</h1>
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
    )
  }

  return (
    <>
      <Header />
      <TagNavBar />
      <div className="bg-background" style={{ height: '2.75rem' }} />
      <main className="relative z-0 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6">
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
                      <p>Mode API: {import.meta.env.VITE_API_MODE || 'mock'}</p>
                      <p>URL API: {import.meta.env.VITE_API_URL || 'N/A'}</p>
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
                En mode dégradé. Vérifiez que le backend est lancé ou passez en mode mock.
              </p>
              <p className="text-sm text-ink-muted mt-2">
                Pour mode mock: <code className="bg-cream-dark px-2 py-1 rounded">VITE_API_MODE=mock</code>
              </p>
            </div>
          ) : (
            <>
              {featured && <FeaturedLayout hero={featured} picks={recommended.slice(0, 4)} />}
              <Section title="Recommandés" projects={recommended} />
              <Section title="Projets tendance" projects={trending} />
              <Section title="Se terminent bientôt" projects={endingSoon} />
              <Section title="Projets qui ont réussi" projects={successful} />
              <Section title="Projets récents" projects={recent} />
              <div className="pb-20" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
