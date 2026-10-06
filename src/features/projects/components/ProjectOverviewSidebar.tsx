import { Link } from "react-router-dom";

import { Avatar, AvatarGroup, Section } from "@shared/ui";
import type { Project } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import {
  formatAbsoluteDate,
  formatExactDateTime,
  formatRelativeDate,
} from "@shared/lib/dates";
import { ProjectPanel } from "./ProjectPanel";

const MAX_AVATARS = 6;

/**
 * Colonne d'appui de l'apercu : un resume de l'equipe (le detail et la
 * gestion des demandes restent dans l'onglet Equipe) et les reperes de dates.
 * Les compteurs (highfives, membres) ne sont pas repetes ici : le bouton
 * Highfive et l'onglet Equipe les portent deja.
 */
export function ProjectOverviewSidebar({
  project,
  members,
}: {
  project: Project;
  members: TeamMember[];
}) {
  return (
    <aside className="flex flex-col gap-6">
      <ProjectPanel>
        <Section title="Équipe">
          {members.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Aucun membre pour l'instant
            </p>
          ) : (
            <>
              <AvatarGroup>
                {members.slice(0, MAX_AVATARS).map((member) => (
                  <Avatar
                    key={member.userId}
                    name={member.user.displayName ?? member.user.username}
                    src={member.user.avatar}
                    size="md"
                  />
                ))}
              </AvatarGroup>
              <p className="text-body-sm text-muted-foreground">
                {members.length} {members.length === 1 ? "membre" : "membres"}
                {members.length > MAX_AVATARS && (
                  <> dont {MAX_AVATARS} affichés</>
                )}
              </p>
            </>
          )}
          <Link
            to={`/projets/${project.slug}/equipe`}
            className="text-body-sm font-medium text-foreground hover:underline"
          >
            Voir l'équipe
          </Link>
        </Section>
      </ProjectPanel>

      <ProjectPanel>
        <Section title="Infos">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
            <dt className="text-muted-foreground">Créé le</dt>
            <dd className="text-right text-foreground">
              <time
                dateTime={project.createdAt}
                title={formatExactDateTime(project.createdAt)}
              >
                {formatAbsoluteDate(project.createdAt)}
              </time>
            </dd>
            <dt className="text-muted-foreground">Dernière activité</dt>
            <dd className="text-right text-foreground">
              <time
                dateTime={project.lastActivityAt}
                title={formatExactDateTime(project.lastActivityAt)}
              >
                {formatRelativeDate(project.lastActivityAt)}
              </time>
            </dd>
          </dl>
        </Section>
      </ProjectPanel>
    </aside>
  );
}
