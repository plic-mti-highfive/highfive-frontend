import type { ISearchService } from "../interfaces";
import type {
  GlobalSearchQuery,
  GlobalSearchResponse,
} from "../../types/search.types";
import { httpClient } from "../../http-client";

export class SearchServiceHttp implements ISearchService {
  async searchGlobal(query?: GlobalSearchQuery): Promise<GlobalSearchResponse> {
    const { limit, offset, types, tags, ...rest } = query ?? {};

    const params: Record<string, string | number | boolean> = {
      ...rest,
      limit: limit ?? 20,
      offset: offset ?? 0,
    };

    if (types && types.length > 0) {
      params.types = types.join(",");
    }
    if (tags && tags.length > 0) {
      params.tags = tags.join(",");
    }

    return httpClient.get<GlobalSearchResponse>("/search", { params });
  }
}
