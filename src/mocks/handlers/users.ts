import { http, HttpResponse } from "msw";
import { currentUserSchema, userProfileUpdateInputSchema } from "@/domain";
import { getDb } from "../db";
import { toProjectSummary } from "./projectHelpers";
import {
  apiUrl,
  errors,
  getAuthUser,
  simulateLatency,
  toPublicUser,
  toUserSummary,
} from "./utils";

export const userHandlers = [
  http.get(apiUrl("/users/:username"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const user = db.users.findOne((u) => u.username === params.username);
    if (!user || user.accountStatus === "deleted")
      return errors.notFound("Personne introuvable.");
    return HttpResponse.json(toPublicUser(user));
  }),

  http.patch(apiUrl("/me"), async ({ request }) => {
    await simulateLatency();
    const current = getAuthUser(request);
    if (!current) return errors.unauthorized();
    // R-P1/notes tableau 3.4 : bio et avatar verrouilles pendant une suspension.
    if (current.accountStatus === "suspended")
      return errors.forbidden("Ton compte est suspendu.");

    const parsed = userProfileUpdateInputSchema.safeParse(await request.json());
    if (!parsed.success) return errors.validation(parsed.error.issues);

    const db = getDb();
    const updated = db.users.update((u) => u.id === current.id, parsed.data);
    return HttpResponse.json(currentUserSchema.parse(updated));
  }),

  http.get(apiUrl("/users/:username/projects"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const user = db.users.findOne((u) => u.username === params.username);
    if (!user) return errors.notFound("Personne introuvable.");

    const owned = db.projects.find((p) => p.ownerId === user.id);
    const memberOf = db.memberships
      .find((m) => m.userId === user.id && m.role !== "owner")
      .map((m) => db.projects.findOne((p) => p.id === m.projectId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    // R-V4 : profils publics actifs/termines + nombre de projets prives sans les nommer.
    const visibleOwned = owned.filter(
      (p) =>
        p.visibility === "public" &&
        (p.state === "active" || p.state === "done"),
    );
    const visibleCollabs = memberOf.filter(
      (p) =>
        p.visibility === "public" &&
        (p.state === "active" || p.state === "done"),
    );
    const privateCount =
      owned.filter((p) => p.visibility === "private").length +
      memberOf.filter((p) => p.visibility === "private").length;

    return HttpResponse.json({
      created: visibleOwned.map(toProjectSummary),
      collaborations: visibleCollabs.map(toProjectSummary),
      privateProjectsCount: privateCount,
    });
  }),

  http.get(apiUrl("/feed/people"), async () => {
    await simulateLatency();
    const db = getDb();
    const people = db.users
      .find((u) => u.accountStatus === "active")
      .slice(0, 8)
      .map(toUserSummary);
    return HttpResponse.json(people);
  }),
];
