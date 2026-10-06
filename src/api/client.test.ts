// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./client";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body: string | null, statusText: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status, statusText })),
  );
}

async function failure(): Promise<ApiError> {
  try {
    await apiFetch("/x");
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("la requete aurait du echouer");
}

describe("apiFetch — message d'erreur", () => {
  it("reprend le message du corps d'erreur du contrat", async () => {
    stubFetch(400, '{"code":"bad","message":"Trop long."}', "Bad Request");
    const error = await failure();
    expect(error.code).toBe("bad");
    expect(error.message).toBe("Trop long.");
  });

  it("retombe sur le statusText sans corps JSON", async () => {
    stubFetch(404, "<html>Not Found</html>", "Not Found");
    expect((await failure()).message).toBe("Not Found");
  });

  it("n'est jamais vide : statusText vide (HTTP/2) et corps non JSON", async () => {
    stubFetch(404, "<html>Not Found</html>", "");
    const error = await failure();
    expect(error.message).toBe("Erreur inconnue.");
    expect(error.code).toBe("unknown_error");
  });
});
