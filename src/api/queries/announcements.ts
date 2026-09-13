import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as announcementsApi from "../announcements";
import { queryKeys } from "./keys";
import type { AnnouncementCreateInput } from "@/domain";

export function useAnnouncements(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.announcements(slug),
    queryFn: () => announcementsApi.listAnnouncements(slug),
    enabled: Boolean(slug),
  });
}

/** R-A1 : reserve au porteur/co-porteur, verifie cote handler. */
export function useCreateAnnouncement(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementCreateInput) =>
      announcementsApi.createAnnouncement(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.announcements(slug),
      });
    },
  });
}

/** R-A2 : une seule annonce epinglee a la fois, applique cote handler. */
export function usePinAnnouncement(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) =>
      announcementsApi.pinAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.announcements(slug),
      });
    },
  });
}

export function useDeleteAnnouncement(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) =>
      announcementsApi.deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.announcements(slug),
      });
    },
  });
}
