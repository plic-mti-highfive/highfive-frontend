import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import type { Project } from "@shared/types";
import { getCardTint } from "@shared/utils/colorPalette";
import { AuthorChip } from "../shared/AuthorChip";
import { TagPill } from "../shared/TagPill";

/**
 * Carte projet compacte utilisée partout où des projets sont listés
 * (fil de la home, résultats de recherche, profils, projets similaires…).
 * Pas de thumbnail : les bandes de couleur suivent la même mécanique
 * de génération déterministe que le thumbnail SVG (@shared/utils/colorPalette).
 */
export function ProjectFeedCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { band, bandSoft, accent } = getCardTint(project.id);

  return (
    <article
      className="cursor-pointer group rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 w-full hover:shadow-[0_2px_10px_-2px_rgb(0_0_0_/_0.15),0_0_0_2px_var(--card-accent)]"
      style={{ ["--card-accent" as string]: accent }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div
        className="flex flex-col gap-1.5 px-5 py-4"
        style={{ background: band }}
      >
        <AuthorChip
          author={project.author}
          size="sm"
          onClick={
            project.authorId
              ? () => navigate(`/user/${project.authorId}`)
              : undefined
          }
        />
        <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1">
          {project.name}
        </h3>
      </div>

      <div
        className="flex flex-col gap-2.5 px-5 py-4"
        style={{ background: bandSoft }}
      >
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
          {project.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {project.tags?.slice(0, 3).map((t) => (
            <TagPill
              key={t}
              tag={t}
              size="sm"
              onClick={() =>
                navigate(`/search/projects?tag=${encodeURIComponent(t)}`)
              }
            />
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-between px-5 py-3 text-sm text-foreground/85"
        style={{ background: band }}
      >
        <span>{project.contributorsCount} contributeurs</span>
        <div className="flex items-center gap-1.5">
          <Hand size={15} className="text-muted-foreground" />
          <span className="font-medium">{project.highfiveCount || 0}</span>
        </div>
      </div>
    </article>
  );
}
