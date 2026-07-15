import { useNavigate } from "react-router-dom";
import type { Project } from "@shared/types";
import { ProjectFeedCard } from "@shared/components/projects";

interface ProjectFeedSectionProps {
  title: string;
  projects: Project[];
  maxItems?: number;
  showViewAll?: boolean;
}

/**
 * Section du fil central de la home page : titre + liste verticale de
 * ProjectFeedCard (contrairement à Section, qui affiche une grille et
 * reste utilisée ailleurs dans l'app).
 */
export function ProjectFeedSection({
  title,
  projects,
  maxItems = 4,
  showViewAll = true,
}: ProjectFeedSectionProps) {
  const navigate = useNavigate();
  if (projects.length === 0) return null;

  const displayed = projects.slice(0, maxItems);

  return (
    <div className="pt-9 border-t border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {showViewAll && (
          <button
            onClick={() => navigate("/projects")}
            className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Voir tout
            <span>→</span>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3.5">
        {displayed.map((p) => (
          <ProjectFeedCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
