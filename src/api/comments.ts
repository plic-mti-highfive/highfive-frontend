import { z } from "zod";
import { apiFetch } from "./client";
import {
  commentSchema,
  userSummarySchema,
  type Comment,
  type CommentCreateInput,
} from "@/domain";

const commentWithAuthorSchema = commentSchema.extend({
  author: userSummarySchema,
});
export type CommentWithAuthor = z.infer<typeof commentWithAuthorSchema>;

export function listComments(slug: string): Promise<CommentWithAuthor[]> {
  return apiFetch(`/projects/${slug}/comments`, {
    schema: z.array(commentWithAuthorSchema),
  });
}

export function createComment(
  slug: string,
  input: CommentCreateInput,
): Promise<Comment> {
  return apiFetch(`/projects/${slug}/comments`, {
    method: "POST",
    body: input,
    schema: commentSchema,
  });
}

/** R-C3 : le porteur/co-porteur masque, l'administration supprime. */
export function hideComment(commentId: string): Promise<void> {
  return apiFetch(`/comments/${commentId}/hide`, { method: "POST" });
}

export function deleteComment(commentId: string): Promise<void> {
  return apiFetch(`/comments/${commentId}`, { method: "DELETE" });
}
