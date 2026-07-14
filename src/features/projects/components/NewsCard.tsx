import { Newspaper } from "lucide-react";
import type { ProjectNewsDto } from "@/api/types";

interface NewsCardProps {
  news: ProjectNewsDto;
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NewsCard({ news, compact = false }: NewsCardProps) {
  const authorName =
    news.author?.displayName || news.author?.username || "Créateur";
  const avatarPath = news.author?.avatar;

  return (
    <article className="bg-card border border-border rounded-xl p-6 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Newspaper size={16} className="text-muted-foreground shrink-0" />
          <h3 className="font-semibold text-foreground text-base leading-snug truncate">
            {news.title}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {formatDate(news.createdAt)}
        </span>
      </div>

      <p
        className={`text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap ${
          compact ? "line-clamp-3" : ""
        }`}
      >
        {news.content}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <div
          className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
          style={{
            background: avatarPath
              ? `url(${avatarPath}) center/cover`
              : `hsl(${(authorName.charCodeAt(0) * 37) % 360} 45% 80%)`,
            color: avatarPath
              ? "transparent"
              : `hsl(${(authorName.charCodeAt(0) * 37) % 360} 45% 30%)`,
          }}
        >
          {!avatarPath && authorName.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-xs text-muted-foreground">{authorName}</span>
      </div>
    </article>
  );
}
