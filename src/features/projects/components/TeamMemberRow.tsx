import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

import {
  Avatar,
  Badge,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";
import { ConfirmActionDialog } from "@features/admin/components/ConfirmActionDialog";
import { SendMessageDialog } from "@features/messages/components/SendMessageDialog";
import type { TeamMember } from "@/api/memberships";
import type { MembershipRole } from "@/domain";
import { ROLE_LABEL } from "../lib/labels";

/** Rôles attribuables par le porteur (R-M1 : `owner` est unique, jamais attribuable ici). */
const ASSIGNABLE_ROLES: Exclude<MembershipRole, "owner">[] = [
  "co_owner",
  "member",
  "observer",
];

export interface TeamMemberActions {
  /** Envoyer un message : toute personne connectée, hors soi-même. */
  canMessage: boolean;
  /** Changer le rôle : porteur seul (doc 05 §3.2). */
  onChangeRole?: (role: Exclude<MembershipRole, "owner">) => void;
  /** Exclure / bloquer : porteur+, jamais le porteur ni soi-même (R-M4). */
  onRemove?: () => void;
  onBlock?: () => void;
}

/**
 * Ligne d'un membre : avatar, identité, ancienneté, et menu ⋮ regroupant les
 * actions permises (profil, message, gestion). Les actions absentes ne sont
 * pas rendues plutôt que désactivées (R-IMP2) ; sans aucune action, pas de
 * menu non plus.
 */
export function TeamMemberRow({
  member,
  actions,
}: {
  member: TeamMember;
  actions: TeamMemberActions;
}) {
  const { user } = member;
  const name = user.displayName ?? user.username;
  const [messageOpen, setMessageOpen] = useState(false);
  const [confirm, setConfirm] = useState<"remove" | "block" | null>(null);

  const roleChoices = actions.onChangeRole
    ? ASSIGNABLE_ROLES.filter((role) => role !== member.role)
    : [];
  const hasManagement = Boolean(
    roleChoices.length > 0 ||
    (actions.onRemove && member.role !== "owner") ||
    (actions.onBlock && !member.blocked),
  );

  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar name={name} src={user.avatar} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link
            to={`/u/${user.username}`}
            className="truncate text-body-md font-medium text-foreground hover:underline"
          >
            {name}
          </Link>
          {member.role === "owner" && <Badge tone="accent">Porteur</Badge>}
          {member.blocked && <Badge tone="danger">Bloqué</Badge>}
        </div>
        <p className="truncate text-body-sm text-muted-foreground">
          @{user.username} ·{" "}
          <time
            dateTime={member.joinedAt}
            title={formatExactDateTime(member.joinedAt)}
          >
            depuis le {formatAbsoluteDate(member.joinedAt)}
          </time>
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              aria-label={`Actions sur @${user.username}`}
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
              <DropdownMenuItem render={<Link to={`/u/${user.username}`} />}>
                Voir le profil
              </DropdownMenuItem>
              {actions.canMessage && (
                <DropdownMenuItem onClick={() => setMessageOpen(true)}>
                  Envoyer un message
                </DropdownMenuItem>
              )}
              {hasManagement && (
                <div role="separator" className="my-1 h-px bg-border" />
              )}
              {roleChoices.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => actions.onChangeRole?.(role)}
                >
                  {role === "co_owner"
                    ? "Nommer co-porteur"
                    : `Passer ${ROLE_LABEL[role].toLowerCase()}`}
                </DropdownMenuItem>
              ))}
              {actions.onRemove && member.role !== "owner" && (
                <DropdownMenuItem onClick={() => setConfirm("remove")}>
                  Exclure du projet
                </DropdownMenuItem>
              )}
              {actions.onBlock && !member.blocked && (
                <DropdownMenuItem
                  className="text-destructive data-[highlighted]:bg-destructive/10"
                  onClick={() => setConfirm("block")}
                >
                  Bloquer
                </DropdownMenuItem>
              )}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenu>

      {actions.canMessage && (
        <SendMessageDialog
          open={messageOpen}
          onOpenChange={setMessageOpen}
          recipient={user}
        />
      )}
      {actions.onRemove && (
        <ConfirmActionDialog
          open={confirm === "remove"}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={`Exclure @${user.username} ?`}
          description="La personne quitte l'équipe. Elle pourra redemander à rejoindre le projet."
          confirmLabel="Exclure"
          destructive
          onConfirm={() => {
            setConfirm(null);
            actions.onRemove?.();
          }}
        />
      )}
      {actions.onBlock && (
        <ConfirmActionDialog
          open={confirm === "block"}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={`Bloquer @${user.username} ?`}
          description="La personne ne pourra plus rejoindre ni être invitée sur ce projet."
          confirmLabel="Bloquer"
          destructive
          onConfirm={() => {
            setConfirm(null);
            actions.onBlock?.();
          }}
        />
      )}
    </li>
  );
}
