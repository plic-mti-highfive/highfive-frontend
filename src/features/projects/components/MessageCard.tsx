import { Flag } from "lucide-react";
import { DropdownMenu } from "@shared/components/DropdownMenu";
import type { ProjectMessageDto } from "@/api/types";

interface MessageCardProps {
  message: ProjectMessageDto;
  isReply?: boolean;
  onReply?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export function MessageCard({ message, onReply, onReport }: MessageCardProps) {
  const authorName = message.author?.email.split("@")[0] || "Utilisateur";
  const avatarPath = message.author?.profile?.avatarPath;

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex gap-3 flex-1 p-4 bg-card border border-border rounded-lg">
        <div
          className="w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
          style={{
            background: avatarPath
              ? `url(${avatarPath}) center/cover`
              : `hsl(${(authorName.charCodeAt(0) * 37) % 360} 45% 80%)`,
            color: avatarPath
              ? "transparent"
              : `hsl(${(authorName.charCodeAt(0) * 37) % 360} 45% 30%)`,
          }}
        >
          {!avatarPath && getInitials(authorName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-foreground">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(message.createdAt)}
            </span>
          </div>

          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {message.attachmentPath && (
            <div className="mt-2">
              <a
                href={message.attachmentPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Voir la pièce jointe
              </a>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {onReply && (
              <button
                onClick={() => onReply(message.id)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Répondre
              </button>
            )}
          </div>
        </div>

        {onReport && (
          <DropdownMenu
            triggerSize="sm"
            iconSize={16}
            offset={4}
            items={[
              {
                icon: <Flag size={16} className="text-muted-foreground" />,
                label: "Signaler",
                onClick: () => onReport(message.id),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
