import { useTags } from "@/api/queries/tags";
import { Skeleton, TagPill } from "@shared/ui";
import { cn } from "@shared/lib/cn";

const MAX_INTERESTS = 10;

export interface InterestsPickerProps {
  value: string[];
  onChange: (interests: string[]) => void;
}

/**
 * Selection des centres d'interet (doc 04 §2 : 0 a 10 tags, liste fermee —
 * meme liste que les tags de projet, R-T1/R-T2). Pas de saisie libre.
 */
export function InterestsPicker({ value, onChange }: InterestsPickerProps) {
  const tags = useTags();

  function toggle(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
      return;
    }
    if (value.length >= MAX_INTERESTS) return;
    onChange([...value, tagId]);
  }

  if (tags.isLoading) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-16 rounded-pill" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {(tags.data ?? []).map((tag) => {
          const selected = value.includes(tag.id);
          const disabled = !selected && value.length >= MAX_INTERESTS;
          return (
            <TagPill
              key={tag.id}
              label={tag.label}
              accent={tag.accent}
              onClick={disabled ? undefined : () => toggle(tag.id)}
              className={cn(
                "border transition-colors",
                selected
                  ? "border-current"
                  : "border-transparent opacity-60 hover:opacity-100",
                disabled && "cursor-not-allowed opacity-30 hover:opacity-30",
              )}
            />
          );
        })}
      </div>
      <p className="text-body-sm text-muted-foreground">
        {value.length}/{MAX_INTERESTS} thèmes choisis
      </p>
    </div>
  );
}
