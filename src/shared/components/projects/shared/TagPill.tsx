import { getTagColor } from "@shared/utils/tagColors";

export function TagPill({
  tag,
  size = "sm",
  onClick,
}: {
  tag: string;
  size?: "sm" | "xs";
  onClick?: () => void;
}) {
  const { bg, text } = getTagColor(tag);
  const cls =
    size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";

  return (
    <span
      onClick={
        onClick &&
        ((e) => {
          e.stopPropagation();
          onClick();
        })
      }
      className={`${cls} font-medium rounded-full ${bg} ${text} ${
        onClick ? "cursor-pointer hover:opacity-75 transition-opacity" : ""
      }`}
    >
      {tag}
    </span>
  );
}
