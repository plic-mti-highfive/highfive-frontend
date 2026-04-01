import type { Project } from '@shared/types'
import { HeroCard } from './HeroCard'
import { SmallCard } from './SmallCard'

interface FeaturedLayoutProps {
  hero: Project
  picks: Project[]
}

export function FeaturedLayout({ hero, picks }: FeaturedLayoutProps) {
  return (
    <section className="mb-6 pb-16 border-b border-[#ddd5c8]/60">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-1">Mis en avant</p>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Projet de la semaine</h2>
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
