import { useState, useEffect } from "react";
import { projectService } from "@/api";
import { ProjectStatus } from "@plic-mti-highfive/shared-types";

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

export function useSearch(query: string) {
  const [projects, setProjects] = useState<
    Array<{ id: string | number; name: string; description: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!query) {
        setProjects([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await projectService.getProjects({
          status: ProjectStatus.ACTIVE,
          limit: 50,
        });
        setProjects(
          response.data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
          })),
        );
      } catch (error) {
        console.error("Failed to fetch projects for search:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [query]);

  const queryLower = query.toLowerCase();
  const filteredProjects = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower),
    )
    .slice(0, 3);

  return {
    filteredProjects,
    filteredUsers: [] as Array<{
      username: string;
      id: string;
      avatar: string;
      displayName: string;
    }>,
    filteredTags: [] as SearchTag[],
    filteredProgress: [] as SearchProgress[],
    isEmpty: filteredProjects.length === 0,
    isLoading,
  };
}
