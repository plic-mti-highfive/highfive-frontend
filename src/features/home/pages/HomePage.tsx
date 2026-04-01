'use client'

import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { ProjectCarouselSection } from '../components/ProjectCarouselSection'
import { MOCK_TRENDING, MOCK_POPULAR, MOCK_RECENT } from '../data/mockProjects'

export default function HomePage() {
  const trending = MOCK_TRENDING
  const popular = MOCK_POPULAR
  const recent = MOCK_RECENT

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f0ebe3] text-foreground">
        <ProjectCarouselSection
          title="Trending Projects"
          subtitle="Take a glimpse of the most interesting projects right now!"
          projects={trending}
          cardSide="right"
          autoplayKey="trending"
        />
        <ProjectCarouselSection
          title="Popular Projects"
          subtitle="See the projects that made the biggest impact on this platform!"
          projects={popular}
          cardSide="left"
          autoplayKey="popular"
        />
        <ProjectCarouselSection
          title="Recent Projects"
          subtitle="See the newer projects just made by the community!"
          projects={recent}
          cardSide="right"
          autoplayKey="recent"
        />
      </main>
      <Footer />
    </>
  )
}
