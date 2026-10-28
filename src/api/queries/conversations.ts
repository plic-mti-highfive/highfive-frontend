import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import * as conversationsApi from "../conversations";
import { queryKeys } from "./keys";
import type {
  ConversationCreateInput,
  ConversationDetail,
  MessageCreateInput,
} from "@/domain";

/**
 * Pas de temps reel (SPEC §5) : la messagerie se rafraichit par polling.
 * Le fil ouvert est relu souvent ; la liste (et le compteur de l'en-tete,
 * meme cle) plus rarement. TanStack Query suspend le polling quand l'onglet
 * n'est pas visible.
 */
const MESSAGES_POLL_MS = 5_000;
const CONVERSATIONS_POLL_MS = 15_000;

/** La liste seule : `["conversations"]` est aussi le prefixe des fils et des details. */
function invalidateConversationList(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.conversations.list(),
    exact: true,
  });
}

/** Lire ou ecrire dans une conversation eteint ses notifications cote serveur. */
function invalidateNotifications(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.notifications.all(),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: conversationsApi.listConversations,
    refetchInterval: CONVERSATIONS_POLL_MS,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => conversationsApi.getConversation(conversationId),
    enabled: Boolean(conversationId),
    // Titre et participants d'un groupe changent sous les yeux (R-MSG9).
    refetchInterval: CONVERSATIONS_POLL_MS,
  });
}

/**
 * Fil d'une conversation. La premiere page porte les 20 messages les plus
 * recents, `nextCursor` remonte vers les plus anciens ; chaque page est dans
 * l'ordre chronologique. Le curseur est keyset : au refetch du polling, les
 * pages sont relues depuis la plus recente sans trou ni doublon.
 */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      conversationsApi.listMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(conversationId),
    refetchInterval: MESSAGES_POLL_MS,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConversationCreateInput) =>
      conversationsApi.createConversation(input),
    onSuccess: (conversation) => {
      void invalidateConversationList(queryClient);
      // Conversation directe deja existante : le message s'ajoute au fil.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversation.id),
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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      void invalidateConversationList(queryClient);
      void invalidateNotifications(queryClient);
    },
  });
}

/** R-MSG8 : depot prealable a l'envoi d'un message avec piece jointe. */
export function useUploadMessageAttachment(conversationId: string) {
  return useMutation({
    mutationFn: (file: File) =>
      conversationsApi.uploadMessageAttachment(conversationId, file),
  });
}

/** R-MSG5 : l'auteur seul, sans limite de temps. */
export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      conversationsApi.editMessage(messageId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      void invalidateConversationList(queryClient);
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      conversationsApi.deleteMessage(messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      void invalidateConversationList(queryClient);
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsApi.markConversationRead(conversationId),
    onSuccess: () => {
      void invalidateConversationList(queryClient);
      void invalidateNotifications(queryClient);
    },
  });
}

/** R-MSG9 : les routes de gestion repondent le detail a jour. */
function useGroupDetailMutation<TVariables>(
  conversationId: string,
  mutationFn: (variables: TVariables) => Promise<ConversationDetail>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (detail) => {
      queryClient.setQueryData(
        queryKeys.conversations.detail(conversationId),
        detail,
      );
      void invalidateConversationList(queryClient);
    },
  });
}

export function useRenameConversation(conversationId: string) {
  return useGroupDetailMutation(conversationId, (title: string) =>
    conversationsApi.renameConversation(conversationId, { title }),
  );
}

export function useAddConversationParticipants(conversationId: string) {
  return useGroupDetailMutation(conversationId, (participantIds: string[]) =>
    conversationsApi.addConversationParticipants(conversationId, {
      participantIds,
    }),
  );
}

/** R-MSG9 : administrateur du groupe seulement. */
export function useRemoveConversationParticipant(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationsApi.removeConversationParticipant(conversationId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
        exact: true,
      });
      void invalidateConversationList(queryClient);
    },
  });
}

/** R-MSG9 : apres le depart, la conversation et son fil ne sont plus lisibles. */
export function useLeaveConversation(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationsApi.leaveConversation(conversationId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      void invalidateConversationList(queryClient);
      void invalidateNotifications(queryClient);
    },
  });
}
