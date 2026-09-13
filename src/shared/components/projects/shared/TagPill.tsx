import { TagPill as TagPillPrimitive } from "@shared/ui";

/**
 * Délègue à la primitive `TagPill` de `@shared/ui` (accent déterministe via
 * `getAccent`, tokens uniquement). Conservé pour ne pas casser les appelants
 * existants (HeroCard, ProjectFeedCard, ProjectHeader, TrendingTagsPanel…).
 */
export function TagPill({
  tag,
  size = "sm",
  onClick,
}: {
  tag: string;
  size?: "sm" | "xs";
  onClick?: () => void;
}) {
  return <TagPillPrimitive label={tag} size={size} onClick={onClick} />;
}
