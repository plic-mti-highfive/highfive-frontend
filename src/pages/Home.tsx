'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Footer from '@/components/Footer'
import Header from '@/components/Header'


export interface Project {
  id: number | string
  name: string
  description: string
}

const MOCK_TRENDING: Project[] = [
  { id: 1, name: "EcoTrack", description: "Une plateforme collaborative pour suivre et réduire son empreinte carbone au quotidien, avec des défis communautaires." },
  { id: 2, name: "OpenLibrary", description: "Un projet open source pour numériser et partager des livres rares dans une bibliothèque accessible à tous." },
  { id: 3, name: "MeshCity", description: "Réseau mesh décentralisé pour connecter les quartiers sans passer par un FAI traditionnel." },
  { id: 4, name: "CropSense", description: "Capteurs IoT open hardware pour optimiser l'irrigation et la fertilisation dans les petites exploitations agricoles." },
  { id: 5, name: "LangBridge", description: "Application de traduction communautaire pour les langues rares non couvertes par les outils grand public." },
]

const MOCK_POPULAR: Project[] = [
  { id: 6, name: "PixelForge", description: "Éditeur graphique collaboratif en temps réel, open source et orienté pixel art et design UI." },
  { id: 7, name: "DataCommons", description: "Entrepôt de datasets publics annotés par la communauté pour entraîner des modèles ML éthiques." },
  { id: 8, name: "SoundWeave", description: "Plateforme de composition musicale collaborative où chaque utilisateur peut contribuer une piste." },
  { id: 9, name: "MicroGrid", description: "Logiciel de gestion d'énergie pour micro-réseaux solaires dans les zones rurales." },
  { id: 10, name: "AgroBot", description: "Robot agricole open source contrôlable à distance, conçu pour les petites surfaces cultivées." },
]

const MOCK_RECENT: Project[] = [
  { id: 11, name: "VoxPoll", description: "Outil de sondage décentralisé et anonyme basé sur la blockchain pour des consultations publiques fiables." },
  { id: 12, name: "HealthMesh", description: "Réseau de partage de données médicales anonymisées pour la recherche sur les maladies rares." },
  { id: 13, name: "TerraMind", description: "Jeu de stratégie éducatif sur la gestion environnementale, développé en open source par la communauté." },
  { id: 14, name: "CodeMentor", description: "Plateforme de mentorat technique peer-to-peer pour débutants en programmation dans les pays en développement." },
  { id: 15, name: "WasteMap", description: "Cartographie collaborative des dépôts sauvages et des points de collecte alternatifs dans les villes." },
]


const AUTOPLAY_DELAYS: Record<string, number> = {
  trending: 4000,
  popular:  5500,
  recent:   7000,
}


type Direction = 'left' | 'right'

function useCarousel(items: Project[], autoplayMs: number) {
  const [index, setIndex]       = useState(0)
  const [direction, setDirection] = useState<Direction>('right')
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useCallback((newIndex: number, dir: Direction) => {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    // Laisse le temps à l'animation "sortie" de se jouer (150ms), puis change l'index
    setTimeout(() => {
      setIndex(newIndex)
      setAnimating(false)
    }, 150)
  }, [animating])

  const prev = useCallback(() => {
    navigate((index - 1 + items.length) % items.length, 'left')
  }, [index, items.length, navigate])

  const next = useCallback(() => {
    navigate((index + 1) % items.length, 'right')
  }, [index, items.length, navigate])

  const goTo = useCallback((i: number) => {
    navigate(i, i > index ? 'right' : 'left')
  }, [index, navigate])

  // Autoplay — se réinitialise à chaque interaction manuelle
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDirection('right')
      setAnimating(true)
      setTimeout(() => {
        setIndex(i => (i + 1) % items.length)
        setAnimating(false)
      }, 150)
    }, autoplayMs)
  }, [items.length, autoplayMs])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Réinitialise le timer si l'utilisateur interagit manuellement
  const prevWithReset = useCallback(() => { prev(); resetTimer() }, [prev, resetTimer])
  const nextWithReset = useCallback(() => { next(); resetTimer() }, [next, resetTimer])
  const goToWithReset = useCallback((i: number) => { goTo(i); resetTimer() }, [goTo, resetTimer])

  return {
    current: items[index],
    index,
    direction,
    animating,
    prev: prevWithReset,
    next: nextWithReset,
    goTo: goToWithReset,
    total: items.length,
  }
}


function AnimatedCard({
  project,
  animating,
  direction,
}: {
  project: Project
  animating: boolean
  direction: Direction
}) {
  const exitX   = direction === 'right' ? '-translate-x-6' : 'translate-x-6'
  const enterX  = direction === 'right' ? 'translate-x-6'  : '-translate-x-6'

  return (
    <div
      className={`
        bg-white rounded-2xl p-7 shadow-sm w-full flex flex-col justify-start
        transition-all duration-300 ease-in-out
        ${animating
          ? `opacity-0 ${exitX} scale-[0.97]`
          : `opacity-100 translate-x-0 scale-100`
        }
      `}
      style={{ minHeight: '9rem' }}
    >
      <h3 className="font-bold text-xl mb-3 text-gray-900">{project.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
    </div>
  )
}


function CarouselDots({
  count,
  active,
  onSelect,
}: {
  count: number
  active: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex gap-2 justify-center mt-5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Aller au projet ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? 'bg-blue-500 w-5 h-2.5'          // dot actif : allongé
              : 'bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5'
          }`}
        />
      ))}
    </div>
  )
}


function ArrowButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="
        flex-shrink-0 w-9 h-9 rounded-full
        flex items-center justify-center
        text-gray-400 text-2xl leading-none
        hover:text-gray-800 hover:bg-white/80 hover:scale-110 hover:shadow-sm
        active:scale-95
        transition-all duration-200
      "
    >
      {children}
    </button>
  )
}


interface SectionProps {
  title: string
  subtitle: string
  projects: Project[]
  cardSide: 'left' | 'right'
  autoplayKey: string
}

function ProjectCarouselSection({ title, subtitle, projects, cardSide, autoplayKey }: SectionProps) {
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


export default function Home() {

  const trending = MOCK_TRENDING
  const popular  = MOCK_POPULAR
  const recent   = MOCK_RECENT

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