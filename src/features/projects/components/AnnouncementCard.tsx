import { Avatar, Badge, Button, Card, CardBody } from "@shared/ui";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
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
          {canManage && (
            <div className="flex shrink-0 gap-2">
              {!announcement.pinned && onPin && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPinning}
                  onClick={onPin}
                >
                  Épingler
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  onClick={onDelete}
                >
                  Supprimer
                </Button>
              )}
            </div>
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
