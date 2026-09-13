import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { ConversationSummary } from "@/domain";
import { EmptyState, IconButton, Input } from "@shared/ui";
import { ConversationListItem } from "./ConversationListItem";
import { getConversationDisplay } from "../lib/conversationDisplay";

export interface ConversationListProps {
  conversations: ConversationSummary[];
  currentUserId: string;
  selectedConversationId?: string;
  onSelect: (conversationId: string) => void;
  onCreate: () => void;
}

/**
 * Liste des conversations avec recherche locale et section "Demandes de
 * message" (R-MSG7) : une conversation directe sans reponse du destinataire
 * arrive a part plutot que noyee dans les discussions actives.
 */
export function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelect,
  onCreate,
}: ConversationListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => {
      const { title } = getConversationDisplay(conversation, currentUserId);
      return title.toLowerCase().includes(q);
    });
  }, [conversations, currentUserId, query]);

  const requests = filtered.filter((c) => c.isMessageRequest);
  const discussions = filtered.filter((c) => !c.isMessageRequest);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h1 className="text-heading-md font-semibold text-foreground">
          Messages
        </h1>
        <IconButton aria-label="Nouvelle conversation" onClick={onCreate}>
          <Plus size={18} />
        </IconButton>
      </div>

      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une conversation"
            className="pl-8"
            aria-label="Rechercher une conversation"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucune conversation pour l'instant"
            description="Lance une discussion avec quelqu'un que tu as croisé sur un projet."
            action={
              <button
                type="button"
                onClick={onCreate}
                className="text-body-md font-semibold text-foreground underline-offset-2 hover:underline"
              >
                Nouvelle conversation
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Aucune conversation trouvée"
            description={`Aucun résultat pour « ${query} ».`}
          />
        ) : (
          <>
            {requests.length > 0 && (
              <div className="px-2 pt-3">
                <p className="px-2 pb-1 text-label uppercase text-muted-foreground">
                  Demandes de message
                </p>
                {requests.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    active={conversation.id === selectedConversationId}
                    onSelect={() => onSelect(conversation.id)}
                  />
                ))}
              </div>
            )}
            {discussions.length > 0 && (
              <div className="px-2 pt-3">
                {requests.length > 0 && (
                  <p className="px-2 pb-1 text-label uppercase text-muted-foreground">
                    Discussions
                  </p>
                )}
                {discussions.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    active={conversation.id === selectedConversationId}
                    onSelect={() => onSelect(conversation.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
