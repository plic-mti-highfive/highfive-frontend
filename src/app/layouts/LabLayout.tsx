import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { Avatar, AvatarGroup, Badge, Spinner, TabLink } from "@shared/ui";
import type { BadgeProps } from "@shared/ui";
import { useProject } from "@/api/queries/projects";
import { useMembers } from "@/api/queries/memberships";
import type { ProjectState } from "@/domain";

const STATE_LABEL: Record<ProjectState, string> = {
  draft: "Brouillon",
  active: "Ouvert",
  done: "Terminé",
  archived: "Archivé",
};

const STATE_TONE: Record<ProjectState, NonNullable<BadgeProps["tone"]>> = {
  draft: "neutral",
  active: "success",
  done: "info",
  archived: "neutral",
};

/**
 * Coquille atelier (doc 06 §4, V2 item 3) : hauteur d'ecran fixe, aucun
 * defilement de page — seul l'espace de travail (Outlet) defile selon ses
 * propres regles. Barre de projet 52px avec retour nomme vers la fiche
 * (R-NAV2) et onglets routes Le Mur / Les Tâches.
 *
 * Le Mur n'etant pas encore construit (V2-10), seuls ces deux onglets sont
 * routes ici ; Fichiers et Le Canal ne font pas partie de ce lot. Les
 * avatars de presence, "Inviter" et le menu "⋯" du doc ne sont pas cables
 * (pas de flux temps reel/invitations dans ce lot) : la barre montre les
 * membres du projet a la place.
 */
export function LabLayout() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProject(slug);
  const { data: members } = useMembers(slug);

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-13 shrink-0 items-center gap-4 border-b border-border px-4">
        <Link
          to={`/projets/${slug}`}
          className="flex items-center gap-2 text-body-md font-semibold text-foreground transition-colors hover:text-muted-foreground"
        >
          <ArrowLeft size={18} className="shrink-0 text-muted-foreground" />
          {isLoading ? <Spinner size="sm" /> : (project?.title ?? "Projet")}
        </Link>

        {project && (
          <Badge tone={STATE_TONE[project.state]} className="shrink-0">
            {STATE_LABEL[project.state]}
          </Badge>
        )}

        <nav className="flex h-full items-center gap-1" aria-label="Le Lab">
          <TabLink to="mur">Le Mur</TabLink>
          <TabLink to="taches">Les Tâches</TabLink>
        </nav>

        {members && members.length > 0 && (
          <AvatarGroup max={6} className="ml-auto shrink-0">
            {members.map((member) => (
              <Avatar
                key={member.userId}
                name={member.user.displayName ?? member.user.username}
                src={member.user.avatar}
                size="sm"
              />
            ))}
          </AvatarGroup>
        )}
      </header>

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
