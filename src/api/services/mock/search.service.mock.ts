import type { ISearchService } from "../interfaces";
import type {
  GlobalSearchQuery,
  GlobalSearchResponse,
} from "../../types/search.types";
import { delay } from "./utils";

export class SearchServiceMock implements ISearchService {
  async searchGlobal(query: GlobalSearchQuery): Promise<GlobalSearchResponse> {
    await delay(100);

    const limit = query.limit || 5;

    return {
      projects: {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      },
      users: {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      },
      tags: {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      },
      progress: {
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      },
    };
  }
}
