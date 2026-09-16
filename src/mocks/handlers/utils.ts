import { delay as mswDelay, HttpResponse } from "msw";
import { apiConfig } from "@/api/config";
import type { ApiErrorBody, MembershipRole } from "@/domain";
import { getDb, type DbUser } from "../db";

/**
 * Construit l'URL absolue attendue par un handler, miroir exact de
 * `buildUrl` dans `src/api/client.ts` (meme prefixe `/api`, meme base).
 * Garantit que chaque handler cible precisement la route appelee par le
 * module `src/api/<domaine>.ts` correspondant (V2-6).
 */
export function apiUrl(path: string): string {
  return `${apiConfig.baseUrl}/api${path}`;
}

/**
 * Latence simulee centralisee (V2, retour util. 5 : "chargement lent, pas de
 * retour visuel"). Par defaut ~60-150ms (assez pour que les etats de
 * chargement/squelettes restent visibles a l'oeil sans ralentir chaque
 * interaction de dev). Reglable via `VITE_MOCK_DELAY` :
 * - "off" ou "0" : aucune latence.
 * - un nombre (ms) : latence fixe (ex. VITE_MOCK_DELAY=500 pour tester les
 *   etats de chargement/squelettes/la barre de progression de nav).
 * - non defini : plage aleatoire par defaut 60-150ms.
 */
export async function simulateLatency(): Promise<void> {
  const raw = import.meta.env.VITE_MOCK_DELAY;
  if (raw === "off" || raw === "0") return;
  const fixed = raw !== undefined ? Number(raw) : NaN;
  const ms =
    Number.isFinite(fixed) && fixed >= 0
      ? fixed
      : 60 + Math.floor(Math.random() * 90);
  if (ms <= 0) return;
  await mswDelay(ms);
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiErrorBody = { code, message, details };
  return HttpResponse.json(body, { status });
}

export const errors = {
  unauthorized: () =>
    errorResponse(401, "unauthorized", "Connecte-toi pour continuer."),
  forbidden: (message = "Tu n'as pas le droit de faire ça.") =>
    errorResponse(403, "forbidden", message),
  notFound: (message = "Introuvable.") =>
    errorResponse(404, "not_found", message),
  validation: (details?: unknown) =>
    errorResponse(
      400,
      "validation_error",
      "La demande n'est pas valide.",
      details,
    ),
};

/** Lit le jeton Bearer et resout la personne connectee (ou `undefined`). */
export function getAuthUser(request: Request): DbUser | undefined {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length);
  const db = getDb();
  const userId = db.sessions.get(token);
  if (!userId) return undefined;
  return db.users.findOne((u) => u.id === userId);
}

/** R-P1 : un compte suspendu perd toute capacite d'ecriture. */
export function isWritable(user: DbUser): boolean {
  return user.accountStatus === "active";
}

const ROLE_RANK: Record<MembershipRole, number> = {
  observer: 0,
  member: 1,
  co_owner: 2,
  owner: 3,
};

export function hasAtLeastRole(
  role: MembershipRole,
  minimum: MembershipRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function toUserSummary(user: DbUser) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
  };
}

/** Pagination par curseur simple (offset encode en base64) pour tous les handlers de liste. */
export function paginate<T>(
  items: T[],
  cursor: string | null | undefined,
  limit = 20,
) {
  const offset = cursor ? Number(atob(cursor)) || 0 : 0;
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + limit;
  const nextCursor =
    nextOffset < items.length ? btoa(String(nextOffset)) : null;
  return { items: page, nextCursor, total: items.length };
}

export function toPublicUser(user: DbUser) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    interests: user.interests,
    createdAt: user.createdAt,
  };
}
