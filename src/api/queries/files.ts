import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as filesApi from "../files";
import { queryKeys } from "./keys";

export function useFiles(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.files(slug),
    queryFn: () => filesApi.listFiles(slug),
    enabled: Boolean(slug),
  });
}

/** R-F1/R-F2 : tailles et types verifies cote handler. */
export function useUploadFile(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => filesApi.uploadFile(slug, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.files(slug),
      });
    },
  });
}

export function useDeleteFile(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.files(slug),
      });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => filesApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
