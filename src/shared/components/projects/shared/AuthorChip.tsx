export function AuthorChip({ author }: { author: string }) {
  if (!author) return null
  const initials = author.slice(0, 2).toUpperCase()
  const hue = (author.charCodeAt(0) * 37) % 360
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
        style={{
          background: `hsl(${hue} 45% 80%)`,
          color: `hsl(${hue} 45% 30%)`,
        }}
      >
        {initials}
      </div>
      <span className="text-xs text-foreground font-medium">@{author}</span>
    </div>
  )
}
