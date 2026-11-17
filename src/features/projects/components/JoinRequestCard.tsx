import { Link } from "react-router-dom";

import { Avatar, Button } from "@shared/ui";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import type { JoinRequestWithUser } from "@/api/memberships";

/**
 * Une demande pour rejoindre le projet : qui demande (avatar, nom, pseudo
 * vers le profil), quand, le message laissé, et accepter / refuser (R-D3 :
 * refuser n'envoie aucun motif).
 */
export function JoinRequestCard({
  request,
  disabled,
  onAccept,
  onReject,
}: {
  request: JoinRequestWithUser;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { user } = request;
  const name = user.displayName ?? user.username;

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/u/${user.username}`}
            className="block truncate text-body-md font-medium text-foreground hover:underline"
          >
            {name}
          </Link>
          <p className="truncate text-body-sm text-muted-foreground">
            @{user.username} ·{" "}
            <time
              dateTime={request.createdAt}
              title={formatExactDateTime(request.createdAt)}
            >
              {formatRelativeDate(request.createdAt)}
            </time>
          </p>
        </div>
      </div>

      {request.message && (
        <blockquote className="whitespace-pre-wrap break-words rounded-lg bg-muted px-3 py-2 text-body-md text-foreground">
          {request.message}
        </blockquote>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onReject}
        >
          Refuser
        </Button>
        <Button size="sm" disabled={disabled} onClick={onAccept}>
          Accepter
        </Button>
      </div>
    </li>
  );
}
