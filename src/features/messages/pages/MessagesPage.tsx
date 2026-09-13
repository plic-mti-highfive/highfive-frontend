import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Footer, Header } from "@features/layout";
import { useAuth } from "@shared/contexts";
import { useConversations } from "@/api/queries/conversations";
import { ErrorState, Skeleton } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { ApiError } from "@/api/client";
import { ConversationList } from "../components/ConversationList";
import { ConversationDetail } from "../components/ConversationDetail";
import { EmptyConversation } from "../components/EmptyConversation";
import { CreateConversationModal } from "../components/CreateConversationModal";

/**
 * R-R3 : la conversation ouverte est portee par la route (`/messages/:id`,
 * `id` optionnel) plutot que par un etat local — selectionner une
 * conversation navigue, elle ne se contente pas de changer un `useState`.
 */
export function MessagesPage() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const conversations = useConversations();
  const [createOpen, setCreateOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="bg-background">
        <div className="flex h-[calc(100vh-3.5rem)]">
          <aside
            className={cn(
              "w-full border-r border-border lg:flex lg:w-96 lg:shrink-0",
              conversationId ? "hidden lg:flex" : "flex",
            )}
          >
            {conversations.isLoading ? (
              <div className="flex w-full flex-col gap-3 p-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : conversations.isError ? (
              <ErrorState
                message={
                  conversations.error instanceof ApiError
                    ? conversations.error.message
                    : "Impossible de charger tes conversations."
                }
                onRetry={() => conversations.refetch()}
              />
            ) : (
              <ConversationList
                conversations={conversations.data ?? []}
                currentUserId={user.id}
                selectedConversationId={conversationId}
                onSelect={(id) => navigate(`/messages/${id}`)}
                onCreate={() => setCreateOpen(true)}
              />
            )}
          </aside>

          <section
            className={cn("flex-1", conversationId ? "flex" : "hidden lg:flex")}
          >
            {conversationId ? (
              <ConversationDetail
                key={conversationId}
                conversationId={conversationId}
                currentUser={user}
                onBack={() => navigate("/messages")}
              />
            ) : (
              <EmptyConversation />
            )}
          </section>
        </div>
      </main>
      <Footer />

      <CreateConversationModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentUserId={user.id}
        onCreated={(id) => navigate(`/messages/${id}`)}
      />
    </>
  );
}
