import { isToday, isYesterday } from "date-fns";
import { formatAbsoluteDate } from "@shared/lib/dates";

export interface MessageDateSeparatorProps {
  iso: string;
}

function label(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return formatAbsoluteDate(iso);
}

export function MessageDateSeparator({ iso }: MessageDateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-2">
      <span className="rounded-pill bg-muted px-3 py-1 text-ui-sm font-semibold text-muted-foreground">
        {label(iso)}
      </span>
    </div>
  );
}
