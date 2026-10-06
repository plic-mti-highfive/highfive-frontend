import * as Y from "yjs";
import type { TLRecord, TLStore } from "@tldraw/editor";

/**
 * Cle de la `Y.Map` qui porte les records tldraw. Doit rester identique a
 * `CANVAS_KEYS.RECORDS` du service canvas (`highfive-backend-canvas`) : c'est
 * le contrat du document, l'export du Mur (suggestion de taches par l'IA) la
 * lit sous ce nom.
 */
export const WALL_RECORDS_KEY = "tl_records";

/** Origine des transactions ecrites par ce module (pour ignorer leur echo). */
const LOCAL_ORIGIN = Symbol("wall-store-sync");

type RecordsMap = Y.Map<TLRecord>;

/**
 * Seuls les records de scope `document` (formes, liaisons, pages, assets,
 * document) sont partages. `instance`, `camera`, `pointer`,
 * `instance_page_state` restent propres a chaque personne.
 */
export function isSharedRecord(
  store: Pick<TLStore, "scopedTypes">,
  record: Pick<TLRecord, "typeName">,
): boolean {
  return store.scopedTypes.document.has(record.typeName);
}

/** Diff minimal d'un `store.listen` (sous-ensemble de `RecordsDiff`). */
export interface RecordsChanges {
  added: Record<string, TLRecord>;
  updated: Record<string, [from: TLRecord, to: TLRecord]>;
  removed: Record<string, TLRecord>;
}

/** Local -> distant : applique un diff du store dans la `Y.Map` (une transaction). */
export function pushChangesToYjs(
  store: Pick<TLStore, "scopedTypes">,
  doc: Y.Doc,
  yRecords: RecordsMap,
  changes: RecordsChanges,
): void {
  doc.transact(() => {
    for (const record of Object.values(changes.added)) {
      if (isSharedRecord(store, record)) yRecords.set(record.id, record);
    }
    for (const [, record] of Object.values(changes.updated)) {
      if (isSharedRecord(store, record)) yRecords.set(record.id, record);
    }
    for (const record of Object.values(changes.removed)) {
      if (isSharedRecord(store, record)) yRecords.delete(record.id);
    }
  }, LOCAL_ORIGIN);
}

/** Pose un lot de records distants dans le store sans le renvoyer au reseau. */
function putRemoteRecords(
  store: TLStore,
  records: TLRecord[],
  onInvalid?: (record: TLRecord, error: unknown) => void,
): void {
  for (const record of records) {
    if (!isSharedRecord(store, record)) continue;
    try {
      store.put([record]);
    } catch (error) {
      // Un record distant que ce client ne sait pas valider (version de
      // schema differente) ne doit pas empecher d'afficher le reste du Mur.
      onInvalid?.(record, error);
    }
  }
}

/**
 * Distant -> local : reprend dans le store les changements d'un evenement
 * `Y.Map`. Les ecritures issues de ce module (`LOCAL_ORIGIN`) sont deja dans
 * le store et sont ignorees.
 */
export function pullYjsEventIntoStore(
  store: TLStore,
  yRecords: RecordsMap,
  event: Y.YMapEvent<TLRecord>,
  onInvalid?: (record: TLRecord, error: unknown) => void,
): void {
  if (event.transaction.origin === LOCAL_ORIGIN) return;

  const toPut: TLRecord[] = [];
  const toRemove: TLRecord["id"][] = [];
  event.changes.keys.forEach((change, id) => {
    if (change.action === "delete") {
      toRemove.push(id as TLRecord["id"]);
      return;
    }
    const record = yRecords.get(id);
    if (record) toPut.push(record);
  });

  store.mergeRemoteChanges(() => {
    const removable = toRemove.filter((id) => {
      const existing = store.get(id);
      return existing !== undefined && isSharedRecord(store, existing);
    });
    if (removable.length > 0) store.remove(removable);
    putRemoteRecords(store, toPut, onInvalid);
  });
}

/**
 * Amorcage a la premiere synchronisation :
 * - document distant non vide : il fait foi (les records partages locaux
 *   absents du distant, ex. la page par defaut, sont retires puis le distant
 *   est charge) ;
 * - document vierge : on y publie l'etat initial du store (page par defaut),
 *   sauf en lecture seule (le serveur refuserait l'ecriture).
 */
export function seedStoreAndDocument(
  store: TLStore,
  doc: Y.Doc,
  yRecords: RecordsMap,
  options: { readOnly: boolean; onInvalid?: (r: TLRecord, e: unknown) => void },
): void {
  const remote = [...yRecords.values()];
  const hasRemotePage = remote.some((record) => record.typeName === "page");
  if (remote.length > 0 && hasRemotePage) {
    store.mergeRemoteChanges(() => {
      const remoteIds = new Set(remote.map((record) => record.id as string));
      const stale = store
        .allRecords()
        .filter(
          (record) =>
            record.typeName !== "document" &&
            isSharedRecord(store, record) &&
            !remoteIds.has(record.id),
        )
        .map((record) => record.id);
      if (stale.length > 0) store.remove(stale);
      putRemoteRecords(store, remote, options.onInvalid);
    });
    return;
  }
  if (options.readOnly) return;
  doc.transact(() => {
    for (const record of store.allRecords()) {
      if (isSharedRecord(store, record)) yRecords.set(record.id, record);
    }
  }, LOCAL_ORIGIN);
}

/**
 * Branche un store tldraw sur la `Y.Map` des records d'un `Y.Doc` deja
 * synchronise (amorcage + deux flux, tenus separes pour eviter toute boucle) :
 *  - local -> distant : uniquement les changements de source `user` ;
 *  - distant -> local : via `mergeRemoteChanges` (source `remote`).
 * Retourne la fonction de nettoyage (retire les ecouteurs).
 */
export function bindStoreToYjs(
  store: TLStore,
  doc: Y.Doc,
  options: { readOnly: boolean; onInvalid?: (r: TLRecord, e: unknown) => void },
): () => void {
  const yRecords = doc.getMap<TLRecord>(WALL_RECORDS_KEY);

  const observer = (event: Y.YMapEvent<TLRecord>) =>
    pullYjsEventIntoStore(store, yRecords, event, options.onInvalid);
  yRecords.observe(observer);

  seedStoreAndDocument(store, doc, yRecords, options);

  let unlisten: (() => void) | undefined;
  if (!options.readOnly) {
    unlisten = store.listen(
      ({ changes }) => pushChangesToYjs(store, doc, yRecords, changes),
      { source: "user", scope: "document" },
    );
  }

  return () => {
    yRecords.unobserve(observer);
    unlisten?.();
  };
}
