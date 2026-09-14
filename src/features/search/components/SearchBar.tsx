import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Popover } from "@base-ui/react/popover";

import { Input } from "@shared/ui";
import { preloadSearch } from "@/app/preload";
import { SearchResultsDropdown } from "./SearchResultsDropdown";

interface SearchBarProps {
  navigate: (to: string) => void;
}

const RESULTS_ID = "search-results-popup";

/**
 * Recherche de l'en-tete (doc 06 §3.1). Conserve la meme signature
 * `{ navigate }` : appelee directement par `SiteHeader` (hors perimetre).
 *
 * V2, retour util. 2 : le popup de resultats passait sous la sous-barre de
 * themes (`TagFilterBar`, sticky) et demarrait a une position approximative.
 * Cause : un `absolute` positionne dans le contexte d'empilement de
 * l'en-tete (lui-meme `position: sticky` + `z-sticky`), donc plafonne au
 * niveau de l'en-tete quel que soit son propre `z-dropdown` interne — un
 * z-index "eleve" a l'interieur d'un ancetre positionne ne s'en echappe
 * jamais. Remplace par un `Popover` base-ui (ancre sur le champ via
 * `anchor`, portale dans `document.body`) : plus aucun ancetre ne borne son
 * empilement, `z-dropdown` (30) se compare alors reellement a `z-sticky`
 * (20) au niveau du document entier.
 */
export function SearchBar({ navigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showResults = open && Boolean(query.trim());

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
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
      />
      <Popover.Root open={showResults} onOpenChange={setOpen}>
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(Boolean(query.trim()));
            void preloadSearch();
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
          aria-expanded={showResults}
          aria-controls={RESULTS_ID}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <Popover.Portal>
          <Popover.Positioner
            anchor={inputRef}
            side="bottom"
            align="start"
            sideOffset={8}
            className="z-dropdown w-96"
          >
            <Popover.Popup
              id={RESULTS_ID}
              initialFocus={false}
              finalFocus={inputRef}
              className="max-h-96 overflow-y-auto rounded-xl border border-border bg-background shadow-overlay outline-none transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
            >
              <SearchResultsDropdown query={query.trim()} navigate={goTo} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {query && (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onMouseDown={(event) => {
            // `onMouseDown` plutot que `onClick` : passe avant le `blur` du champ.
            event.preventDefault();
            setQuery("");
          }}
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
