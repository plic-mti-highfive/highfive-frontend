'use client'

import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { FeaturedLayout } from '../components/FeaturedLayout'
import { Section } from '../components/Section'
import { TagNavBar } from '../components/TagNavBar'
import { useHomeProjects } from '../hooks/useHomeProjects'

export default function HomePage() {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Erreur lors du chargement des projets: {error.message}</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <TagNavBar />
      <div className="bg-[var(--color-cream)]" style={{ height: '2.75rem' }} />
      <main className="relative z-0 min-h-screen bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-6 pt-10">
          {isLoading ? (
            <div className="text-center py-20">
              <p>Chargement des projets...</p>
            </div>
          ) : (
            <>
              {featured && <FeaturedLayout hero={featured} picks={recommended.slice(0, 4)} />}
              <Section label="recommended" title="Recommandés" projects={recommended} />
              <Section label="trending" title="Projets tendance" projects={trending} />
              <Section label="ending-soon" title="Se terminent bientôt" projects={endingSoon} cols={3} />
              <Section label="successful" title="Projets qui ont réussi" projects={successful} />
              <Section label="recent" title="Projets récents" projects={recent} />
              <div className="pb-20" />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
