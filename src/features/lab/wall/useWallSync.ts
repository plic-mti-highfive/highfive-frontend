import { useCallback, useEffect, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { createTLStore, type TLStore } from "@tldraw/editor";
// Le jeu de shapes complet (post-it, geo, draw, fleche...) vit dans `tldraw`.
import { defaultBindingUtils, defaultShapeUtils } from "tldraw";
import { ApiError } from "@/api/client";
import { getWallSession } from "@/api/wall";
import { useWallSession } from "@/api/queries/wall";
import type { WallRole, WallSession } from "@/domain";
import { bindRemotePresence } from "./presence";
import { bindStoreToYjs } from "./yjsStoreSync";

/** Delai laisse au serveur pour la premiere synchronisation. */
export const FIRST_SYNC_TIMEOUT_MS = 8000;

export type WallSyncStatus = "loading" | "ready" | "error";

type Awareness = NonNullable<HocuspocusProvider["awareness"]>;

export interface WallSync {
  /**
   * - `loading` : session ou premiere synchronisation en cours ;
   * - `ready` : le store contient l'etat du serveur (utilisable) ;
   * - `error` : impossible d'obtenir/ouvrir le document (voir `error`).
   */
  status: WallSyncStatus;
  /** Defini des que `status === "ready"` (y compris hors ligne apres coup). */
  store: TLStore | null;
  /** Connexion au serveur de synchronisation (significatif quand `ready`). */
  connection: "online" | "offline";
  /** Role sur le document : `viewer` = connexion en lecture seule. */
  role: WallRole | null;
  error: string | null;
  /** Awareness Yjs (curseurs des autres), `null` tant que non synchronise. */
  awareness: Awareness | null;
  /** Redemande une session (jeton neuf) et rouvre la connexion. */
  retry: () => void;
}

interface Live {
  key: string;
  store: TLStore;
  synced: boolean;
  connection: "online" | "offline";
  awareness: Awareness | null;
  error: string | null;
}

function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Impossible d'ouvrir le tableau blanc partagé. Réessaie dans un instant.";
}

/**
 * Synchronise le Mur d'un projet : session (jeton emis par le core) ->
 * `HocuspocusProvider` -> store tldraw lie au `Y.Doc`. Le jeton expire (1 h
 * par defaut) : il est redemande au core a chaque reconnexion du provider ;
 * si cela echoue ou si le serveur refuse l'acces, l'erreur est exposee avec
 * `retry`. Nettoie tout (provider, ecouteurs) au demontage.
 */
export function useWallSync(slug: string, enabled = true): WallSync {
  const sessionQuery = useWallSession(slug, enabled);
  const session = sessionQuery.data;
  const key = session
    ? `${session.canvasId}:${sessionQuery.dataUpdatedAt}`
    : "";
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    if (!session) return;
    const current = session;
    const store = createTLStore({
      id: current.canvasId,
      shapeUtils: defaultShapeUtils,
      bindingUtils: defaultBindingUtils,
    });
    const update = (patch: Partial<Live>) =>
      setLive((prev) =>
        prev && prev.key === key
          ? { ...prev, ...patch }
          : { ...emptyLive(key, store), ...patch },
      );

    const cleanups: Array<() => void> = [];
    let synced = false;
    let destroyed = false;

    const provider = new HocuspocusProvider({
      url: current.websocketUrl,
      name: current.canvasId,
      token: tokenSource(slug, current),
      onSynced: () => {
        if (synced || destroyed) return;
        synced = true;
        window.clearTimeout(timeout);
        cleanups.push(
          bindStoreToYjs(store, provider.document, {
            readOnly: current.role === "viewer",
            onInvalid: (record, error) =>
              console.warn("[mur] record distant ignoré", record.id, error),
          }),
        );
        if (provider.awareness) {
          cleanups.push(bindRemotePresence(store, provider.awareness));
        }
        update({
          synced: true,
          connection: "online",
          awareness: provider.awareness,
          error: null,
        });
      },
      onStatus: ({ status }) => {
        if (destroyed || !synced) return;
        update({ connection: status === "connected" ? "online" : "offline" });
      },
      onClose: () => {
        if (!destroyed && synced) update({ connection: "offline" });
      },
      onAuthenticationFailed: () => {
        if (destroyed) return;
        update({
          error:
            "Accès au tableau blanc refusé ou session expirée. Réessaie pour rouvrir une session.",
          connection: "offline",
        });
      },
    });

    const timeout = window.setTimeout(() => {
      if (synced || destroyed) return;
      update({
        error:
          "Le serveur de synchronisation ne répond pas. Vérifie ta connexion puis réessaie.",
      });
    }, FIRST_SYNC_TIMEOUT_MS);

    return () => {
      destroyed = true;
      window.clearTimeout(timeout);
      cleanups.forEach((fn) => fn());
      provider.destroy();
    };
  }, [session, key, slug]);

  const refetch = sessionQuery.refetch;
  const retry = useCallback(() => {
    setLive(null);
    void refetch();
  }, [refetch]);

  if (sessionQuery.isError) {
    return idle("error", messageOf(sessionQuery.error), retry);
  }
  if (!session) {
    return idle("loading", null, retry);
  }
  if (!live || live.key !== key)
    return idle("loading", null, retry, session.role);

  if (live.synced) {
    return {
      status: "ready",
      store: live.store,
      connection: live.connection,
      role: session.role,
      // Erreur apres synchronisation (ex. jeton refuse a la reconnexion) :
      // le Mur reste affiche, hors ligne, avec la raison.
      error: live.error,
      awareness: live.awareness,
      retry,
    };
  }
  if (live.error) return idle("error", live.error, retry, session.role);
  return idle("loading", null, retry, session.role);
}

function emptyLive(key: string, store: TLStore): Live {
  return {
    key,
    store,
    synced: false,
    connection: "offline",
    awareness: null,
    error: null,
  };
}

function idle(
  status: "loading" | "error",
  error: string | null,
  retry: () => void,
  role: WallRole | null = null,
): WallSync {
  return {
    status,
    store: null,
    connection: "offline",
    role,
    error,
    awareness: null,
    retry,
  };
}

/**
 * Jeton fourni au provider : celui de la session pour la premiere connexion,
 * un jeton neuf (nouvel appel au core) pour chaque reconnexion, car l'ancien
 * peut avoir expire.
 */
function tokenSource(
  slug: string,
  initial: WallSession,
): () => Promise<string> {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return initial.token;
    }
    return (await getWallSession(slug)).token;
  };
}
