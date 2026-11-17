import { useOutletContext } from "react-router-dom";

import { EmptyState, ErrorState, Section, Skeleton } from "@shared/ui";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import {
  useAcceptJoinRequest,
  useBlockMember,
  useJoinRequests,
  useRejectJoinRequest,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/api/queries/memberships";
import type { TeamMember } from "@/api/memberships";
import type { MembershipRole } from "@/domain";
import type { ProjectOutletContext } from "../components/ProjectLayout";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { ProjectPanel } from "../components/ProjectPanel";
import {
  TeamMemberRow,
  type TeamMemberActions,
} from "../components/TeamMemberRow";
import { ROLE_LABEL } from "../lib/labels";

const ROLE_ORDER: MembershipRole[] = [
  "owner",
  "co_owner",
  "member",
  "observer",
];

const ROLE_LABEL_PLURAL: Record<MembershipRole, string> = {
  owner: "Porteur",
  co_owner: "Co-porteurs",
  member: "Membres",
  observer: "Observateurs",
};

/**
 * Onglet Équipe (`/projets/:slug/equipe`) : membres groupés par rôle, chacun
 * avec son menu d'actions (profil, message, gestion selon les droits), et
 * demandes en attente avec accepter/refuser pour porteur+ (R-IMP2 : la file
 * de demandes n'est ni chargée ni affichée pour qui n'a pas ce droit —
 * `useJoinRequests` reste `enabled` par sa garde interne, la section entière
 * est simplement absente ici).
 */
export function ProjectTeamPage() {
  const { project, members, capabilities } =
    useOutletContext<ProjectOutletContext>();
  const { user: currentUser } = useCurrentUser();

  const joinRequestsQuery = useJoinRequests(
    capabilities.canManageTeam ? project.slug : "",
  );
  const acceptRequest = useAcceptJoinRequest(project.slug);
  const rejectRequest = useRejectJoinRequest(project.slug);
  const updateRole = useUpdateMemberRole(project.slug);
  const removeMember = useRemoveMember(project.slug);
  const blockMember = useBlockMember(project.slug);

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((member) => member.role === role),
  })).filter((group) => group.members.length > 0);

  const pendingRequests = (joinRequestsQuery.data ?? []).filter(
    (request) => request.status === "pending",
  );

  const isOwner = capabilities.role === "owner";

  function actionsFor(member: TeamMember): TeamMemberActions {
    const isSelf = member.userId === currentUser?.id;
    // Le porteur n'est ni exclu ni bloqué (R-M1) ; le co-porteur ne gère pas
    // ses pairs, seul le porteur le fait (doc 05 §3.2).
    const canManage =
      capabilities.canManageTeam &&
      !isSelf &&
      member.role !== "owner" &&
      (isOwner || member.role !== "co_owner");

    return {
      canMessage: Boolean(currentUser) && !isSelf,
      onChangeRole:
        isOwner && !isSelf && member.role !== "owner"
          ? (role) => updateRole.mutate({ userId: member.userId, role })
          : undefined,
      onRemove: canManage
        ? () => removeMember.mutate(member.userId)
        : undefined,
      onBlock: canManage ? () => blockMember.mutate(member.userId) : undefined,
    };
  }

  return (
    <div className="flex flex-col gap-6 lg:max-w-2xl">
      <ProjectPanel>
        <Section title={`Équipe · ${members.length}`}>
          {grouped.length === 0 ? (
            <EmptyState title="Aucun membre pour l'instant." />
          ) : (
            <div className="flex flex-col gap-6">
              {grouped.map((group) => (
                <div key={group.role} className="flex flex-col">
                  <h3 className="text-label font-medium uppercase tracking-wide text-muted-foreground">
                    {group.members.length > 1
                      ? ROLE_LABEL_PLURAL[group.role]
                      : ROLE_LABEL[group.role]}{" "}
                    · {group.members.length}
                  </h3>
                  <ul className="mt-1 flex flex-col divide-y divide-border">
                    {group.members.map((member) => (
                      <TeamMemberRow
                        key={member.userId}
                        member={member}
                        actions={actionsFor(member)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Section>
      </ProjectPanel>

      {capabilities.canManageTeam && (
        <ProjectPanel>
          <Section
            title={
              pendingRequests.length > 0
                ? `Demandes · ${pendingRequests.length}`
                : "Demandes"
            }
          >
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
              <ul className="flex flex-col divide-y divide-border">
                {pendingRequests.map((request) => (
                  <JoinRequestCard
                    key={request.id}
                    request={request}
                    disabled={
                      acceptRequest.isPending || rejectRequest.isPending
                    }
                    onAccept={() => acceptRequest.mutate(request.id)}
                    onReject={() => rejectRequest.mutate(request.id)}
                  />
                ))}
              </ul>
            )}
          </Section>
        </ProjectPanel>
      )}
    </div>
  );
}
