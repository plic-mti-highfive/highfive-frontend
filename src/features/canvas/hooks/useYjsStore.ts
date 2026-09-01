import { useEffect, useMemo, useState } from "react";
import type * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  createTLStore,
  type Editor,
  type TLRecord,
  type TLStoreWithStatus,
} from "@tldraw/editor";
// Les utilitaires par defaut vivent dans le package tldraw, pas dans l'editeur :
// c'est lui qui assemble le jeu de shapes complet (post-it, geo, draw, arrow...).
import { defaultShapeUtils, defaultBindingUtils } from "tldraw";
import {
  InstancePresenceRecordType,
  type TLPageId,
  type TLShapeId,
} from "@tldraw/tlschema";
import type { CanvasSession } from "@/api/types/canvas.types";

/**
 * Cle de la Y.Map portant les records tldraw. Doit rester identique a
 * CANVAS_KEYS.RECORDS cote backend : c'est le contrat du document.
 */
const RECORDS_KEY = "tl_records";

/** Presence diffusee aux autres participants via l'awareness Yjs (ephemere). */
interface PresenceState {
  userId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  pageId: string;
  selectedShapeIds: string[];
}

const COLORS = [
  "#e11d48",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
];

/** Couleur stable par utilisateur : il garde la meme d'une session a l'autre. */
export const colorFor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

interface UseYjsStoreResult {
  storeWithStatus: TLStoreWithStatus;
  provider: HocuspocusProvider | null;
}

/**
 * Branche le store tldraw sur le document Yjs servi par Hocuspocus.
 *
 * Deux flux, tenus separes pour eviter la boucle infinie :
 *   - local -> distant : on n'ecoute que les changements de source "user" et on
 *     les ecrit dans la Y.Map ;
 *   - distant -> local : on applique via mergeRemoteChanges, qui marque les
 *     changements comme "remote" — ils ne repartent donc pas vers le reseau.
 *
 * Les curseurs passent par l'awareness et non par le document : ils sont
 * ephemeres et n'ont aucune raison d'etre persistes sur S3.
 */
