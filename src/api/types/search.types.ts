import type { SearchEntityType } from "@plic-mti-highfive/shared-types";
import type { ProjectDto } from "./project.types";
import type { MinimalProfileDto } from "./user.types";

export interface GlobalSearchQuery {
  search?: string;
  types?: SearchEntityType[];
  tags?: string[];
  sortBy?: "date" | "name" | "popularity";
  sortOrder?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
}

export interface PaginatedSearch<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GlobalSearchResponse {
  projects?: PaginatedSearch<ProjectDto>;
  users?: PaginatedSearch<MinimalProfileDto>;
  tags?: PaginatedSearch<unknown>; // TODO
  progress?: PaginatedSearch<unknown>; // TODO
}
