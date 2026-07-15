import { ProjectFeedCard } from "@shared/components/projects";
import type { ProjectDto } from "@/api/types";
import type { Project } from "@shared/types";

interface SimilarProjectsProps {
  projects: ProjectDto[];
}

export function SimilarProjects({ projects }: SimilarProjectsProps) {
  if (projects.length === 0) return null;

  const convertToProject = (dto: ProjectDto): Project => ({
    id: Number(dto.id),
    name: dto.name,
    description: dto.description || "",
    author: "Équipe",
    successRate: 0,
    contributorsCount: 0,
    daysLeft: null,
    tags: ["Open Source"],
    thumbnailUrl: undefined,
  });

  const projectsForSection = projects.slice(0, 4).map(convertToProject);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-14 border-t border-border">
      <h2 className="text-lg font-bold text-foreground mb-5">
        Projets similaires
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projectsForSection.map((project) => (
          <ProjectFeedCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
