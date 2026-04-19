export function AuthorChip({ author }: { author: string }) {
  const initials = author.slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
        style={{
          background: `hsl(${(author.charCodeAt(0) * 37) % 360} 45% 80%)`,
          color: `hsl(${(author.charCodeAt(0) * 37) % 360} 45% 30%)`,
        }}
      >
        {initials}
      </div>
      <span className="text-xs text-foreground font-medium">@{author}</span>
    </div>
  )
}
