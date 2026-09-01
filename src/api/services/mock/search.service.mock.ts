import type { ISearchService } from "../interfaces";
import type {
  GlobalSearchQuery,
  GlobalSearchResponse,
  PaginatedSearch,
} from "../../types/search.types";
import type { MinimalProfileDto, ProjectDto } from "../../types";
import { delay } from "./utils";
import { getAllProjects, getAllUsers, getProjectWithOwner } from "./data";

/**
 * Recherche globale (barre du header).
 *
 * Le mock renvoyait des listes vides quoi qu'on tape : l'autocompletion ne
 * proposait jamais rien en mode mock, alors qu'elle fonctionne en mode http.
 */
function paginate<T>(items: T[], limit: number): PaginatedSearch<T> {
  const data = items.slice(0, limit);
  return {
    data,
    total: items.length,
    page: 1,
    limit,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  };
}

export class SearchServiceMock implements ISearchService {
  async searchGlobal(query: GlobalSearchQuery): Promise<GlobalSearchResponse> {
    await delay(100);

    const limit = query.limit || 5;
    const needle = (query.search ?? "").trim().toLowerCase();

    if (!needle) {
      return {
        projects: paginate<ProjectDto>([], limit),
        users: paginate<MinimalProfileDto>([], limit),
        tags: paginate<unknown>([], limit),
        progress: paginate<unknown>([], limit),
      };
    }

    const projects = getAllProjects()
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle),
      )
      .map((p) => getProjectWithOwner(p.id) ?? p);

    const users: MinimalProfileDto[] = getAllUsers()
      .map((u) => {
        const username = u.email.split("@")[0];
        return {
          userId: u.id,
          username,
          displayName: username
            .split(".")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          avatar: u.profile?.avatarPath || "",
        };
      })
      .filter(
        (u) =>
          u.username.toLowerCase().includes(needle) ||
          u.displayName.toLowerCase().includes(needle),
      );

    const tags = [
      ...new Set(getAllProjects().flatMap((p) => p.tags ?? [])),
    ].filter((tag) => tag.toLowerCase().includes(needle));

    return {
      projects: paginate(projects, limit),
      users: paginate(users, limit),
      tags: paginate<unknown>(tags, limit),
      progress: paginate<unknown>([], limit),
    };
  }
}
