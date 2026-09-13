import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import type { Project } from "@shared/types";
import { getCardTint } from "@shared/lib/accent";
import { AuthorChip } from "../shared/AuthorChip";
import { TagPill } from "../shared/TagPill";

export function HeroCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { band, bandSoft, accent } = getCardTint(project.id);

  return (
    <article
      className="cursor-pointer group rounded-2xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-[0_4px_16px_-4px_rgb(0_0_0_/_0.15),0_0_0_2px_var(--card-accent)]"
      style={{ ["--card-accent" as string]: accent }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div
        className="flex flex-col gap-3 px-8 py-7"
        style={{ background: band }}
      >
        <AuthorChip
          author={project.author}
          size="md"
          onClick={
            project.authorId
              ? () => navigate(`/user/${project.authorId}`)
              : undefined
          }
        />
        <h2 className="text-3xl font-black text-foreground leading-tight tracking-tight">
          {project.name}
        </h2>
      </div>

      <div
        className="flex flex-col gap-4 px-8 py-7"
        style={{ background: bandSoft }}
      >
        <p className="text-base text-foreground/80 leading-relaxed line-clamp-2">
          {project.description}
        </p>
        <div className="flex gap-2 flex-wrap">
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
        className="flex items-center justify-between px-8 py-4"
        style={{ background: band }}
      >
        <span className="text-sm text-foreground">
          {project.contributorsCount} contributeurs
        </span>
        <div className="flex items-center gap-1.5">
          <Hand size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {project.highfiveCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
}
