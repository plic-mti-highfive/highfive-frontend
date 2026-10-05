import { setupServer } from "msw/node";
import { presetColor } from "@shared/lib/accentPresets";
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
import {
  DEFAULT_SECTIONS,
  projectSchema,
  type ProjectCustomization,
} from "@/domain";
import { apiConfig } from "@/api/config";
import { getDb, seedDb } from "../db";
import { demoDataset } from "../data";
import { alexRivera, annickR, camillePetit } from "../data/users";
import { toProjectSummary } from "./projectHelpers";
import { adminHandlers } from "./admin";
import { customizationHandlers, MAX_IMAGE_SIZE } from "./customization";

const server = setupServer(...customizationHandlers, ...adminHandlers);
const OWNER_TOKEN = "owner-token";
const MEMBER_TOKEN = "member-token";
const ADMIN_TOKEN = "admin-token";
const CO_OWNER_TOKEN = "co-owner-token";

// Projet de demo dont Alex Rivera est porteur.
const SLUG = "fresque-murale-collaborative";
const OTHER_SLUG = "jardin-partage-derriere-lecole";

function url(path: string) {
  return `${apiConfig.baseUrl}/api${path}`;
}

function request(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init;
  return fetch(url(path), {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

function patch(slug: string, body: unknown, token?: string) {
  return request(`/projects/${slug}/customization`, {
    method: "PATCH",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function upload(slug: string, file: File, token?: string) {
  const form = new FormData();
  form.append("file", file);
  return request(`/projects/${slug}/customization/images`, {
    method: "POST",
    token,
    body: form,
  });
}

function pngFile(size = 16, type = "image/png") {
  return new File([new Uint8Array(size)], "image.png", { type });
}

function project(slug: string) {
  const found = getDb().projects.findOne((p) => p.slug === slug);
  if (!found) throw new Error(`projet ${slug} introuvable`);
  return found;
}

function emptyCustomization(): ProjectCustomization {
  return { sections: [...DEFAULT_SECTIONS], gallery: [] };
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
  db.sessions.set(OWNER_TOKEN, alexRivera.id);
  db.sessions.set(MEMBER_TOKEN, camillePetit.id);
  db.sessions.set(ADMIN_TOKEN, annickR.id);
  // Un co-porteur du projet d'Alex : n'a pas le droit de personnaliser.
  db.sessions.set(CO_OWNER_TOKEN, camillePetit.id);
  db.memberships.insert({
    projectId: project(SLUG).id,
    userId: camillePetit.id,
    role: "co_owner",
    joinedAt: "2026-09-01T10:00:00.000Z",
    blocked: false,
  });
});

describe("PATCH /projects/:slug/customization", () => {
  it("401 sans session", async () => {
    expect((await patch(SLUG, emptyCustomization())).status).toBe(401);
  });

  it("403 pour un co-porteur (porteur seul)", async () => {
    const response = await patch(SLUG, emptyCustomization(), CO_OWNER_TOKEN);
    expect(response.status).toBe(403);
  });

  it("403 pour un porteur qui vise le projet d'un autre", async () => {
    const response = await patch(OTHER_SLUG, emptyCustomization(), OWNER_TOKEN);
    expect(response.status).toBe(403);
  });

  it("404 pour un projet inconnu", async () => {
    expect(
      (await patch("n-existe-pas", emptyCustomization(), OWNER_TOKEN)).status,
    ).toBe(404);
  });

  it("400 si le corps est invalide (alt manquant)", async () => {
    const stored = project(SLUG).customization!;
    const body: ProjectCustomization = {
      ...stored,
      gallery: [{ ...stored.gallery[0], alt: "", decorative: false }],
    };
    expect((await patch(SLUG, body, OWNER_TOKEN)).status).toBe(400);
  });

  it("400 si une image n'a pas ete televersee pour ce projet", async () => {
    const foreignImage = project(OTHER_SLUG).customization!.gallery[0];
    const body: ProjectCustomization = {
      ...emptyCustomization(),
      gallery: [foreignImage],
    };
    const response = await patch(SLUG, body, OWNER_TOKEN);
    expect(response.status).toBe(400);
  });

  it("le porteur remplace la personnalisation et le projet renvoye la porte", async () => {
    const body: ProjectCustomization = {
      ...emptyCustomization(),
      accent: presetColor("purple"),
    };
    const response = await patch(SLUG, body, OWNER_TOKEN);
    expect(response.status).toBe(200);
    const updated = projectSchema.parse(await response.json());
    expect(updated.customization).toEqual(body);
    expect(project(SLUG).customization).toEqual(body);
  });

  it("l'accent se retrouve dans le resume de carte", async () => {
    await patch(
      SLUG,
      { ...emptyCustomization(), accent: presetColor("orange") },
      OWNER_TOKEN,
    );
    expect(toProjectSummary(project(SLUG)).accent).toBe(presetColor("orange"));
    expect(toProjectSummary(project(OTHER_SLUG)).accent).toBe(
      presetColor("apple"),
    );
  });

  it("la personnalisation suit le projet au transfert (le patch ne la remet pas a zero)", () => {
    const before = project(SLUG).customization;
    getDb().projects.update((p) => p.slug === SLUG, {
      ownerId: camillePetit.id,
    });
    expect(project(SLUG).customization).toEqual(before);
  });
});

describe("POST /projects/:slug/customization/images", () => {
  it("401 sans session et 403 hors porteur", async () => {
    expect((await upload(SLUG, pngFile())).status).toBe(401);
    expect((await upload(SLUG, pngFile(), CO_OWNER_TOKEN)).status).toBe(403);
  });

  it("refuse un format hors liste blanche (GIF, SVG)", async () => {
    expect(
      (await upload(SLUG, pngFile(16, "image/gif"), OWNER_TOKEN)).status,
    ).toBe(400);
    expect(
      (await upload(SLUG, pngFile(16, "image/svg+xml"), OWNER_TOKEN)).status,
    ).toBe(400);
  });

  it("refuse une image de plus de 2 Mo", async () => {
    const response = await upload(
      SLUG,
      pngFile(MAX_IMAGE_SIZE + 1),
      OWNER_TOKEN,
    );
    expect(response.status).toBe(400);
  });

  it("televerse l'image : 201, data URL, puis le PATCH peut la referencer", async () => {
    const response = await upload(SLUG, pngFile(), OWNER_TOKEN);
    expect(response.status).toBe(201);
    const { id, url: imageUrl } = (await response.json()) as {
      id: string;
      url: string;
    };
    expect(imageUrl.startsWith("data:image/png;base64,")).toBe(true);

    const body: ProjectCustomization = {
      ...emptyCustomization(),
      gallery: [
        { id, url: imageUrl, alt: "Nouvelle image", decorative: false },
      ],
    };
    expect((await patch(SLUG, body, OWNER_TOKEN)).status).toBe(200);
  });
});

describe("DELETE /projects/:slug/customization/images/:imageId", () => {
  function deleteImage(slug: string, imageId: string, token?: string) {
    return request(`/projects/${slug}/customization/images/${imageId}`, {
      method: "DELETE",
      token,
    });
  }

  it("403 pour un membre ordinaire", async () => {
    const image = project(SLUG).customization!.gallery[0];
    expect((await deleteImage(SLUG, image.id, MEMBER_TOKEN)).status).toBe(403);
  });

  it("le porteur retire une image de galerie : table et projet nettoyes", async () => {
    const before = project(SLUG).customization!;
    const image = before.gallery[0];
    expect((await deleteImage(SLUG, image.id, OWNER_TOKEN)).status).toBe(204);
    const after = project(SLUG).customization!;
    expect(after.gallery.map((item) => item.id)).not.toContain(image.id);
    expect(after.gallery).toHaveLength(before.gallery.length - 1);
    // Les fixtures partagees ne sont pas mutees.
    expect(before.gallery).toHaveLength(2);
    expect(
      getDb().customizationImages.findOne((i) => i.id === image.id),
    ).toBeUndefined();
  });

  it("un admin retire la banniere d'un projet qui n'est pas le sien", async () => {
    const banner = project(SLUG).customization!.banner!;
    expect((await deleteImage(SLUG, banner.id, ADMIN_TOKEN)).status).toBe(204);
    expect(project(SLUG).customization!.banner).toBeUndefined();
  });

  it("404 pour une image d'un autre projet", async () => {
    const foreign = project(OTHER_SLUG).customization!.gallery[0];
    expect((await deleteImage(SLUG, foreign.id, OWNER_TOKEN)).status).toBe(404);
  });
});

describe("moderation admin des medias", () => {
  function getMedia(slug: string, token?: string) {
    return request(`/admin/projects/${slug}/media`, { token });
  }
  function removeImage(
    slug: string,
    imageId: string,
    token?: string,
    body?: unknown,
  ) {
    return request(`/projects/${slug}/customization/images/${imageId}`, {
      method: "DELETE",
      token,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  const actions = () =>
    getDb().adminActions.find((a) => a.type === "remove_project_media");

  it("GET /admin/projects/:slug/media : reserve a l'administration", async () => {
    expect((await getMedia(SLUG)).status).toBe(401);
    expect((await getMedia(SLUG, OWNER_TOKEN)).status).toBe(403);
    expect((await getMedia(SLUG, MEMBER_TOKEN)).status).toBe(403);
    expect((await getMedia("n-existe-pas", ADMIN_TOKEN)).status).toBe(404);
  });

  it("renvoie la banniere et la galerie du projet", async () => {
    const response = await getMedia(SLUG, ADMIN_TOKEN);
    expect(response.status).toBe(200);
    const media = (await response.json()) as {
      banner?: { id: string };
      gallery: { id: string }[];
    };
    const stored = project(SLUG).customization!;
    expect(media.banner?.id).toBe(stored.banner?.id);
    expect(media.gallery.map((g) => g.id)).toEqual(
      stored.gallery.map((g) => g.id),
    );
  });

  it("renvoie une galerie vide pour un projet sans personnalisation", async () => {
    const plain = getDb()
      .projects.all()
      .find((p) => !p.customization)!;
    const response = await getMedia(plain.slug, ADMIN_TOKEN);
    expect(await response.json()).toEqual({ gallery: [] });
  });

  it("l'admin voit aussi les medias d'un projet prive ou en brouillon", async () => {
    getDb().projects.update((p) => p.slug === SLUG, {
      visibility: "private",
      participation: "on_invite",
      state: "draft",
    });
    expect((await getMedia(SLUG, ADMIN_TOKEN)).status).toBe(200);
  });

  it("un admin qui retire un media est journalise avec son motif", async () => {
    const image = project(SLUG).customization!.gallery[0];
    const response = await removeImage(SLUG, image.id, ADMIN_TOKEN, {
      reason: "  Contenu inapproprie  ",
    });
    expect(response.status).toBe(204);
    const [action] = actions();
    expect(action).toMatchObject({
      adminId: annickR.id,
      type: "remove_project_media",
      targetType: "project",
      targetId: project(SLUG).id,
      reason: "Contenu inapproprie",
    });
    expect(project(SLUG).customization!.gallery.map((g) => g.id)).not.toContain(
      image.id,
    );
  });

  it("le motif est facultatif et borne a 1000 caracteres", async () => {
    const [first, second] = project(SLUG).customization!.gallery;
    await removeImage(SLUG, first.id, ADMIN_TOKEN);
    await removeImage(SLUG, second.id, ADMIN_TOKEN, {
      reason: "x".repeat(1500),
    });
    const [withoutReason, withLongReason] = actions();
    expect(withoutReason.reason).toBeUndefined();
    expect(withLongReason.reason).toHaveLength(1000);
  });

  it("le porteur qui retire son propre media n'est pas journalise", async () => {
    const image = project(SLUG).customization!.gallery[0];
    expect((await removeImage(SLUG, image.id, OWNER_TOKEN)).status).toBe(204);
    expect(actions()).toHaveLength(0);
  });

  it("un refus (membre) ni ne retire ni ne journalise", async () => {
    const image = project(SLUG).customization!.gallery[0];
    expect((await removeImage(SLUG, image.id, MEMBER_TOKEN)).status).toBe(403);
    expect(actions()).toHaveLength(0);
    expect(project(SLUG).customization!.gallery.map((g) => g.id)).toContain(
      image.id,
    );
  });
});
