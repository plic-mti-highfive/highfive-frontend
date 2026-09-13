import { http, HttpResponse } from "msw";
import { getDb } from "../db";
import { PROJECT_OF_THE_MOMENT } from "../data";
import { isDiscoverable, toProjectSummary } from "./projectHelpers";
import { apiUrl, paginate, simulateLatency, toUserSummary } from "./utils";

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
    const cursor = url.searchParams.get("cursor");

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
      const page = paginate(projects, cursor);
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
      const page = paginate(users, cursor);
      result.users = { ...page, items: page.items.map(toUserSummary) };
    }
    if (types.includes("tags")) {
      let tagRows = db.tags.all();
      if (q) tagRows = tagRows.filter((t) => t.label.toLowerCase().includes(q));
      const page = paginate(tagRows, cursor);
      result.tags = page;
    }

    return HttpResponse.json(result);
  }),

  http.get(apiUrl("/feed/discover"), async ({ request }) => {
    await simulateLatency();
    const db = getDb();
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const projects = db.projects
      .find(isDiscoverable)
      .filter((p) => p.id !== PROJECT_OF_THE_MOMENT.id)
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime(),
      );
    const page = paginate(projects, cursor);
    return HttpResponse.json({
      moment: cursor ? null : toProjectSummary(PROJECT_OF_THE_MOMENT),
      items: { ...page, items: page.items.map(toProjectSummary) },
    });
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
