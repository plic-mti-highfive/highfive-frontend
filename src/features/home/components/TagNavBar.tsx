import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAG_COLORS } from '@shared/components/projects'

const NAV_TAGS = [
  'Web', 'IA / ML', 'Open Source',
  'Hardware', 'Environnement', 'Éducation',
  'Art', 'Social', 'Data',
]

export function TagNavBar() {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div
      className={`fixed left-0 right-0 z-10 bg-ink-soft border-b border-ink-muted`}
      style={{
        top: '3.5rem',
        height: '2.75rem',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-1 scrollbar-none py-1">
          {NAV_TAGS.map((tag) => {
            const isActive = active === tag
            const colors = TAG_COLORS[tag] ?? ''
            return (
              <button
                key={tag}
                onClick={() => {
                  setActive(isActive ? null : tag)
                  navigate(`/search?tag=${encodeURIComponent(tag)}`)
                }}
                className={`
                  relative px-3.5 py-2 rounded-full text-[14px] font-bold transition-all duration-150 whitespace-nowrap shrink-0
                  ${isActive
                    ? `${colors} ring-1 ring-current/20`
                    : 'text-white hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
