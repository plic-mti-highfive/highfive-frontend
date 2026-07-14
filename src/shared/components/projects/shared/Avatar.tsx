const SIZES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
} as const;

interface AvatarProps {
  /** Nom/pseudo utilisé pour générer les initiales et la teinte de secours */
  name: string;
  avatarUrl?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * Avatar rond : image si `avatarUrl` est fourni, sinon initiales sur fond
 * teinté (couleur dérivée du nom, déterministe). Remplace les nombreuses
 * réimplémentations ad-hoc de ce même cercle (hero projet, sidebar, messages…).
 */
export function Avatar({
  name,
  avatarUrl,
  size = "sm",
  className = "",
}: AvatarProps) {
  const initials = name.slice(0, 2).toUpperCase();
  const hue = (name.charCodeAt(0) * 37) % 360;
  const sizeCls = SIZES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeCls} rounded-full object-cover shrink-0 ring-1 ring-black/10 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} rounded-full font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10 ${className}`}
      style={{
        background: `hsl(${hue} 45% 80%)`,
        color: `hsl(${hue} 45% 30%)`,
      }}
    >
      {initials}
    </div>
  );
}
