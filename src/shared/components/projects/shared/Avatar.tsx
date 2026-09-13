import { Avatar as AvatarPrimitive } from "@shared/ui";

/**
 * Délègue à la primitive `Avatar` de `@shared/ui` (initiales teintées via
 * l'accent déterministe, tokens uniquement). Conservé pour ne pas casser les
 * appelants existants (AuthorChip, ProjectSidebar…).
 */
export function Avatar({
  name,
  avatarUrl,
  size = "sm",
  className = "",
}: {
  name: string;
  avatarUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <AvatarPrimitive
      name={name}
      src={avatarUrl}
      size={size}
      className={className}
    />
  );
}
