import { Hand, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProjectSummary, Tag } from "@/domain";
import { Avatar, Card, TagPill } from "@shared/ui";
import { getAccent } from "@shared/lib/accent";

export interface ProjectSummaryCardProps {
  project: ProjectSummary;
  /** Table de correspondance id -> tag (`useTags()`), pour afficher le libellé plutôt que l'id. */
  tagsById?: Map<string, Tag>;
  /** Masqué dans l'onglet "Projets portés" : le porteur est déjà la personne du profil. */
  showOwner?: boolean;
}

/**
 * Carte compacte pour lister les projets d'une personne (profil). Le
 * composant `ProjectCard` partagé (`src/shared/components/projects`,
 * proprieté d'un autre lot) n'existe pas encore et le seul existant
 * (`ProjectFeedCard`) attend l'ancien contrat de domaine et navigue vers
 * d'anciennes routes (`/projects/:id`, `/user/:id`) — incompatible avec le
 * contrat v2. Carte locale minimale en attendant, a base des seules
 * primitives `src/shared/ui`.
 */
export function ProjectSummaryCard({
  project,
  tagsById,
  showOwner = true,
}: ProjectSummaryCardProps) {
  const navigate = useNavigate();
  const ownerName = project.owner.displayName ?? project.owner.username;

  return (
    <Card
      variant="interactive"
      data-accent={getAccent(project.id)}
      onClick={() => navigate(`/projets/${project.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/projets/${project.slug}`);
      }}
    >
      <div className="flex flex-col gap-2.5 px-5 py-4">
        {showOwner && (
          <div className="flex items-center gap-2">
            <Avatar name={ownerName} src={project.owner.avatar} size="xs" />
            <span className="text-body-sm text-muted-foreground truncate">
              {ownerName}
            </span>
          </div>
        )}
        <h3 className="text-heading-md font-semibold text-foreground line-clamp-1">
          {project.title}
        </h3>
        <p className="text-body-sm text-muted-foreground line-clamp-2">
          {project.tagline}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tagId) => {
            const tag = tagsById?.get(tagId);
            return (
              <TagPill
                key={tagId}
                label={tag?.label ?? tagId}
                accent={tag?.accent}
                size="xs"
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3 text-body-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users size={14} />
          {project.membersCount}{" "}
          {project.membersCount === 1 ? "membre" : "membres"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Hand size={14} />
          {project.highfiveCount === 0
            ? "Aucun highfive"
            : project.highfiveCount === 1
              ? "1 highfive"
              : `${project.highfiveCount} highfives`}
        </span>
      </div>
    </Card>
  );
}
