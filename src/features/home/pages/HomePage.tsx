'use client'

import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { FeaturedLayout } from '../components/FeaturedLayout'
import { Section } from '../components/Section'
import { TagNavBar } from '../components/TagNavBar'
import { FEATURED, RECOMMENDED, TRENDING, SUCCESSFUL, RECENT, ENDING_SOON } from '../data/mockProjects'

export default function HomePage() {
  return (
    <>
      <Header />
      <TagNavBar />
      <div className="bg-[var(--color-cream)]" style={{ height: '2.75rem' }} />
      <main className="relative z-0 min-h-screen bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <FeaturedLayout hero={FEATURED} picks={RECOMMENDED.slice(0, 4)} />
          <Section label="recommended" title="Recommandés" projects={RECOMMENDED} />
          <Section label="trending" title="Projets tendance" projects={TRENDING} />
          <Section label="ending-soon" title="Se terminent bientôt" projects={ENDING_SOON} cols={3} />
          <Section label="successful" title="Projets qui ont réussi" projects={SUCCESSFUL} />
          <Section label="recent" title="Projets récents" projects={RECENT} />
          <div className="pb-20" />
        </div>
      </main>
      <Footer />
    </>
  )
}
