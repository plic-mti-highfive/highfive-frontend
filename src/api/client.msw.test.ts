// @vitest-environment jsdom
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { server, setupMswServer } from "@/test/msw";
import { apiUrl } from "@/mocks/handlers/utils";
import { ApiError, apiFetch } from "./client";
import { tokenStorage } from "./token-storage";
import { getCurrentUser, login } from "./auth";

setupMswServer();

describe("apiFetch — requetes (MSW)", () => {
  it("envoie l'en-tete Authorization quand un jeton est stocke", async () => {
    let header: string | null = null;
    server.use(
      http.get(apiUrl("/ping"), ({ request }) => {
        header = request.headers.get("Authorization");
        return HttpResponse.json({ ok: true });
      }),
    );
    tokenStorage.setAccessToken("abc123");
    await apiFetch("/ping");
    expect(header).toBe("Bearer abc123");
  });

  it("n'envoie pas d'en-tete Authorization sans jeton", async () => {
    let header: string | null = "initial";
    server.use(
      http.get(apiUrl("/ping"), ({ request }) => {
        header = request.headers.get("Authorization");
        return HttpResponse.json({});
      }),
    );
    await apiFetch("/ping");
    expect(header).toBeNull();
  });

  it("serialise les parametres de requete : tableaux joints, undefined ignore", async () => {
    let search = "";
    server.use(
      http.get(apiUrl("/ping"), ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({});
      }),
    );
    await apiFetch("/ping", {
      query: { tags: ["a", "b"], q: "mur", page: 2, vide: undefined },
    });
    const params = new URLSearchParams(search);
    expect(params.get("tags")).toBe("a,b");
    expect(params.get("q")).toBe("mur");
    expect(params.get("page")).toBe("2");
    expect(params.has("vide")).toBe(false);
  });

  it("envoie un corps JSON avec Content-Type", async () => {
    let received: unknown;
    let contentType: string | null = null;
    server.use(
      http.post(apiUrl("/ping"), async ({ request }) => {
        contentType = request.headers.get("Content-Type");
        received = await request.json();
        return HttpResponse.json({});
      }),
    );
    await apiFetch("/ping", { method: "POST", body: { a: 1 } });
    expect(contentType).toBe("application/json");
    expect(received).toEqual({ a: 1 });
  });

  it("retourne undefined sur une reponse 204", async () => {
    server.use(
      http.post(apiUrl("/ping"), () => new HttpResponse(null, { status: 204 })),
    );
    await expect(
      apiFetch("/ping", { method: "POST" }),
    ).resolves.toBeUndefined();
  });

  it("retourne le corps JSON avec un schema valide", async () => {
    server.use(http.get(apiUrl("/ping"), () => HttpResponse.json({ n: 3 })));
    const data = await apiFetch("/ping", {
      schema: z.object({ n: z.number() }),
    });
    expect(data.n).toBe(3);
  });

  it("une reponse qui derive du schema logge un warning sans jeter (DEV)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    server.use(http.get(apiUrl("/ping"), () => HttpResponse.json({ n: "x" })));
    await expect(
      apiFetch("/ping", { schema: z.object({ n: z.number() }) }),
    ).resolves.toEqual({ n: "x" });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("transforme une erreur reseau en ApiError(0, network_error) en francais", async () => {
    server.use(http.get(apiUrl("/ping"), () => HttpResponse.error()));
    const error = await apiFetch("/ping").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).code).toBe("network_error");
    expect((error as ApiError).message).toBe(
      "Impossible de contacter le serveur.",
    );
  });

  it("transforme un 401 du contrat en ApiError avec message francais", async () => {
    const error = await login({
      email: "alex.rivera@example.com",
      password: "mauvais-mot-de-passe",
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).code).toBe("unauthorized");
    expect((error as ApiError).message).toBe("Connecte-toi pour continuer.");
  });

  it("conserve les details d'une erreur de validation", async () => {
    server.use(
      http.post(apiUrl("/ping"), () =>
        HttpResponse.json(
          { code: "validation_error", message: "Invalide.", details: { a: 1 } },
          { status: 400 },
        ),
      ),
    );
    const error = (await apiFetch("/ping", { method: "POST" }).catch(
      (e: unknown) => e,
    )) as ApiError;
    expect(error.details).toEqual({ a: 1 });
  });
});

describe("api/auth (MSW)", () => {
  it("login retourne une session valide puis /me authentifie avec le jeton", async () => {
    const session = await login({
      email: "alex.rivera@example.com",
      password: "demo1234",
    });
    expect(session.user.username).toBe("alex.rivera");
    tokenStorage.setAccessToken(session.token);
    const me = await getCurrentUser();
    expect(me.email).toBe("alex.rivera@example.com");
  });

  it("/me sans jeton : ApiError 401", async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({ status: 401 });
  });
});
