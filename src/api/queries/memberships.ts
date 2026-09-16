import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as membershipsApi from "../memberships";
import { queryKeys } from "./keys";
import type {
  InvitationCreateInput,
  JoinRequestCreateInput,
  MembershipRole,
} from "@/domain";

export function useMembers(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(slug),
    queryFn: () => membershipsApi.listMembers(slug),
    enabled: Boolean(slug),
  });
}

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MembershipRole }) =>
      membershipsApi.updateMemberRole(slug, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membershipsApi.removeMember(slug, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}

export function useBlockMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membershipsApi.blockMember(slug, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}

/** R-M3 : le porteur doit d'abord transferer ou archiver avant de quitter. */
export function useLeaveProject(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => membershipsApi.leaveProject(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
  });
}

export function useJoinRequests(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.joinRequests(slug),
    queryFn: () => membershipsApi.listJoinRequests(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateJoinRequest(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JoinRequestCreateInput) =>
      membershipsApi.createJoinRequest(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.joinRequests(slug),
      });
      // Participation "open" : la demande est auto-acceptee cote handler,
      // ce qui cree directement une appartenance — l'equipe doit refleter
      // le nouveau membre sans attendre un rechargement complet.
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}

export function useAcceptJoinRequest(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      membershipsApi.acceptJoinRequest(slug, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.joinRequests(slug),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members(slug),
      });
    },
  });
}

export function useRejectJoinRequest(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      membershipsApi.rejectJoinRequest(slug, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.joinRequests(slug),
      });
    },
  });
}

export function useInvitations(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.invitations(slug),
    queryFn: () => membershipsApi.listInvitations(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateInvitation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InvitationCreateInput) =>
      membershipsApi.createInvitation(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.invitations(slug),
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      membershipsApi.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
    },
  });
}

export function useRejectInvitation() {
  return useMutation({
    mutationFn: (invitationId: string) =>
      membershipsApi.rejectInvitation(invitationId),
  });
}
