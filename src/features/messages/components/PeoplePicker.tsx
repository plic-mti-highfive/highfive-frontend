import { useState } from "react";
import { X } from "lucide-react";
import type { UserSummary } from "@/domain";
import { useSearch } from "@/api/queries/search";
import { Avatar, Input } from "@shared/ui";

export interface PeoplePickerProps {
  selected: UserSummary[];
  onChange: (selected: UserSummary[]) => void;
  /** Personnes a ne pas proposer (soi-meme, participants deja presents). */
  excludeIds: string[];
  disabled?: boolean;
}

/** Recherche de personnes par pseudo, choisies sous forme de pastilles. */
export function PeoplePicker({
  selected,
  onChange,
  excludeIds,
  disabled,
}: PeoplePickerProps) {
  const [query, setQuery] = useState("");
  const search = useSearch({ q: query, types: ["users"] });
  const results = (search.data?.users?.items ?? []).filter(
    (user) =>
      !excludeIds.includes(user.id) &&
      !selected.some((picked) => picked.id === user.id),
  );

  return (
    <>
      {selected.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {selected.map((person) => (
            <span
              key={person.id}
              className="inline-flex items-center gap-1.5 rounded-pill bg-muted px-2 py-1 text-body-sm text-foreground"
            >
              {person.displayName ?? `@${person.username}`}
              <button
                type="button"
                aria-label={`Retirer ${person.displayName ?? person.username}`}
                onClick={() =>
                  onChange(selected.filter((p) => p.id !== person.id))
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Chercher un pseudo…"
        aria-label="Chercher une personne"
        disabled={disabled}
      />
      {query.trim() && results.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-0.5 rounded-md border border-border bg-card p-1 shadow-rest">
          {results.slice(0, 6).map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                onChange([...selected, user]);
                setQuery("");
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
            >
              <Avatar
                name={user.displayName ?? user.username}
                src={user.avatar}
                size="sm"
              />
              <span className="text-body-md text-foreground">
                {user.displayName ?? `@${user.username}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
