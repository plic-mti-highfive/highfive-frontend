import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { apiConfig } from "@/api/config";
import { getDb, seedDb } from "../db";
import { demoDataset } from "../data";
import { alexRivera, camillePetit } from "../data/users";
import { reportHandlers } from "./reports";

const server = setupServer(...reportHandlers);
const AUTHOR_TOKEN = "author-token";
const READER_TOKEN = "reader-token";

function report(body: unknown, token?: string) {
  return fetch(`${apiConfig.baseUrl}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

/** Un commentaire de la fiche d'Alex, ecrit par quelqu'un d'autre que Camille et Alex. */
function foreignComment() {
  const comment = getDb().comments.findOne(
    (c) => c.authorId !== alexRivera.id && c.authorId !== camillePetit.id,
  );
  if (!comment) throw new Error("commentaire de demo introuvable");
  return comment;
}

beforeAll(() => {
  vi.stubEnv("VITE_MOCK_DELAY", "off");
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
beforeEach(() => {
  const db = seedDb(demoDataset);
  db.sessions.set(AUTHOR_TOKEN, alexRivera.id);
  db.sessions.set(READER_TOKEN, camillePetit.id);
});

describe("POST /reports", () => {
  it("401 sans session", async () => {
    const target = foreignComment();
    const response = await report({
      targetType: "comment",
      targetId: target.id,
      reason: "spam",
    });
    expect(response.status).toBe(401);
  });

  it("201 : cree un signalement `new` et le range dans la file", async () => {
    const target = foreignComment();
    const before = getDb().reports.all().length;
    const response = await report(
      {
        targetType: "comment",
        targetId: target.id,
        reason: "spam",
        detail: "  Revient sur plusieurs fiches  ",
      },
      READER_TOKEN,
    );
    expect(response.status).toBe(201);
    const created = (await response.json()) as {
      status: string;
      reporterId: string;
      detail?: string;
    };
    expect(created.status).toBe("new");
    expect(created.reporterId).toBe(camillePetit.id);
    expect(created.detail).toBe("Revient sur plusieurs fiches");
    expect(getDb().reports.all()).toHaveLength(before + 1);
  });

  it("400 pour un motif hors liste", async () => {
    const target = foreignComment();
    const response = await report(
      { targetType: "comment", targetId: target.id, reason: "boring" },
      READER_TOKEN,
    );
    expect(response.status).toBe(400);
  });

  it("404 pour un contenu qui n'existe plus", async () => {
    const response = await report(
      {
        targetType: "comment",
        targetId: "00000000-0000-4000-8000-0000000000ff",
        reason: "spam",
      },
      READER_TOKEN,
    );
    expect(response.status).toBe(404);
  });

  it("403 pour son propre contenu", async () => {
    const own = getDb().comments.findOne((c) => c.authorId === alexRivera.id);
    if (!own) throw new Error("commentaire d'Alex introuvable");
    const response = await report(
      { targetType: "comment", targetId: own.id, reason: "spam" },
      AUTHOR_TOKEN,
    );
    expect(response.status).toBe(403);
  });

  it("409 si la meme personne signale deux fois la meme cible", async () => {
    const target = foreignComment();
    const body = {
      targetType: "comment",
      targetId: target.id,
      reason: "harassment",
    };
    expect((await report(body, READER_TOKEN)).status).toBe(201);
    expect((await report(body, READER_TOKEN)).status).toBe(409);
  });
});
