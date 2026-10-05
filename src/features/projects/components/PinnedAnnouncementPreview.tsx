import { Link } from "react-router-dom";

import { Badge, Card, CardBody } from "@shared/ui";
import type { AccentName } from "@shared/lib/accent";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import type { AnnouncementWithAuthor } from "@/api/announcements";

/** Rappel de l'annonce epinglee en tete de l'apercu (doc 13 E-10 mockup). */
export function PinnedAnnouncementPreview({
  slug,
  announcement,
  accent = "orange",
}: {
  slug: string;
  announcement: AnnouncementWithAuthor;
  /** Accent du projet (personnalisation) ; `orange` par defaut, comme avant. */
  accent?: AccentName;
}) {
  return (
    <Link to={`/projets/${slug}/annonces`}>
      <Card variant="interactive" data-accent={accent}>
        <CardBody>
          <div className="flex items-center gap-2">
            <Badge tone="warning">Épinglée</Badge>
            <h3 className="text-heading-md font-semibold text-foreground">
              {announcement.title}
            </h3>
          </div>
          <p className="text-body-sm text-muted-foreground">
            <time
              dateTime={announcement.publishedAt}
              title={formatExactDateTime(announcement.publishedAt)}
            >
              {formatRelativeDate(announcement.publishedAt)}
            </time>{" "}
            · @{announcement.author.username}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
