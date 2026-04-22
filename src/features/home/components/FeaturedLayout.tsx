import type { Project } from '@shared/types'
import { HeroCard, SmallCard } from '@shared/components/projects'

interface FeaturedLayoutProps {
  hero: Project
  picks: Project[]
}

export function FeaturedLayout({ hero, picks }: FeaturedLayoutProps) {
  return (
    <section className="mb-6 pb-16 pt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Projets de la semaine</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-10 items-start">
        <HeroCard project={hero} />
        <div className="grid grid-cols-2 gap-x-5 gap-y-8">
          {picks.map(p => <SmallCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  )
}
