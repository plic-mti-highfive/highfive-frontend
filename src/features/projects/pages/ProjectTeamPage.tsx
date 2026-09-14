import { useOutletContext } from "react-router-dom";

import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  Section,
  Skeleton,
} from "@shared/ui";
import {
  useAcceptJoinRequest,
  useJoinRequests,
  useRejectJoinRequest,
} from "@/api/queries/memberships";
import type { MembershipRole } from "@/domain";
import type { ProjectOutletContext } from "../components/ProjectLayout";
import { ROLE_LABEL } from "../lib/labels";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";

const ROLE_ORDER: MembershipRole[] = [
  "owner",
  "co_owner",
  "member",
  "observer",
];

/**
 * Onglet Équipe (`/projets/:slug/equipe`, mission item 1) : membres groupés
 * par rôle, demandes en attente avec accepter/refuser pour porteur+
 * (R-IMP2 : la file de demandes n'est ni chargée ni affichée pour qui n'a
 * pas ce droit — `useJoinRequests` reste `enabled` par sa garde interne, la
 * section entière est simplement absente ici).
 */
export function ProjectTeamPage() {
  const { project, members, capabilities } =
    useOutletContext<ProjectOutletContext>();

  const joinRequestsQuery = useJoinRequests(
    capabilities.canManageTeam ? project.slug : "",
  );
  const acceptRequest = useAcceptJoinRequest(project.slug);
  const rejectRequest = useRejectJoinRequest(project.slug);

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((member) => member.role === role),
  })).filter((group) => group.members.length > 0);

  const pendingRequests = (joinRequestsQuery.data ?? []).filter(
    (request) => request.status === "pending",
  );

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <Section title={`Membres ${members.length}`}>
        <ul className="flex flex-col gap-1">
          {grouped.map((group) => (
            <li key={group.role} className="flex flex-col gap-1">
              {group.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <Avatar
                    name={member.user.displayName ?? member.user.username}
                    src={member.user.avatar}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md font-medium text-foreground">
                      @{member.user.username}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {ROLE_LABEL[member.role]} · depuis le{" "}
                      {formatAbsoluteDate(member.joinedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </Section>

      {capabilities.canManageTeam && (
        <Section title="Demandes">
          {joinRequestsQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : joinRequestsQuery.error ? (
            <ErrorState
              message="Les demandes n'ont pas pu être chargées."
              onRetry={() => joinRequestsQuery.refetch()}
            />
          ) : pendingRequests.length === 0 ? (
            <EmptyState title="Aucune demande en attente." />
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4"
                >
                  <p
                    className="text-body-sm text-muted-foreground"
                    title={formatExactDateTime(request.createdAt)}
                  >
                    Demande du {formatAbsoluteDate(request.createdAt)}
                  </p>
                  {request.message && (
                    <p className="text-body-md text-foreground">
                      « {request.message} »
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={rejectRequest.isPending}
                      onClick={() => rejectRequest.mutate(request.id)}
                    >
                      Refuser
                    </Button>
                    <Button
                      size="sm"
                      disabled={acceptRequest.isPending}
                      onClick={() => acceptRequest.mutate(request.id)}
                    >
                      Accepter
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </div>
  );
}
