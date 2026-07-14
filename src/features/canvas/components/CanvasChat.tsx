import { useEffect, useRef, useState } from "react";
import type { CanvasChatMessage } from "@/api/types/canvas.types";
import { colorFor } from "../hooks/useYjsStore";

interface CanvasChatProps {
  messages: CanvasChatMessage[];
  onSend: (text: string) => void;
  currentUserId: string;
  disabled?: boolean;
}

export const CanvasChat = ({
  messages,
  onSend,
  currentUserId,
  disabled,
}: CanvasChatProps) => {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  return (
    <aside className="flex h-full w-72 flex-col border-l border-gray-200 bg-white">
      <header className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Discussion</h2>
        <p className="text-xs text-gray-500">
          Les echanges alimentent la generation de taches.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400">
            Aucun message. Discutez ici pendant le brainstorming.
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: colorFor(message.authorId) }}
              />
              <span className="text-xs font-medium text-gray-600">
                {message.authorId === currentUserId ? "Vous" : "Participant"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-0.5 break-words text-gray-800">{message.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-gray-200 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={disabled}
          placeholder={disabled ? "Lecture seule" : "Votre message..."}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none disabled:bg-gray-50"
        />
      </form>
    </aside>
  );
};
