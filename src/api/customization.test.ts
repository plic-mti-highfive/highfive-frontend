// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./client";
import {
  CUSTOMIZATION_UNAVAILABLE_CODE,
  deleteCustomizationImage,
  updateCustomization,
  uploadCustomizationImage,
} from "./customization";
import { DEFAULT_SECTIONS } from "@/domain";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body?: unknown, statusText = "") {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(body === undefined ? null : JSON.stringify(body), {
          status,
          statusText,
        }),
    ),
  );
}

const input = { sections: [...DEFAULT_SECTIONS], gallery: [] };

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("la requete aurait du echouer");
}

describe("routes de personnalisation absentes du serveur", () => {
  it.each([
    [404, { statusCode: 404, message: "Cannot PATCH" }],
    [405, undefined],
    [501, undefined],
  ])("%i devient un message clair, jamais vide", async (status, body) => {
    stubFetch(status, body);
    const error = await failure(updateCustomization("p", input));
    expect(error.code).toBe(CUSTOMIZATION_UNAVAILABLE_CODE);
    expect(error.message).toBe(
      "La personnalisation n'est pas encore disponible sur ce serveur.",
    );
  });

  it("s'applique aussi a l'upload et a la suppression d'image", async () => {
    stubFetch(404);
    const file = new File(["x"], "a.webp", { type: "image/webp" });
    expect((await failure(uploadCustomizationImage("p", file))).code).toBe(
      CUSTOMIZATION_UNAVAILABLE_CODE,
    );
    expect((await failure(deleteCustomizationImage("p", "i"))).code).toBe(
      CUSTOMIZATION_UNAVAILABLE_CODE,
    );
  });

  it("laisse passer une vraie 404 du contrat (projet introuvable)", async () => {
    stubFetch(404, { code: "not_found", message: "Projet introuvable." });
    const error = await failure(updateCustomization("p", input));
    expect(error.code).toBe("not_found");
    expect(error.message).toBe("Projet introuvable.");
  });

  it("laisse passer les autres erreurs (403, 400)", async () => {
    stubFetch(403, { code: "forbidden", message: "Reserve au porteur." });
    expect((await failure(updateCustomization("p", input))).code).toBe(
      "forbidden",
    );
  });
});
