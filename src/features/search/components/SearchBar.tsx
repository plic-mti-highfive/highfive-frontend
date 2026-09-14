import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@shared/ui";
import { SearchResultsDropdown } from "./SearchResultsDropdown";

interface SearchBarProps {
  navigate: (to: string) => void;
}

/**
 * Recherche de l'en-tete (doc 06 §3.1). Conserve la meme signature
 * `{ navigate }` : appelee directement par `SiteHeader` (hors perimetre).
 */
export function SearchBar({ navigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function goToResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/recherche?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
    setOpen(false);
  }

  function goTo(to: string) {
    navigate(to);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative w-96">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(Boolean(query.trim()))}
        onBlur={() => {
          // Laisse le temps a un clic sur un resultat d'aboutir avant de fermer.
          blurTimeout.current = setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") goToResults();
          if (event.key === "Escape") {
            setQuery("");
            setOpen(false);
          }
        }}
        placeholder="Rechercher des projets, des personnes…"
        className="pl-9 pr-8"
        aria-label="Rechercher"
      />
      {query && (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onMouseDown={(event) => {
            // `onMouseDown` plutot que `onClick` : passe avant le `blur` du champ.
            event.preventDefault();
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
            setQuery("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-dropdown mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-background shadow-overlay">
          <SearchResultsDropdown query={query.trim()} navigate={goTo} />
        </div>
      )}
    </div>
  );
}
