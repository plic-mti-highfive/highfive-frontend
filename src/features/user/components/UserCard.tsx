import { FolderOpen, Users, Calendar } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { UserActionsMenu } from "./UserActionsMenu";
import type { User } from "@shared/types/user";

interface UserCardProps {
  user: User;
  onNavigate: (username: string) => void;
  isOwnProfile?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function UserCard({
  user,
  onNavigate,
  isOwnProfile = false,
}: UserCardProps) {
  return (
    <div className="group flex bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:border-foreground/20">
      {/* Colonne gauche : Photo */}
      <div
        className="shrink-0 cursor-pointer"
        onClick={() => onNavigate(user.username)}
      >
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-24 h-24 rounded-2xl object-cover"
        />
      </div>

      {/* Colonne droite : Nom + Date + Stats + Boutons */}
      <div className="flex-1 ml-4 flex flex-col">
        {/* Header : Nom + Menu 3 points */}
        <div className="flex items-start justify-between mb-2">
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onNavigate(user.username)}
          >
            <h3 className="text-heading-md font-bold text-foreground truncate">
              {user.displayName}
            </h3>
            <p className="text-body-md text-muted-foreground truncate mb-1">
              @{user.username}
            </p>
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <Calendar size={14} />
              <span>Depuis {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="ml-2 shrink-0">
            <UserActionsMenu isOwnProfile={isOwnProfile} />
          </div>
        </div>

        {/* Ligne du bas : Stats à gauche + Bouton Suivre à droite */}
        <div className="mt-auto flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <FolderOpen size={16} className="shrink-0" />
              <span className="font-semibold text-foreground">
                {user.stats.projectsCreated}
              </span>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <Users size={16} className="shrink-0" />
              <span className="font-semibold text-foreground">
                {user.stats.followers}
              </span>
            </div>
          </div>

          {/* Bouton Suivre */}
          {!isOwnProfile && (
            <Button
              onClick={() => console.log("Suivre", user.username)}
              size="sm"
              className="w-auto"
            >
              Suivre
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
