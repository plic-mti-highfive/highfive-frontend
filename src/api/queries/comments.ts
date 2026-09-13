import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as commentsApi from "../comments";
import { queryKeys } from "./keys";
import type { CommentCreateInput } from "@/domain";

export function useComments(slug: string) {
  return useQuery({
    queryKey: queryKeys.projects.comments(slug),
    queryFn: () => commentsApi.listComments(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CommentCreateInput) =>
      commentsApi.createComment(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments(slug),
      });
    },
  });
}

export function useHideComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.hideComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments(slug),
      });
    },
  });
}

export function useDeleteComment(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments(slug),
      });
    },
  });
}
