import { useState } from "react";
import { EmptyState, Input, Spinner, TagPill } from "@shared/ui";
import { useTags } from "@/api/queries/tags";

/**
 * Selection de tags dans la liste fermee (R-T1/R-T2, doc 04 §7) : jamais de
 * saisie libre. Reutilise a la creation et a l'edition en place.
 */
export function TagPicker({
  selected,
  onChange,
  max = 5,
  searchable = false,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return <Spinner size="sm" />;
  }
  if (!tags || tags.length === 0) {
    return <EmptyState title="Aucun thème disponible pour l'instant." />;
  }

  const visible =
    searchable && query.trim()
      ? tags.filter((t) =>
          t.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : tags;

  function toggle(tagId: string) {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else if (selected.length < max) {
      onChange([...selected, tagId]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {searchable && (
        <Input
          placeholder="Rechercher un thème…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {visible.map((tag) => {
          const active = selected.includes(tag.id);
          return (
            <TagPill
              key={tag.id}
              label={tag.label}
              accent={tag.accent}
              onClick={() => toggle(tag.id)}
              className={active ? "ring-1 ring-current" : "opacity-60"}
            />
          );
        })}
      </div>
      <p className="text-body-sm text-muted-foreground">
        {selected.length} / {max} thèmes sélectionnés
      </p>
    </div>
  );
}
