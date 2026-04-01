import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAG_COLORS } from '../utils/tagColors'

const NAV_TAGS = [
  'Web', 'IA / ML', 'Open Source',
  'Hardware', 'Environnement', 'Éducation',
  'Art', 'Social', 'Data',
]

export function TagNavBar() {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="sticky top-0 z-10 bg-[#f0ebe3]/96 backdrop-blur-md border-b border-[#ddd5c8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
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
                  relative px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0
                  ${isActive
                    ? `${colors} ring-1 ring-current/20`
                    : 'text-gray-500 hover:text-gray-800 hover:bg-black/5'
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
