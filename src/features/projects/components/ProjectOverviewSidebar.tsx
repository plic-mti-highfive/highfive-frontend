import { Link } from "react-router-dom";

import { Avatar, Section, Stat } from "@shared/ui";
import type { Need, Project } from "@/domain";
import type { TeamMember } from "@/api/memberships";
import { formatAbsoluteDate, formatExactDateTime } from "@shared/lib/dates";
import { ROLE_LABEL } from "../lib/labels";
import { NearbyProjects } from "./NearbyProjects";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Hors du corps du composant : `Date.now()` y est un appel impur (react-hooks/purity). */
function isActiveWithinAWeek(lastActivityAt: string): boolean {
  return Date.now() - new Date(lastActivityAt).getTime() < SEVEN_DAYS_MS;
}

function NeedsList({ needs }: { needs: Need[] }) {
  if (needs.length === 0) return null;
  const sorted = [...needs].sort(
    (a, b) => Number(a.fulfilled) - Number(b.fulfilled),
  );

  return (
    <Section title="Profils recherchés">
      <ul className="flex flex-col gap-2">
        {sorted.map((need) => (
          <li
            key={need.id}
            className={
              need.fulfilled
                ? "text-body-sm text-muted-foreground line-through"
                : "text-body-sm text-foreground"
            }
          >
            {need.label}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Colonne d'appui de l'apercu (doc 13 E-10) : equipe, besoins, chiffres, projets proches. */
export function ProjectOverviewSidebar({
  project,
  members,
}: {
  project: Project;
  members: TeamMember[];
}) {
  const isActiveThisWeek = isActiveWithinAWeek(project.lastActivityAt);

  return (
    <aside className="flex flex-col gap-8">
      <div className="flex flex-col gap-8 rounded-[--radius-xl] border border-[--border] bg-card p-6 shadow-[--shadow-rest]">
        <Section title="Équipe">
          {members.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Aucun membre pour l'instant
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {members.slice(0, 3).map((member) => (
                <li key={member.userId} className="flex items-center gap-2">
                  <Avatar
                    name={member.user.displayName ?? member.user.username}
                    src={member.user.avatar}
                    size="sm"
                  />
                  <Link
                    to={`/u/${member.user.username}`}
                    className="flex-1 truncate text-body-sm font-medium text-foreground hover:underline"
                  >
                    @{member.user.username}
                  </Link>
                  <span className="text-body-sm text-muted-foreground">
                    {ROLE_LABEL[member.role]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {members.length > 3 && (
            <Link
              to={`/projets/${project.slug}/equipe`}
              className="text-body-sm font-medium text-foreground hover:underline"
            >
              Voir l'équipe
            </Link>
          )}
        </Section>

        <NeedsList needs={project.needs} />

        <Section title="Chiffres">
          <div className="grid grid-cols-2 gap-4">
            <Stat value={project.highfiveCount} label="highfives" />
            <Stat
              value={members.length}
              label={members.length === 1 ? "membre" : "membres"}
            />
          </div>
          <p className="text-body-sm text-muted-foreground">
            {isActiveThisWeek && <>Actif cette semaine · </>}
            <time
              dateTime={project.createdAt}
              title={formatExactDateTime(project.createdAt)}
            >
              créé le {formatAbsoluteDate(project.createdAt)}
            </time>
          </p>
        </Section>
      </div>

      <NearbyProjects project={project} />
    </aside>
  );
}
