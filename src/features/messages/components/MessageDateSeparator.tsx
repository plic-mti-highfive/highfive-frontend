import { isToday, isYesterday, format } from "date-fns";
import { frCA } from "date-fns/locale";

interface MessageDateSeparatorProps {
  date: Date;
}

function formatSeparatorDate(date: Date): string {
  if (isToday(date)) {
    return "Aujourd'hui";
  }
  if (isYesterday(date)) {
    return "Hier";
  }
  return format(date, "d MMMM yyyy", { locale: frCA });
}

export function MessageDateSeparator({ date }: MessageDateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-4 px-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">
        {formatSeparatorDate(date)}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
