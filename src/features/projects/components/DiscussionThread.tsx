import { useState } from "react";
import type { ProjectMessageDto } from "@/api/types";
import { MessageCard } from "./MessageCard";
import { projectService } from "@/api/services";

interface DiscussionThreadProps {
  projectId: string;
  messages: ProjectMessageDto[];
  onMessageSent?: (message: ProjectMessageDto) => void;
}

export function DiscussionThread({
  projectId,
  messages,
  onMessageSent,
}: DiscussionThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReplyMessage, setNewReplyMessage] = useState("");
  const [isReplySending, setIsReplySending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const message = await projectService.createMessage(projectId, {
        content: newMessage.trim(),
      });

      setNewMessage("");
      onMessageSent?.(message);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReplySubmit = async (
    e: React.FormEvent,
    parentMessageId: string,
  ) => {
    e.preventDefault();

    if (!newReplyMessage.trim() || isReplySending) return;

    try {
      setIsReplySending(true);
      const message = await projectService.createMessage(projectId, {
        content: newReplyMessage.trim(),
        replyToId: parentMessageId,
      });

      setNewReplyMessage("");
      setReplyingTo(null);
      onMessageSent?.(message);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
    } finally {
      setIsReplySending(false);
    }
  };

  const handleReportMessage = (messageId: string) => {
    console.log("Signaler message:", messageId);
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  // Group messages by parent (replyToId)
  const parentMessages = sortedMessages.filter((m) => !m.replyToId);
  const getReplies = (parentId: string) =>
    sortedMessages.filter((m) => m.replyToId === parentId);

  return (
    <div className="space-y-4">
      {sortedMessages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun message pour le moment. Soyez le premier à écrire.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {parentMessages.map((message) => (
            <div key={message.id} className="space-y-0">
              <MessageCard
                message={message}
                onReply={setReplyingTo}
                onReport={handleReportMessage}
              />

              {/* Replies container with continuous border */}
              {(getReplies(message.id).length > 0 ||
                replyingTo === message.id) && (
                <div className="ml-8 pl-4 border-l-2 border-border space-y-3 pt-3">
                  {getReplies(message.id).map((reply) => (
                    <MessageCard
                      key={reply.id}
                      message={reply}
                      isReply
                      onReport={handleReportMessage}
                    />
                  ))}

                  {/* Reply form */}
                  {replyingTo === message.id && (
                    <form onSubmit={(e) => handleReplySubmit(e, message.id)}>
                      <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <textarea
                          value={newReplyMessage}
                          onChange={(e) => setNewReplyMessage(e.target.value)}
                          placeholder="Écrivez une réponse..."
                          className="w-full p-4 bg-transparent text-foreground resize-none focus:outline-none"
                          rows={2}
                          disabled={isReplySending}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 px-4 pb-4">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setNewReplyMessage("");
                            }}
                            className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={!newReplyMessage.trim() || isReplySending}
                            className="px-4 py-2 bg-foreground text-background font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                          >
                            {isReplySending ? "Envoi..." : "Répondre"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message..."
            className="w-full p-4 bg-transparent text-foreground resize-none focus:outline-none"
            rows={3}
            disabled={isSending}
          />
          <div className="flex justify-end px-4 pb-4">
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-foreground text-background font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSending ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
