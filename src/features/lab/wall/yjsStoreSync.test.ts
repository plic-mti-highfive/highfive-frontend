import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createTLStore, type TLRecord, type TLStore } from "@tldraw/editor";
import { defaultBindingUtils, defaultShapeUtils } from "tldraw";
import { createShapeId, type TLPageId } from "@tldraw/editor";
import {
  WALL_RECORDS_KEY,
  bindStoreToYjs,
  isSharedRecord,
} from "./yjsStoreSync";

/**
 * Store vierge, rendu utilisable comme le fait le constructeur de l'éditeur
 * (page par défaut, document, instance) ; l'API est interne à tldraw.
 */
function newStore(): TLStore {
  const store = createTLStore({
    shapeUtils: defaultShapeUtils,
    bindingUtils: defaultBindingUtils,
  });
  (store as unknown as { ensureStoreIsUsable(): void }).ensureStoreIsUsable();
  return store;
}

/** Relie deux Y.Doc en mémoire (comme le ferait Hocuspocus, sans réseau). */
function link(a: Y.Doc, b: Y.Doc) {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a), "link");
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b), "link");
  a.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin !== "link") Y.applyUpdate(b, update, "link");
  });
  b.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin !== "link") Y.applyUpdate(a, update, "link");
  });
}

function notePut(store: TLStore, id: string, x: number) {
  const pageId = store.allRecords().find((r) => r.typeName === "page")!
    .id as TLPageId;
  const util = defaultShapeUtils.find((u) => u.type === "geo")!;
  const record = {
    id: createShapeId(id),
    typeName: "shape",
    type: "geo",
    x,
    y: 0,
    rotation: 0,
    index: "a1",
    parentId: pageId,
    isLocked: false,
    opacity: 1,
    meta: {},
    props: (
      util.prototype as unknown as { getDefaultProps(): object }
    ).getDefaultProps.call(
      new (util as unknown as new (e: unknown) => {
        getDefaultProps(): object;
      })(undefined),
    ),
  } as unknown as TLRecord;
  // Comme une action de l'utilisateur : source "user" (hors mergeRemoteChanges).
  store.put([record]);
  return record;
}

describe("isSharedRecord", () => {
  it("ne partage que les records de scope document", () => {
    const store = newStore();
    const shared = store.allRecords().filter((r) => isSharedRecord(store, r));
    const local = store.allRecords().filter((r) => !isSharedRecord(store, r));
    expect(shared.map((r) => r.typeName)).toEqual(
      expect.arrayContaining(["document", "page"]),
    );
    for (const record of local) {
      expect([
        "instance",
        "camera",
        "instance_page_state",
        "pointer",
      ]).toContain(record.typeName);
    }
    expect(shared.every((r) => r.typeName !== "instance")).toBe(true);
  });
});

describe("bindStoreToYjs", () => {
  it("document vierge : publie l'état initial (page, document) sans instance ni caméra", () => {
    const store = newStore();
    const doc = new Y.Doc();
    const unbind = bindStoreToYjs(store, doc, { readOnly: false });
    const types = [...doc.getMap<TLRecord>(WALL_RECORDS_KEY).values()].map(
      (r) => r.typeName,
    );
    expect(types).toContain("page");
    expect(types).toContain("document");
    expect(types).not.toContain("instance");
    expect(types).not.toContain("camera");
    unbind();
  });

  it("lecture seule : ne publie rien sur un document vierge", () => {
    const doc = new Y.Doc();
    bindStoreToYjs(newStore(), doc, { readOnly: true })();
    expect(doc.getMap(WALL_RECORDS_KEY).size).toBe(0);
  });

  it("propage une forme créée dans un store vers l'autre, puis sa suppression", () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const storeA = newStore();
    const storeB = newStore();

    bindStoreToYjs(storeA, docA, { readOnly: false });
    link(docA, docB); // B reçoit l'état de A avant de se lier
    bindStoreToYjs(storeB, docB, { readOnly: false });

    const record = notePut(storeA, "note1", 42);
    expect(storeB.get(record.id)).toMatchObject({ x: 42 });

    storeA.remove([record.id]);
    expect(storeB.get(record.id)).toBeUndefined();
  });

  it("ne renvoie pas au réseau ce qui vient du réseau (pas de boucle)", () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const storeA = newStore();
    const storeB = newStore();
    bindStoreToYjs(storeA, docA, { readOnly: false });
    link(docA, docB);
    bindStoreToYjs(storeB, docB, { readOnly: false });

    let updatesFromB = 0;
    docB.on("update", (_u: Uint8Array, origin: unknown) => {
      if (origin !== "link") updatesFromB++;
    });
    notePut(storeA, "note2", 1);
    expect(updatesFromB).toBe(0);
  });

  it("le document distant fait foi : le nouveau client reprend les formes existantes", () => {
    const docA = new Y.Doc();
    const storeA = newStore();
    bindStoreToYjs(storeA, docA, { readOnly: false });
    const record = notePut(storeA, "note3", 7);

    const docB = new Y.Doc();
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
    const storeB = newStore();
    bindStoreToYjs(storeB, docB, { readOnly: true });

    expect(storeB.get(record.id)).toMatchObject({ x: 7 });
  });

  it("une édition locale n'écrit pas les records de session dans le document", () => {
    const doc = new Y.Doc();
    const store = newStore();
    bindStoreToYjs(store, doc, { readOnly: false });
    const before = doc.getMap(WALL_RECORDS_KEY).size;
    const instance = store.allRecords().find((r) => r.typeName === "instance")!;
    store.put([{ ...instance, isReadonly: true } as TLRecord]);
    expect(doc.getMap(WALL_RECORDS_KEY).size).toBe(before);
  });

  it("le nettoyage détache les écouteurs", () => {
    const doc = new Y.Doc();
    const store = newStore();
    const unbind = bindStoreToYjs(store, doc, { readOnly: false });
    unbind();
    const before = doc.getMap(WALL_RECORDS_KEY).size;
    notePut(store, "note4", 3);
    expect(doc.getMap(WALL_RECORDS_KEY).size).toBe(before);
  });
});
