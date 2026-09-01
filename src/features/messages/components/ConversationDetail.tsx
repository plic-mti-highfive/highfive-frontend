import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import type { Conversation, Message } from "../types";
import { messagingService } from "@/api/services";
import { MessageBubble } from "./MessageBubble";
import { MessageDateSeparator } from "./MessageDateSeparator";
import { NewMessagesSeparator } from "./NewMessagesSeparator";
import { MessageInput } from "./MessageInput";
import { isSameDay } from "date-fns";

interface ConversationDetailProps {
  conversation: Conversation;
  onToggleListCollapse: () => void;
}

function getConversationName(conversation: Conversation): string {
  if (conversation.type === "group") {
    return conversation.name || "Groupe sans nom";
  }

  const names: { [key: string]: string } = {
    "user-2": "Sophie Martin",
    "user-3": "Thomas Dupont",
    "user-4": "Marie Laurent",
    "user-5": "Jean Claude",
    "user-6": "Lisa Moreau",
  };

  const otherUserId = conversation.participants.find((id) => id !== "user-1");
  return names[otherUserId || "user-1"] || "Utilisateur";
}

function getSenderName(senderId: string): string {
  const names: { [key: string]: string } = {
    "user-1": "Vous",
    "user-2": "Sophie Martin",
    "user-3": "Thomas Dupont",
    "user-4": "Marie Laurent",
    "user-5": "Jean Claude",
    "user-6": "Lisa Moreau",
  };
  return names[senderId] || "Utilisateur";
}

export function ConversationDetail({
  conversation,
  onToggleListCollapse,
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Les messages etaient lus directement dans les donnees mock : ils passent
  // par la couche API, et se rechargent quand on change de conversation.
  useEffect(() => {
    messagingService
      .getMessages(conversation.id)
      .then(setMessages)
      .catch((err) =>
        console.error("Erreur lors du chargement des messages:", err),
      );
  }, [conversation.id]);

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      const newMessage = await messagingService.sendMessage(
        conversation.id,
        content,
      );
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
    }
  };

  // Find the unread separator position
  const firstUnreadIndex = messages.findIndex((m) => !m.read);

  // Group messages by date
  const groupedMessages = messages.reduce(
    (acc, message, index) => {
      const lastGroup = acc[acc.length - 1];

      if (
        !lastGroup ||
        !isSameDay(new Date(lastGroup.date), new Date(message.timestamp))
      ) {
        acc.push({
          date: message.timestamp,
          messages: [{ message, index }],
          showUnreadSeparator:
            index === firstUnreadIndex && firstUnreadIndex !== -1,
        });
      } else {
        lastGroup.messages.push({ message, index });
        if (index === firstUnreadIndex && firstUnreadIndex !== -1) {
          lastGroup.showUnreadSeparator = true;
        }
      }

      return acc;
    },
    [] as Array<{
      date: Date;
      messages: Array<{ message: Message; index: number }>;
      showUnreadSeparator: boolean;
    }>,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleListCollapse}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground lg:hidden"
            title="Afficher les conversations"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-foreground">
              {getConversationName(conversation)}
            </h2>
            {conversation.type === "group" && (
              <p className="text-xs text-muted-foreground">
                {conversation.participants.length} participants
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        <div className="px-4 py-4">
          {groupedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Aucun message dans cette conversation</p>
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                <MessageDateSeparator date={group.date} />

                {group.showUnreadSeparator && <NewMessagesSeparator />}

                {group.messages.map(({ message }) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isSent={message.senderId === "user-1"}
                    senderName={
                      conversation.type === "group" &&
                      message.senderId !== "user-1"
                        ? getSenderName(message.senderId)
                        : undefined
                    }
                    showSenderInfo={
                      conversation.type === "group" &&
                      message.senderId !== "user-1"
                    }
                  />
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
