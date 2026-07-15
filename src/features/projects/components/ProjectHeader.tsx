import { useNavigate } from "react-router-dom";
import { Hand, Bookmark, Share2, Flag } from "lucide-react";
import { AuthorChip, TagPill } from "@shared/components/projects";
import { DropdownMenu } from "@shared/components/DropdownMenu";
import { formatFrenchDate } from "@shared/utils/formatDate";
import type { ProjectDto } from "@/api/types";
import { ProjectStatus } from "@plic-mti-highfive/shared-types";

interface ProjectHeaderProps {
  project: ProjectDto;
  creator?: { email: string; avatar?: string };
  onJoinClick?: () => void;
  onHighfiveClick?: () => void;
}

export function ProjectHeader({
  project,
  creator,
  onJoinClick,
  onHighfiveClick,
}: ProjectHeaderProps) {
  const navigate = useNavigate();
  const creatorName = creator?.email.split("@")[0] || "Créateur inconnu";

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              <AuthorChip
                author={creatorName}
                avatarUrl={creator?.avatar}
                size="md"
              />
              <span className="text-xs text-muted-foreground">
                · {formatFrenchDate(project.createdAt)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {project.name}
            </h1>
            {project.tags && project.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {project.tags.map((tag) => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    onClick={() =>
                      navigate(
                        `/search/projects?tag=${encodeURIComponent(tag)}`,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-4 shrink-0">
            <DropdownMenu
              triggerSize="md"
              iconSize={20}
              offset={8}
              items={[
                {
                  icon: (
                    <Bookmark size={16} className="text-muted-foreground" />
                  ),
                  label: "Enregistrer",
                  onClick: () => console.log("Enregistrer"),
                },
                {
                  icon: <Share2 size={16} className="text-muted-foreground" />,
                  label: "Partager",
                  onClick: () => console.log("Partager"),
                },
                {
                  icon: <Flag size={16} className="text-muted-foreground" />,
                  label: "Signaler",
                  onClick: () => console.log("Signaler"),
                },
              ]}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={onHighfiveClick}
                title="Highfive ce projet"
                className="w-9 h-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Hand size={16} className="text-foreground" />
              </button>
              {onJoinClick && project.status === ProjectStatus.ACTIVE && (
                <button
                  onClick={onJoinClick}
                  className="px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Rejoindre le projet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
