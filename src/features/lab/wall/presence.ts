import { z } from "zod";
import type { HocuspocusProvider } from "@hocuspocus/provider";
import {
  InstancePresenceRecordType,
  type Editor,
  type TLInstancePresenceID,
  type TLPageId,
  type TLRecord,
  type TLShapeId,
  type TLStore,
} from "@tldraw/editor";
import { presenceColorFor } from "./tldrawTheme";

/** Champ d'awareness Yjs portant la presence (ephemere, jamais persistee). */
const PRESENCE_FIELD = "presence";

/** Etat diffuse aux autres : valide a la reception (donnee non fiable). */
const presenceStateSchema = z.object({
  userId: z.string(),
  name: z.string(),
  color: z.string(),
  cursor: z.object({ x: z.number(), y: z.number() }).nullable(),
  pageId: z.string(),
  selectedShapeIds: z.array(z.string()),
});
type Awareness = NonNullable<HocuspocusProvider["awareness"]>;

export type PresenceState = z.infer<typeof presenceStateSchema>;

/** Awareness -> records `instance_presence` (fonction pure, testable). */
export function presencesFromAwareness(
  states: Map<number, Record<string, unknown>>,
  selfClientId: number,
  now: number,
): TLRecord[] {
  const records: TLRecord[] = [];
  states.forEach((state, clientId) => {
    if (clientId === selfClientId) return;
    const parsed = presenceStateSchema.safeParse(state[PRESENCE_FIELD]);
    if (!parsed.success) return;
    const p = parsed.data;
    records.push(
      InstancePresenceRecordType.create({
        id: InstancePresenceRecordType.createId(String(clientId)),
        userId: p.userId,
        userName: p.name,
        color: p.color,
        currentPageId: p.pageId as TLPageId,
        selectedShapeIds: p.selectedShapeIds as TLShapeId[],
        cursor: p.cursor
          ? { x: p.cursor.x, y: p.cursor.y, type: "default", rotation: 0 }
          : null,
        lastActivityTimestamp: now,
      }),
    );
  });
  return records;
}

/**
 * Affiche dans le store les curseurs/selections des autres participants.
 * Les presences sont reconstruites a chaque changement : les participants
 * partis disparaissent sans traitement particulier.
 */
export function bindRemotePresence(
  store: TLStore,
  awareness: Awareness,
): () => void {
  const apply = () => {
    const presences = presencesFromAwareness(
      awareness.getStates() as Map<number, Record<string, unknown>>,
      awareness.clientID,
      Date.now(),
    );
    store.mergeRemoteChanges(() => {
      const stale = store
        .allRecords()
        .filter((record) => record.typeName === "instance_presence")
        .map((record) => record.id as TLInstancePresenceID);
      if (stale.length > 0) store.remove(stale);
      if (presences.length > 0) store.put(presences);
    });
  };
  awareness.on("change", apply);
  apply();
  return () => {
    awareness.off("change", apply);
    awareness.setLocalState(null);
  };
}

/**
 * Diffuse la presence locale (curseur, selection, page courante). Echantillonne
 * ~12 fois par seconde et n'emet que si l'etat change.
 */
export function publishLocalPresence(
  awareness: Awareness,
  editor: Editor,
  user: { id: string; name: string },
): () => void {
  let last = "";
  const send = () => {
    const point = editor.inputs.getCurrentPagePoint();
    const state: PresenceState = {
      userId: user.id,
      name: user.name,
      color: presenceColorFor(user.id),
      cursor: { x: point.x, y: point.y },
      pageId: editor.getCurrentPageId(),
      selectedShapeIds: [...editor.getSelectedShapeIds()],
    };
    const serialized = JSON.stringify(state);
    if (serialized === last) return;
    last = serialized;
    awareness.setLocalStateField(PRESENCE_FIELD, state);
  };
  send();
  const interval = window.setInterval(send, 80);
  return () => window.clearInterval(interval);
}
