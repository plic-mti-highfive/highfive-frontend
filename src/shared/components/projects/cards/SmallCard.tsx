import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hand } from "lucide-react";
import type { Project } from "@shared/types";
import { Thumbnail } from "../shared/Thumbnail";
import { AuthorChip } from "../shared/AuthorChip";
import { TagPill } from "../shared/TagPill";

export function SmallCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <article
      className="cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div
        className={`relative overflow-hidden rounded-xl mb-3 transition-shadow duration-300 ${hovered ? "shadow-lg" : "shadow-sm"}`}
      >
        <div
          className={`transition-transform duration-500 ${hovered ? "scale-[1.03]" : "scale-100"}`}
        >
          <Thumbnail
            id={project.id}
            name={project.name}
            thumbnailUrl={project.thumbnailUrl}
            className="w-full aspect-video rounded-xl"
          />
        </div>
        <div
          className={`absolute inset-0 rounded-xl bg-gray-900/80 backdrop-blur-[3px] flex flex-col justify-end p-3 gap-2 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <p className="text-white/85 text-xs leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>
      </div>

      <div className="space-y-2 px-0.5">
        <AuthorChip author={project.author} />
        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-1">
          {project.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-foreground">
            {project.contributorsCount} contributeurs
          </span>
          <div className="flex items-center gap-1">
            <Hand size={14} className="text-muted-foreground" />
            <span className="text-[11px] text-foreground font-medium">
              {project.highfiveCount || 0}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap pt-2">
          {project.tags?.slice(0, 3).map((t) => (
            <TagPill key={t} tag={t} size="xs" />
          ))}
        </div>
      </div>
    </article>
  );
}