export const useYjsStore = (session: CanvasSession): UseYjsStoreResult => {
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);

  // Un canvas = un store.
  const store = useMemo(
    () =>
      createTLStore({
        id: session.canvasId,
        shapeUtils: defaultShapeUtils,
        bindingUtils: defaultBindingUtils,
      }),
    [session.canvasId],
  );

  useEffect(() => {
    const hocuspocus = new HocuspocusProvider({
      url: session.websocketUrl,
      name: session.canvasId,
      token: session.token,
    });

    const yRecords = hocuspocus.document.getMap<TLRecord>(RECORDS_KEY);
    const readOnly = session.role === "viewer";
    const cleanups: (() => void)[] = [];

    const onSynced = () => {
      // ---- Distant -> local ---------------------------------------------
      const observer = (event: Y.YMapEvent<TLRecord>, tx: Y.Transaction) => {
        // Nos propres ecritures sont deja dans le store : ne pas les rejouer.
        if (tx.local) return;

        const toPut: TLRecord[] = [];
        const toRemove: TLRecord["id"][] = [];

        event.changes.keys.forEach((change, id) => {
          if (change.action === "delete") {
            toRemove.push(id as TLRecord["id"]);
          } else {
            const record = yRecords.get(id);
            if (record) toPut.push(record);
          }
        });

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };
      yRecords.observe(observer);
      cleanups.push(() => yRecords.unobserve(observer));

      // ---- Amorcage -------------------------------------------------------
      const existing = [...yRecords.values()];
      if (existing.length) {
        store.mergeRemoteChanges(() => store.put(existing));
      } else if (!readOnly) {
        // Document vierge : on y pousse l'etat initial du store (page par
        // defaut, document record), sans quoi il resterait vide pour tous.
        hocuspocus.document.transact(() => {
          for (const record of store.allRecords()) {
            yRecords.set(record.id, record);
          }
        });
      }

      // ---- Local -> distant -----------------------------------------------
      if (!readOnly) {
        const unlisten = store.listen(
          ({ changes }) => {
            hocuspocus.document.transact(() => {
              Object.values(changes.added).forEach((r) =>
                yRecords.set(r.id, r),
              );
              Object.values(changes.updated).forEach(([, r]) =>
                yRecords.set(r.id, r),
              );
              Object.values(changes.removed).forEach((r) =>
                yRecords.delete(r.id),
              );
            });
          },
          // Source "user" uniquement : sinon ce qui arrive du reseau en
          // repartirait aussitot, en boucle.
          { source: "user", scope: "document" },
        );
        cleanups.push(unlisten);
      }

      // ---- Presence distante ----------------------------------------------
      const { awareness } = hocuspocus;
      if (awareness) {
        const onAwareness = () => {
          const presences: TLRecord[] = [];

          awareness.getStates().forEach((state, clientId) => {
            if (clientId === awareness.clientID) return;
            const p = (state as { presence?: PresenceState }).presence;
            if (!p) return;

            presences.push(
              InstancePresenceRecordType.create({
                id: InstancePresenceRecordType.createId(String(clientId)),
                userId: p.userId,
                userName: p.name,
                color: p.color,
                currentPageId: p.pageId as TLPageId,
                selectedShapeIds: p.selectedShapeIds as TLShapeId[],
                cursor: p.cursor
                  ? {
                      x: p.cursor.x,
                      y: p.cursor.y,
                      type: "default",
                      rotation: 0,
                    }
                  : null,
                lastActivityTimestamp: Date.now(),
              }) as unknown as TLRecord,
            );
          });

          store.mergeRemoteChanges(() => {
            // On reconstruit l'ensemble des presences a chaque tick : les
            // clients partis disparaissent ainsi sans traitement particulier.
            const stale = store
              .allRecords()
              .filter((r) => r.typeName === "instance_presence")
              .map((r) => r.id);
            if (stale.length) store.remove(stale);
            if (presences.length) store.put(presences);
          });
        };

        awareness.on("change", onAwareness);
        cleanups.push(() => awareness.off("change", onAwareness));
      }

      // Le provider n'est publie qu'une fois synchronise : rien ne peut etre
      // envoye avant, et cela evite un setState synchrone dans l'effet.
      setProvider(hocuspocus);
      setStoreWithStatus({
        store,
        status: "synced-remote",
        connectionStatus: "online",
      });
    };

    const onDisconnect = () =>
      setStoreWithStatus((current) =>
        current.status === "synced-remote"
          ? { ...current, connectionStatus: "offline" as const }
          : current,
      );

    const onAuthFailed = () =>
      setStoreWithStatus({
        status: "error",
        error: new Error("Acces au canvas refuse"),
      });

    hocuspocus.on("synced", onSynced);
    hocuspocus.on("disconnect", onDisconnect);
    hocuspocus.on("authenticationFailed", onAuthFailed);

    return () => {
      cleanups.forEach((fn) => fn());
      hocuspocus.destroy();
      setProvider(null);
    };
  }, [
    store,
    session.canvasId,
    session.token,
    session.websocketUrl,
    session.role,
  ]);

  return { storeWithStatus, provider };
};

/**
 * Diffuse la presence locale (curseur, selection, page courante).
 * Appelee depuis la page une fois l'editeur monte : c'est le seul endroit ou le
 * pointeur est disponible en coordonnees page.
 */
export const publishPresence = (
  provider: HocuspocusProvider,
  editor: Editor,
  user: { id: string; name: string },
): (() => void) => {
  const send = () => {
    const point = editor.inputs.currentPagePoint;
    const presence: PresenceState = {
      userId: user.id,
      name: user.name,
      color: colorFor(user.id),
      cursor: point ? { x: point.x, y: point.y } : null,
      pageId: editor.getCurrentPageId(),
      selectedShapeIds: editor.getSelectedShapeIds() as unknown as string[],
    };
    provider.awareness?.setLocalStateField("presence", presence);
  };

  send();
  // L'awareness ne doit pas saturer le reseau : ~12 mises a jour/seconde suffisent
  // a rendre un curseur fluide.
  const interval = window.setInterval(send, 80);
  return () => window.clearInterval(interval);
};
