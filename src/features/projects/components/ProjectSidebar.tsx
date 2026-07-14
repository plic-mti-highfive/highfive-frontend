import type { ProjectDto, ProjectMemberDto } from "@/api/types";
import { ProjectRole } from "@plic-mti-highfive/shared-types";
import { TagPill } from "@shared/components/projects/shared/TagPill";

interface ProjectSidebarProps {
  project: ProjectDto;
  members: ProjectMemberDto[];
}

export function ProjectSidebar({ project, members }: ProjectSidebarProps) {
  const owner = members.find((m) => m.role === ProjectRole.OWNER);
  const otherMembers = members.filter((m) => m.role !== ProjectRole.OWNER);

  const getRoleLabel = (role: ProjectRole) => {
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
          Informations
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Date de création
            </p>
            <p className="text-sm text-foreground">
              {formatDate(project.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Dernière mise à jour
            </p>
            <p className="text-sm text-foreground">
              {formatDate(project.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {project.tags && project.tags.length > 0 ? (
                project.tags.map((tag) => <TagPill key={tag} tag={tag} />)
              ) : (
                <p className="text-sm text-muted-foreground">Aucun tag</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
          Équipe
        </h3>

        {owner && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">Propriétaire</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
                style={{
                  background: owner.user?.profile?.avatarPath
                    ? `url(${owner.user.profile.avatarPath}) center/cover`
                    : `hsl(${((owner.user?.email || "").charCodeAt(0) * 37) % 360} 45% 80%)`,
                  color: owner.user?.profile?.avatarPath
                    ? "transparent"
                    : `hsl(${((owner.user?.email || "").charCodeAt(0) * 37) % 360} 45% 30%)`,
                }}
              >
                {!owner.user?.profile?.avatarPath &&
                  getInitials(owner.user?.email || "U")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {owner.user?.email.split("@")[0] || "Inconnu"}
                </p>
              </div>
            </div>
          </div>
        )}

        {otherMembers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Membres ({otherMembers.length})
            </p>
            <div className="space-y-2">
              {otherMembers.slice(0, 5).map((member) => (
                <div key={member.userId} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
                    style={{
                      background: member.user?.profile?.avatarPath
                        ? `url(${member.user.profile.avatarPath}) center/cover`
                        : `hsl(${((member.user?.email || "").charCodeAt(0) * 37) % 360} 45% 80%)`,
                      color: member.user?.profile?.avatarPath
                        ? "transparent"
                        : `hsl(${((member.user?.email || "").charCodeAt(0) * 37) % 360} 45% 30%)`,
                    }}
                  >
                    {!member.user?.profile?.avatarPath &&
                      getInitials(member.user?.email || "U")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">
                      {member.user?.email.split("@")[0] || "Inconnu"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleLabel(member.role)}
                    </p>
                  </div>
                </div>
              ))}
              {otherMembers.length > 5 && (
                <p className="text-xs text-muted-foreground pt-2">
                  +{otherMembers.length - 5} autres membres
                </p>
              )}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucun membre pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
