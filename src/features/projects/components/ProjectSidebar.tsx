import { useNavigate } from "react-router-dom";
import type { ProjectDto, ProjectMemberDto } from "@/api/types";
import { ProjectRole } from "@plic-mti-highfive/shared-types";
import { Avatar, TagPill } from "@shared/components/projects";
import { formatFrenchDate } from "@shared/utils/formatDate";

interface ProjectSidebarProps {
  project: ProjectDto;
  members: ProjectMemberDto[];
  highfiveCount: number;
}

function getRoleLabel(role: ProjectRole) {
  switch (role) {
    case ProjectRole.OWNER:
      return "Propriétaire";
    case ProjectRole.ADMIN:
      return "Administrateur";
    case ProjectRole.MEMBER:
      return "Membre";
    case ProjectRole.VIEWER:
      return "Observateur";
    default:
      return role;
  }
}

export function ProjectSidebar({
  project,
  members,
  highfiveCount,
}: ProjectSidebarProps) {
  const navigate = useNavigate();

  // Le propriétaire apparaît en premier dans l'équipe, avec son rôle — pas de
  // bloc "Propriétaire" séparé et redondant.
  const sortedMembers = [...members].sort((a, b) =>
    a.role === ProjectRole.OWNER ? -1 : b.role === ProjectRole.OWNER ? 1 : 0,
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Équipe
        </h3>
        {sortedMembers.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Aucun membre pour le moment.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedMembers.map((member) => (
              <div key={member.userId} className="flex items-center gap-3">
                <Avatar
                  name={member.user?.email || "Inconnu"}
                  avatarUrl={member.user?.profile?.avatarPath ?? undefined}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-foreground truncate">
                    {member.user?.email.split("@")[0] || "Inconnu"}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {getRoleLabel(member.role)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                onClick={() =>
                  navigate(`/recherche?tag=${encodeURIComponent(tag)}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-border flex flex-col gap-4 text-base text-foreground">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Contributeurs</p>
          {members.length}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Highfives</p>
          {highfiveCount}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Date de création</p>
          {formatFrenchDate(project.createdAt)}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Dernière mise à jour
          </p>
          {formatFrenchDate(project.updatedAt)}
        </div>
      </div>
    </div>
  );
}
