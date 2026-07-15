import { Avatar } from "./Avatar";

const SIZES = {
  sm: { avatar: "xs", label: "text-xs" },
  md: { avatar: "sm", label: "text-sm" },
  lg: { avatar: "md", label: "text-sm" },
} as const;

export function AuthorChip({
  author,
  size = "sm",
  avatarUrl,
  onClick,
}: {
  author: string;
  size?: keyof typeof SIZES;
  avatarUrl?: string;
  onClick?: () => void;
}) {
  if (!author) return null;
  const { avatar, label } = SIZES[size];

  return (
    <div
      className={`flex items-center gap-1.5 w-fit ${onClick ? "cursor-pointer group/author" : ""}`}
      onClick={
        onClick &&
        ((e) => {
          e.stopPropagation();
          onClick();
        })
      }
    >
      <Avatar name={author} avatarUrl={avatarUrl} size={avatar} />
      <span
        className={`${label} text-foreground font-medium ${onClick ? "group-hover/author:underline" : ""}`}
      >
        @{author}
      </span>
    </div>
  );
}
