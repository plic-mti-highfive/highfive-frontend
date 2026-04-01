import { Search } from 'lucide-react'
import { useState } from 'react'
import { SearchResultsDropdown } from './SearchResultsDropdown'

type SearchBarProps = {
  navigate: (to: string) => void
}

export function SearchBar({ navigate }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-dark pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des projets, utilisateurs..."
          className="
            w-full rounded-lg border border-cream-mid bg-white pl-10 pr-6 py-2.5
            text-body-md text-ink placeholder-ink-muted
            focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent
            transition-all shadow-sm
          "
        />

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
