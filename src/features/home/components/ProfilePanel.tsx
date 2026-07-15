import { useNavigate } from "react-router-dom";
import { Skeleton } from "@shared/components/ui/skeleton";
import { useProfilePanelData } from "../hooks/useProfilePanelData";

function initialsFor(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function hueFor(name: string) {
  return (name.charCodeAt(0) * 37) % 360;
}

export function ProfilePanel() {
  const navigate = useNavigate();
  const { userId, displayName, handle, isLoading } = useProfilePanelData();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-col gap-2 pt-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const hue = hueFor(displayName);
  const navItems = [
    { label: "Mon profil", to: `/user/${userId}` },
    { label: "Paramètres", to: `/user/${userId}` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 items-start">
        <div
          className="w-16 h-16 rounded-full text-lg font-bold flex items-center justify-center"
          style={{
            background: `hsl(${hue} 45% 80%)`,
            color: `hsl(${hue} 45% 30%)`,
          }}
        >
          {initialsFor(displayName)}
        </div>
        <div>
          <div className="text-base font-bold text-foreground">
            {displayName}
          </div>
          <div className="text-sm text-muted-foreground">@{handle}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 pt-4 border-t border-border">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.to)}
            className="cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-muted transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
