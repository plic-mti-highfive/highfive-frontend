import { z } from "zod";
import { apiFetch } from "./client";
import {
  invitationSchema,
  joinRequestSchema,
  membershipRoleSchema,
  membershipSchema,
  userSummarySchema,
  type Invitation,
  type InvitationCreateInput,
  type JoinRequest,
  type JoinRequestCreateInput,
  type Membership,
  type MembershipRole,
} from "@/domain";

/** Membre affiche dans l'onglet Equipe : appartenance + profil resume. */
export const teamMemberSchema = membershipSchema.extend({
  user: userSummarySchema,
});
export type TeamMember = z.infer<typeof teamMemberSchema>;

/** Demande en attente : le contrat v2 ne porte que `userId`, le profil resume du demandeur est joint pour l'affichage. */
export const joinRequestWithUserSchema = joinRequestSchema.extend({
  user: userSummarySchema,
});
export type JoinRequestWithUser = z.infer<typeof joinRequestWithUserSchema>;

export function listMembers(slug: string): Promise<TeamMember[]> {
  return apiFetch(`/projects/${slug}/members`, {
    schema: z.array(teamMemberSchema),
  });
}

export function updateMemberRole(
  slug: string,
  userId: string,
  role: MembershipRole,
): Promise<Membership> {
  return apiFetch(`/projects/${slug}/members/${userId}`, {
    method: "PATCH",
    body: { role: membershipRoleSchema.parse(role) },
    schema: membershipSchema,
  });
}

/** R-M4 : exclure retire l'appartenance ; bloquer ajoute `blocked = true`. */
export function removeMember(slug: string, userId: string): Promise<void> {
  return apiFetch(`/projects/${slug}/members/${userId}`, { method: "DELETE" });
}

export function blockMember(slug: string, userId: string): Promise<void> {
  return apiFetch(`/projects/${slug}/members/${userId}/block`, {
    method: "POST",
  });
}

/** R-M3 : le porteur doit d'abord transferer ou archiver avant de quitter. */
export function leaveProject(slug: string): Promise<void> {
  return apiFetch(`/projects/${slug}/leave`, { method: "POST" });
}

export function listJoinRequests(slug: string): Promise<JoinRequestWithUser[]> {
  return apiFetch(`/projects/${slug}/join-requests`, {
    schema: z.array(joinRequestWithUserSchema),
  });
}

export function createJoinRequest(
  slug: string,
  input: JoinRequestCreateInput,
): Promise<JoinRequest> {
  return apiFetch(`/projects/${slug}/join-requests`, {
    method: "POST",
    body: input,
    schema: joinRequestSchema,
  });
}

export function acceptJoinRequest(
  slug: string,
  requestId: string,
): Promise<void> {
  return apiFetch(`/projects/${slug}/join-requests/${requestId}/accept`, {
    method: "POST",
  });
}

export function rejectJoinRequest(
  slug: string,
  requestId: string,
): Promise<void> {
  return apiFetch(`/projects/${slug}/join-requests/${requestId}/reject`, {
    method: "POST",
  });
}

export function listInvitations(slug: string): Promise<Invitation[]> {
  return apiFetch(`/projects/${slug}/invitations`, {
    schema: z.array(invitationSchema),
  });
}

export function createInvitation(
  slug: string,
  input: InvitationCreateInput,
): Promise<Invitation> {
  return apiFetch(`/projects/${slug}/invitations`, {
    method: "POST",
    body: input,
    schema: invitationSchema,
  });
}

export function acceptInvitation(invitationId: string): Promise<void> {
  return apiFetch(`/invitations/${invitationId}/accept`, { method: "POST" });
}

export function rejectInvitation(invitationId: string): Promise<void> {
  return apiFetch(`/invitations/${invitationId}/reject`, { method: "POST" });
}
