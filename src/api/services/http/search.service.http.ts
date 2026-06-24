import type { ISearchService } from "../interfaces";
import type {
  GlobalSearchQuery,
  GlobalSearchResponse,
} from "../../types/search.types";
import { httpClient } from "../../http-client";

export class SearchServiceHttp implements ISearchService {
  async searchGlobal(query: GlobalSearchQuery): Promise<GlobalSearchResponse> {
    const params: Record<string, any> = { ...query };

    if (query.types && query.types.length > 0) {
      params.types = query.types.join(",");
    }
    if (query.tags && query.tags.length > 0) {
      params.tags = query.tags.join(",");
    }

    return httpClient.get<GlobalSearchResponse>("/search", { params });
  }
}
