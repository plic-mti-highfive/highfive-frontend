import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as conversationsApi from "../conversations";
import { queryKeys } from "./keys";
import type { ConversationCreateInput, MessageCreateInput } from "@/domain";

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: conversationsApi.listConversations,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => conversationsApi.getConversation(conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useMessages(conversationId: string, cursor?: string) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId, cursor),
    queryFn: () => conversationsApi.listMessages(conversationId, cursor),
    enabled: Boolean(conversationId),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConversationCreateInput) =>
      conversationsApi.createConversation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MessageCreateInput) =>
      conversationsApi.sendMessage(conversationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}

/** R-MSG5 : fenetre de 15 minutes verifiee cote handler. */
export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      conversationsApi.editMessage(messageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      conversationsApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsApi.markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
}
