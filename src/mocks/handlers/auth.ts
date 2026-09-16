import { http, HttpResponse } from "msw";
import {
  currentUserSchema,
  loginInputSchema,
  passwordResetInputSchema,
  passwordResetRequestInputSchema,
  registerInputSchema,
  sessionSchema,
} from "@/domain";
import { getDb, type DbUser } from "../db";
import { nextId } from "../data/ids";
import { apiUrl, errors, getAuthUser, simulateLatency } from "./utils";

function stripPassword(user: DbUser) {
  const { passwordHash, ...publicShape } = user;
  void passwordHash;
  return publicShape;
}

function issueSession(user: DbUser) {
  const db = getDb();
  const token = nextId();
  db.sessions.set(token, user.id);
  return sessionSchema.parse({ user: stripPassword(user), token });
}

export const authHandlers = [
  http.post(apiUrl("/auth/login"), async ({ request }) => {
    await simulateLatency();
    const parsed = loginInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const user = db.users.findOne((u) => u.email === parsed.data.email);
    if (
      !user ||
      user.passwordHash !== parsed.data.password ||
      user.accountStatus === "deleted"
    ) {
      return errors.unauthorized();
    }
    return HttpResponse.json(issueSession(user));
  }),

  http.post(apiUrl("/auth/register"), async ({ request }) => {
    await simulateLatency();
    const parsed = registerInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    if (db.users.findOne((u) => u.email === parsed.data.email)) {
      return errors.validation({ email: "Cette adresse est deja utilisee." });
    }
    if (db.users.findOne((u) => u.username === parsed.data.username)) {
      return errors.validation({ username: "Ce pseudo est deja pris." });
    }

    const now = new Date().toISOString();
    const user: DbUser = currentUserSchema.parse({
      id: nextId(),
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(parsed.data.username)}`,
      interests: [],
      email: parsed.data.email,
      accountStatus: "active",
      platformRole: "member",
      createdAt: now,
      lastVisitAt: now,
    }) as DbUser;
    user.passwordHash = parsed.data.password;
    db.users.insert(user);

    return HttpResponse.json(issueSession(user), { status: 201 });
  }),

  http.post(apiUrl("/auth/logout"), async ({ request }) => {
    await simulateLatency();
    const header = request.headers.get("Authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (token) getDb().sessions.delete(token);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(apiUrl("/me"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();
    return HttpResponse.json(currentUserSchema.parse(stripPassword(user)));
  }),

  http.post(apiUrl("/auth/password-reset-request"), async ({ request }) => {
    await simulateLatency();
    const parsed = passwordResetRequestInputSchema.safeParse(
      await request.json(),
    );
    if (!parsed.success) return errors.validation(parsed.error.issues);
    // Ne jamais reveler si l'adresse existe : succes silencieux dans tous les cas.
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(apiUrl("/auth/password-reset"), async ({ request }) => {
    await simulateLatency();
    const parsed = passwordResetInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);
    return new HttpResponse(null, { status: 204 });
  }),
];
