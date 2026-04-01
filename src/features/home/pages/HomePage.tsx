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
      <main className="min-h-screen bg-[#f0ebe3]">
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <FeaturedLayout hero={FEATURED} picks={RECOMMENDED.slice(0, 4)} />
          <Section label="Rien que pour toi" title="Recommandés" projects={RECOMMENDED} />
          <Section label="En ce moment" title="Projets tendance" projects={TRENDING} />
          <Section label="Dernière chance" title="Se terminent bientôt" projects={ENDING_SOON} cols={3} />
          <Section label="Objectif atteint" title="Projets qui ont réussi" projects={SUCCESSFUL} />
          <Section label="Fraîchement lancés" title="Projets récents" projects={RECENT} />
          <div className="pb-20" />
        </div>
      </main>
      <Footer />
    </>
  )
}
