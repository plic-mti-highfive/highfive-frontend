import { useCallback, useEffect, useState } from "react";
import type { HocuspocusProvider } from "@hocuspocus/provider";
import type { CanvasChatMessage } from "@/api/types/canvas.types";

/** Doit rester identique a CANVAS_KEYS.CHAT cote backend. */
const CHAT_KEY = "chat";

/**
 * Chat du canvas.
 *
 * L'envoi passe par le canal "stateless" d'Hocuspocus (hors CRDT) : le serveur
 * l'enfile dans Redis puis le persiste dans le document. On lit l'historique
 * depuis le document lui-meme plutot que depuis les broadcasts, ce qui evite de
 * dedoublonner et donne l'historique complet des l'arrivee.
 */
export const useCanvasChat = (provider: HocuspocusProvider | null) => {
  const [messages, setMessages] = useState<CanvasChatMessage[]>([]);

  useEffect(() => {
    if (!provider) return;

    const yChat = provider.document.getArray<CanvasChatMessage>(CHAT_KEY);
    const sync = () => setMessages(yChat.toArray());

    sync();
    yChat.observe(sync);
    return () => yChat.unobserve(sync);
  }, [provider]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!provider || !trimmed) return;

      provider.sendStateless(JSON.stringify({ type: "chat", text: trimmed }));
    },
    [provider],
  );

  return { messages, send };
};
