import { getTagColor } from "@shared/utils/tagColors";

export function TagPill({
  tag,
  size = "sm",
}: {
  tag: string;
  size?: "sm" | "xs";
}) {
  const { bg, text } = getTagColor(tag);
  const cls =
    size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`${cls} font-medium rounded-full ${bg} ${text}`}>
      {tag}
    </span>
  );
}
