import { format } from "date-fns";
import { frCA } from "date-fns/locale";
import type { Message } from "../types";
import { MessageActions } from "./MessageActions";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  senderName?: string;
  showSenderInfo?: boolean;
}

export function MessageBubble({
  message,
  isSent,
  senderName,
  showSenderInfo,
}: MessageBubbleProps) {
  const timestamp = format(message.timestamp, "HH:mm", { locale: frCA });

  return (
    <div
      className={`flex items-end gap-2 mb-3 px-4 ${isSent ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col gap-1 max-w-xs ${isSent ? "items-end" : "items-start"}`}
      >
        {showSenderInfo && senderName && !isSent && (
          <span className="text-xs font-medium text-muted-foreground px-3">
            {senderName}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-lg flex gap-2 items-end group ${
            isSent
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-card border border-border text-foreground rounded-bl-none"
          }`}
        >
          <p className="break-words whitespace-pre-wrap text-sm">
            {message.content}
          </p>
          <MessageActions message={message} isSent={isSent} />
        </div>
        <span className="text-xs text-muted-foreground px-3">{timestamp}</span>
      </div>
    </div>
  );
}
