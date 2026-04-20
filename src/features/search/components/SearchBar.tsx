import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { SearchResultsDropdown } from './SearchResultsDropdown'

type SearchBarProps = {
  navigate: (to: string) => void
}

export function SearchBar({ navigate }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher des projets, utilisateurs..."
          className="
            w-full rounded-lg border border-cream-mid bg-white pl-10 pr-10 py-2.5
            text-body-md text-ink placeholder-ink-muted
            focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
            transition-all shadow-sm
          "
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted hover:text-ink transition-colors z-10"
            aria-label="Effacer la recherche"
          >
            <X size={20} />
          </button>
        )}

        {/* Dropdown results */}
        {searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-cream border border-cream-mid rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <SearchResultsDropdown query={searchQuery} navigate={navigate} />
          </div>
        )}
      </div>
    </div>
  )
}
