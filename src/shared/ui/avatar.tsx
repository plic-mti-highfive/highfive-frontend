import * as React from "react";

import { cn } from "@shared/lib/cn";
import { getAccent, type AccentName } from "@shared/lib/accent";

const AVATAR_SIZES = {
  xs: "size-5 text-label",
  sm: "size-6 text-label",
  md: "size-8 text-body-sm",
  lg: "size-10 text-body-sm",
  xl: "size-14 text-body-lg",
} as const;

export interface AvatarProps extends React.ComponentProps<"span"> {
  /** Nom/pseudo utilisé pour l'accessibilité, les initiales et l'accent de secours. */
  name: string;
  src?: string;
  accent?: AccentName;
  size?: keyof typeof AVATAR_SIZES;
}

function Avatar({
  name,
  src,
  accent,
  size = "sm",
  className,
  ...props
}: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const resolvedAccent = accent ?? getAccent(name);
  const initials = name.slice(0, 2).toUpperCase();
  const sizeCls = AVATAR_SIZES[size];

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className={cn(
          "rounded-full object-cover shrink-0 ring-1 ring-black/10",
          sizeCls,
          className,
        )}
      />
    );
  }

  return (
    <span
      data-slot="avatar"
      data-accent={resolvedAccent}
      title={name}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold shrink-0 ring-1 ring-black/10 bg-[var(--accent-light)] text-[var(--accent-dark)]",
        sizeCls,
        className,
      )}
      {...props}
    >
      {initials}
    </span>
  );
}

export interface AvatarGroupProps extends React.ComponentProps<"div"> {
  /** Nombre d'avatars visibles avant de replier le reste dans un badge "+N". */
  max?: number;
}

function AvatarGroup({ children, max, className, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children);
  const visible = max ? items.slice(0, max) : items;
  const overflow = max && items.length > max ? items.length - max : 0;

  return (
    <div
      data-slot="avatar-group"
      className={cn("flex items-center -space-x-2", className)}
      {...props}
    >
      {visible.map((child, i) => (
        <span key={i} className="rounded-full ring-2 ring-background">
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-label text-muted-foreground ring-2 ring-background">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
