import { ProjectFeedCard } from "@shared/components/projects";
import type { ProjectDto } from "@/api/types";
import { adaptProjects } from "@shared/utils/projectAdapter";

interface SimilarProjectsProps {
  projects: ProjectDto[];
}

/**
 * La conversion locale forcait `author: "Équipe"` et `tags: ["Open Source"]` en
 * ignorant les vraies valeurs, et faisait `Number(dto.id)` alors que les
 * identifiants sont des UUID : branche sur de vraies donnees, cela produisait
 * `NaN` et une navigation vers /projects/NaN. On passe par l'adaptateur commun.
 */
export function SimilarProjects({ projects }: SimilarProjectsProps) {
  if (projects.length === 0) return null;

  const projectsForSection = adaptProjects(projects.slice(0, 4));

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
