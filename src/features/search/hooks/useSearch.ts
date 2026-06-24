import { useState, useEffect } from "react";
import { type MinimalProfileDto, type ProjectDto } from "@/api";
import { searchService } from "@/api/services";

export interface SearchTag {
  name: string;
  count: number;
}

export interface SearchProgress {
  id: string;
  title: string;
  projectName: string;
  description: string;
}

interface SearchResultsState {
  projects: ProjectDto[];
  users: MinimalProfileDto[];
  tags: SearchTag[];
  progress: SearchProgress[];
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResultsState>({
    projects: [],
    users: [],
    tags: [],
    progress: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const isQueryEmpty = !query || query.trim() === "";

  useEffect(() => {
    if (isQueryEmpty) {
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await searchService.searchGlobal({
          search: query,
          limit: 3,
        });

        setResults({
          projects: response.projects?.data || [],
          users: response.users?.data || [],
          tags: response.tags?.data || [],
          progress: response.progress?.data || [],
        });
      } catch (error) {
        console.error("Erreur lors de la recherche globale :", error);
        setResults({ projects: [], users: [], tags: [], progress: [] });
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce de 300ms
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isQueryEmpty]);

  const isEmpty =
    results.projects.length === 0 &&
    results.users.length === 0 &&
    results.tags.length === 0 &&
    results.progress.length === 0;

  return {
    filteredProjects: results.projects,
    filteredUsers: results.users,
    filteredTags: results.tags,
    filteredProgress: results.progress,
    isEmpty,
    isLoading,
  };
}
