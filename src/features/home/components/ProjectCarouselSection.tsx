import type { Project } from '@shared/types'
import { AnimatedCard } from './AnimatedCard'
import { CarouselDots } from './CarouselDots'
import { ArrowButton } from './ArrowButton'
import { useCarousel } from '../hooks/useCarousel'

const AUTOPLAY_DELAYS: Record<string, number> = {
  trending: 4000,
  popular: 5500,
  recent: 7000,
}

interface SectionProps {
  title: string
  subtitle: string
  projects: Project[]
  cardSide: 'left' | 'right'
  autoplayKey: string
}

export function ProjectCarouselSection({ title, subtitle, projects, cardSide, autoplayKey }: SectionProps) {
  const carousel = useCarousel(projects, AUTOPLAY_DELAYS[autoplayKey] ?? 5000)

  const titleBlock = (
    <div
      className={`flex-shrink-0 w-56 flex flex-col justify-center ${
        cardSide === 'right' ? 'items-start text-left' : 'items-end text-right'
      }`}
    >
      <h2 className="text-4xl font-black text-gray-900 leading-tight mb-3">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )

  const cardBlock = (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <ArrowButton onClick={carousel.prev} label="Précédent">‹</ArrowButton>

      <div className="flex-1 min-w-0">
        <AnimatedCard
          project={carousel.current}
          animating={carousel.animating}
          direction={carousel.direction}
        />
        <CarouselDots count={carousel.total} active={carousel.index} onSelect={carousel.goTo} />
      </div>

      <ArrowButton onClick={carousel.next} label="Suivant">›</ArrowButton>
    </div>
  )

  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-4xl mx-auto flex items-center gap-10">
        {cardSide === 'right' ? (
          <>{titleBlock}{cardBlock}</>
        ) : (
          <>{cardBlock}{titleBlock}</>
        )}
      </div>
    </section>
  )
}
