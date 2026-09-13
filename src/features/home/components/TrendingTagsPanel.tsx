import { useNavigate } from "react-router-dom";
import { Skeleton } from "@shared/ui/skeleton";
import type { Project } from "@shared/types";
import { TagPill } from "@shared/components/projects";
import { computeTrendingTags } from "../utils/trendingTags";

interface TrendingTagsPanelProps {
  projects: Project[];
  isLoading?: boolean;
}

export function TrendingTagsPanel({
  projects,
  isLoading,
}: TrendingTagsPanelProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const trendingTags = computeTrendingTags(projects, 5);
  if (trendingTags.length === 0) return null;

  return (
    <div>
      <div className="text-base font-bold text-foreground mb-4">
        Tags tendance
      </div>
      <div className="flex flex-col gap-3.5">
        {trendingTags.map(({ tag, count }) => (
          <div key={tag} className="flex items-center justify-between">
            <TagPill
              tag={tag}
              size="sm"
              onClick={() =>
                navigate(`/search/projects?tag=${encodeURIComponent(tag)}`)
              }
            />
            <span className="text-muted-foreground text-xs">
              {count} projet{count > 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
