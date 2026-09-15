import type { z } from "zod";
import { apiConfig } from "./config";
import { tokenStorage } from "./token-storage";
import { type ApiErrorBody } from "@/domain";

/**
 * Client fetch unique du contrat v2 (V2-5, V2-11). Toute erreur — y compris
 * reseau — devient une `ApiError` ; en DEV la reponse est validee contre le
 * schema attendu et une derive logge un warning, sans jamais jeter (et rien
 * n'est valide en prod : cout nul en production).
 *
 * Prefixe fixe `/api` (voir docs/v2/API-ROUTES.md) au-dessus de
 * `apiConfig.baseUrl` (VITE_API_URL, `src/api/config.ts`).
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type QueryValue = string | number | boolean | string[] | undefined;

export interface ApiFetchOptions<TSchema extends z.ZodType> {
  method?: Method;
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Schema de la reponse attendue, utilise uniquement pour la validation DEV. */
  schema?: TSchema;
  signal?: AbortSignal;
}

type ApiFetchOptionsNoSchema = Omit<ApiFetchOptions<z.ZodType>, "schema">;

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${apiConfig.baseUrl}/api${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : String(value),
      );
    }
  }
  return url.toString();
}

function buildHeaders(hasJsonBody: boolean): HeadersInit {
  const headers: Record<string, string> = {};
  if (hasJsonBody) headers["Content-Type"] = "application/json";
  const token = tokenStorage.getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function looksLikeApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value
  );
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Route dont la reponse est validee/typee par `schema` (200 avec corps). */
export function apiFetch<TSchema extends z.ZodType>(
  path: string,
  options: ApiFetchOptions<TSchema> & { schema: TSchema },
): Promise<z.infer<TSchema>>;
/** Route sans corps de reponse attendu (204, ou action sans schema declare). */
export function apiFetch(
  path: string,
  options?: ApiFetchOptionsNoSchema,
): Promise<void>;
export async function apiFetch(
  path: string,
  options: ApiFetchOptions<z.ZodType> = {},
): Promise<unknown> {
  const { method = "GET", body, query, schema, signal } = options;
  const url = buildUrl(path, query);
  const formData = isFormData(body);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: buildHeaders(!formData && body !== undefined),
      body:
        body === undefined ? undefined : formData ? body : JSON.stringify(body),
      signal,
    });
  } catch (networkError) {
    throw new ApiError(
      0,
      "network_error",
      "Impossible de contacter le serveur.",
      networkError,
    );
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const errorBody = looksLikeApiErrorBody(payload) ? payload : undefined;
    throw new ApiError(
      response.status,
      errorBody?.code ?? "unknown_error",
      errorBody?.message ?? response.statusText ?? "Erreur inconnue.",
      errorBody?.details,
    );
  }

  if (schema && import.meta.env.DEV) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      console.warn(
        `[apiFetch] la reponse de ${method} ${path} ne respecte pas le schema attendu`,
        result.error,
      );
    }
  }

  return payload;
}
