import { Avatar, Badge, Card, CardBody, IconButton } from "@shared/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
} from "@shared/ui";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import { MoreVertical } from "lucide-react";
import type { AnnouncementWithAuthor } from "@/api/announcements";

/** Une annonce (doc 13 E-11) : titre, corps, auteur, date, actions du porteur+. */
export function AnnouncementCard({
  announcement,
  canManage,
  onPin,
  onDelete,
  isPinning,
  isDeleting,
}: {
  announcement: AnnouncementWithAuthor;
  canManage: boolean;
  onPin?: () => void;
  onDelete?: () => void;
  isPinning?: boolean;
  isDeleting?: boolean;
}) {
  const hasActions = canManage && (onPin || onDelete);

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {announcement.pinned && <Badge tone="warning">Épinglée</Badge>}
            <h3 className="text-heading-md font-semibold text-foreground">
              {announcement.title}
            </h3>
          </div>
          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton
                    aria-label="Actions"
                    size="sm"
                    className="shrink-0"
                  />
                }
              >
                <MoreVertical size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuPositioner>
                  <DropdownMenuPopup>
                    {!announcement.pinned && onPin && (
                      <DropdownMenuItem disabled={isPinning} onClick={onPin}>
                        Épingler
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        disabled={isDeleting}
                        className="text-destructive data-[highlighted]:bg-destructive/10"
                        onClick={onDelete}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenu>
          )}
        </div>

        <p className="whitespace-pre-wrap text-body-md text-foreground">
          {announcement.body}
        </p>

        <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
          <Avatar
            name={
              announcement.author.displayName ?? announcement.author.username
            }
            src={announcement.author.avatar}
            size="xs"
          />
          <span>@{announcement.author.username}</span>
          <time
            dateTime={announcement.publishedAt}
            title={formatExactDateTime(announcement.publishedAt)}
          >
            · {formatRelativeDate(announcement.publishedAt)}
          </time>
        </div>
      </CardBody>
    </Card>
  );
}
