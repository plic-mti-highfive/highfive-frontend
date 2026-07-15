import { useNavigate } from "react-router-dom";
import { Skeleton } from "@shared/components/ui/skeleton";
import { useTrendingUsers } from "../hooks/useTrendingUsers";

function initialsFor(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function hueFor(name: string) {
  return (name.charCodeAt(0) * 37) % 360;
}

export function TrendingUsersPanel() {
  const navigate = useNavigate();
  const { users, isLoading } = useTrendingUsers(4);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div>
      <div className="text-base font-bold text-foreground mb-4">
        Utilisateurs recommandés
      </div>
      <div className="flex flex-col gap-5">
        {users.map((u) => {
          const hue = hueFor(u.displayName || u.username);
          return (
            <div
              key={u.userId}
              className="cursor-pointer flex items-center gap-3 group"
              onClick={() => navigate(`/user/${u.userId}`)}
            >
              <div
                className="w-11 h-11 rounded-full text-sm font-bold flex items-center justify-center shrink-0"
                style={{
                  background: `hsl(${hue} 45% 80%)`,
                  color: `hsl(${hue} 45% 30%)`,
                }}
              >
                {initialsFor(u.displayName || u.username)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground line-clamp-1 group-hover:underline">
                  {u.displayName}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  @{u.username}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
