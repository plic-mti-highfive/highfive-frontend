import { EmptyState, Spinner, TagPill } from "@shared/ui";
import { useTags } from "@/api/queries/tags";

/**
 * Selection de tags dans la liste fermee (R-T1/R-T2, doc 04 §7) : jamais de
 * saisie libre. Reutilise a la creation et a l'edition en place.
 */
export function TagPicker({
  selected,
  onChange,
  max = 5,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}) {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return <Spinner size="sm" />;
  }
  if (!tags || tags.length === 0) {
    return <EmptyState title="Aucun thème disponible pour l'instant." />;
  }

  function toggle(tagId: string) {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else if (selected.length < max) {
      onChange([...selected, tagId]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
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
        {selected.length} / {max} thèmes
      </p>
    </div>
  );
}
