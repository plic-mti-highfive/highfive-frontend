import type {
  GlobalSearchQuery,
  GlobalSearchResponse,
} from "../../types/search.types";

export interface ISearchService {
  searchGlobal(query: GlobalSearchQuery): Promise<GlobalSearchResponse>;
}
