import { http, HttpResponse } from "msw";
import type { DiscoverSection, Project, Tag } from "@/domain";
import { getDb, type DbUser } from "../db";
import { PROJECT_OF_THE_MOMENT } from "../data";
import { isDiscoverable, toProjectSummary } from "./projectHelpers";
import {
  apiUrl,
  getAuthUser,
  paginate,
  simulateLatency,
  toUserSummary,
} from "./utils";

/** Tris disponibles sur `/search` (doc 12 E-02) : trois, pas plus. */
function sortProjects(projects: Project[], sort: string | null): Project[] {
  const sorted = [...projects];
  if (sort === "popular")
    return sorted.sort((a, b) => b.highfiveCount - a.highfiveCount);
  if (sort === "active")
    return sorted.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    );
  // "recent"/"relevant" (pas de score de pertinence texte cote mock) : par creation.
  return sorted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const DISCOVER_SECTION_LIMIT = 6;

function byLastActivityDesc(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime(),
  );
}

function byCreatedAtDesc(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function byHighfivesDesc(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => b.highfiveCount - a.highfiveCount);
}

function hasUnmetNeed(project: Project): boolean {
  return project.needs.some((n) => !n.fulfilled);
}

/**
 * Sections du fil Decouvrir (doc 12 E-01, retour utilisateur "Decouvrir
 * connecte trop pauvre") : chacune porte sa regle de selection et son lien
 * "Voir plus". `for_you` (themes suivis, R-IA-1) et `near_your_projects`
 * (themes des projets portes/rejoints) sont personnalisees et absentes du
 * tableau plutot que rendues vides (pas de section pour un compte sans
 * interet ni projet, ni pour un visiteur). Le "projet du moment" est deja
 * exclu du bassin par l'appelant (`isDiscoverable` + filtre par id).
 */
export function buildDiscoverSections(
  authUser: DbUser | undefined,
): DiscoverSection[] {
  const db = getDb();
  const pool = db.projects
    .find(isDiscoverable)
    .filter((p) => p.id !== PROJECT_OF_THE_MOMENT.id);
  const sections: DiscoverSection[] = [];

  if (authUser && authUser.interests.length > 0) {
    const items = byLastActivityDesc(
      pool.filter((p) => p.tags.some((t) => authUser.interests.includes(t))),
    ).slice(0, DISCOVER_SECTION_LIMIT);
    if (items.length > 0) {
      sections.push({
        id: "for_you",
        items: items.map(toProjectSummary),
        seeAll: {
          types: ["projects"],
          tags: authUser.interests,
          sort: "active",
        },
      });
    }
  }

  sections.push({
    id: "starting",
    items: byCreatedAtDesc(pool)
      .slice(0, DISCOVER_SECTION_LIMIT)
      .map(toProjectSummary),
    seeAll: { types: ["projects"], sort: "recent" },
  });

  sections.push({
    id: "trending_highfives",
    items: byHighfivesDesc(pool)
      .slice(0, DISCOVER_SECTION_LIMIT)
      .map(toProjectSummary),
    seeAll: { types: ["projects"], sort: "popular" },
  });

  const seekingHelp = pool.filter(hasUnmetNeed);
  if (seekingHelp.length > 0) {
    sections.push({
      id: "needs_help",
      items: byLastActivityDesc(seekingHelp)
        .slice(0, DISCOVER_SECTION_LIMIT)
        .map(toProjectSummary),
      seeAll: { types: ["projects"] },
    });
  }

  if (authUser) {
    const myProjectIds = new Set(
      db.memberships
        .find((m) => m.userId === authUser.id)
        .map((m) => m.projectId),
    );
    const myTags = [
      ...new Set(
        db.projects.find((p) => myProjectIds.has(p.id)).flatMap((p) => p.tags),
      ),
    ];
    if (myTags.length > 0) {
      const items = byHighfivesDesc(
        pool.filter(
          (p) =>
            !myProjectIds.has(p.id) && p.tags.some((t) => myTags.includes(t)),
        ),
      ).slice(0, DISCOVER_SECTION_LIMIT);
      if (items.length > 0) {
        sections.push({
          id: "near_your_projects",
          items: items.map(toProjectSummary),
          seeAll: { types: ["projects"], tags: myTags, sort: "active" },
        });
      }
    }
  }

  return sections;
}

export const searchHandlers = [
  http.get(apiUrl("/search"), async ({ request }) => {
    await simulateLatency();
    const db = getDb();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const types = url.searchParams.get("types")?.split(",").filter(Boolean) ?? [
      "projects",
      "users",
      "tags",
    ];
    const tags = url.searchParams.get("tags")?.split(",").filter(Boolean);
    const sort = url.searchParams.get("sort");
    const cursor = url.searchParams.get("cursor");
    const limit = Number(url.searchParams.get("limit")) || undefined;

    const result: Record<string, unknown> = {};

    if (types.includes("projects")) {
      let projects = db.projects.find(isDiscoverable);
      if (q)
        projects = projects.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q),
        );
      if (tags?.length)
        projects = projects.filter((p) => tags.some((t) => p.tags.includes(t)));
      projects = sortProjects(projects, sort);
      const page = paginate(projects, cursor, limit);
      result.projects = { ...page, items: page.items.map(toProjectSummary) };
    }
    if (types.includes("users")) {
      let users = db.users.find((u) => u.accountStatus === "active");
      if (q)
        users = users.filter(
          (u) =>
            u.username.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q),
        );
      const page = paginate(users, cursor, limit);
      result.users = { ...page, items: page.items.map(toUserSummary) };
    }
    if (types.includes("tags")) {
      let tagRows = db.tags.all();
      if (q) tagRows = tagRows.filter((t) => t.label.toLowerCase().includes(q));
      const page = paginate(tagRows, cursor, limit);
      result.tags = page;
    }

    return HttpResponse.json(result);
  }),

  http.get(apiUrl("/feed/discover"), async ({ request }) => {
    await simulateLatency();
    const authUser = getAuthUser(request);
    return HttpResponse.json({
      moment: toProjectSummary(PROJECT_OF_THE_MOMENT),
      sections: buildDiscoverSections(authUser),
    });
  }),

  /** Colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01), 5 maximum. */
  http.get(apiUrl("/feed/tags-trending"), async () => {
    await simulateLatency();
    const db = getDb();
    const active = db.projects.find(isDiscoverable);
    const counts = new Map<string, number>();
    for (const project of active) {
      for (const tagId of project.tags) {
        counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
      }
    }
    const trending = [...counts.entries()]
      .map(([tagId, projectsCount]) => {
        const tag = db.tags.findOne((t) => t.id === tagId);
        return tag ? { tag, projectsCount } : null;
      })
      .filter((row): row is { tag: Tag; projectsCount: number } => row !== null)
      .sort((a, b) => b.projectsCount - a.projectsCount)
      .slice(0, 5);
    return HttpResponse.json(trending);
  }),

  http.get(apiUrl("/tags/:tagId/projects"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const projects = db.projects.find(
      (p) => isDiscoverable(p) && p.tags.includes(String(params.tagId)),
    );
    const page = paginate(projects, cursor);
    return HttpResponse.json({
      ...page,
      items: page.items.map(toProjectSummary),
    });
  }),
];
