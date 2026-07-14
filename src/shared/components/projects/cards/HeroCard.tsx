import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import type { Project } from "@shared/types";
import { Thumbnail } from "../shared/Thumbnail";
import { AuthorChip } from "../shared/AuthorChip";
import { TagPill } from "../shared/TagPill";

export function HeroCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  return (
    <article
      className="cursor-pointer group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="relative overflow-hidden rounded-2xl mb-5 shadow-md group-hover:shadow-xl transition-shadow duration-300">
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          <Thumbnail
            id={project.id}
            name={project.name}
            thumbnailUrl={project.thumbnailUrl}
            className="w-full aspect-[16/9] rounded-2xl"
          />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="space-y-3 px-0.5">
        <AuthorChip author={project.author} />
        <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">
          {project.name}
        </h2>
        <p className="text-sm text-foreground leading-relaxed line-clamp-2">
          {project.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            {project.contributorsCount} contributeurs
          </span>
          <div className="flex items-center gap-1">
            <Hand size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {project.highfiveCount || 0}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5 flex-wrap">
            {project.tags?.slice(0, 3).map((t) => (
              <TagPill key={t} tag={t} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
