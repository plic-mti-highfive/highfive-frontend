import { ArrowLeft, Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";

import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Spinner,
  TabLink,
} from "@shared/ui";
import type { BadgeProps } from "@shared/ui";
import { useProject } from "@/api/queries/projects";
import { useMembers } from "@/api/queries/memberships";
import { useSession } from "@/api/queries/auth";
import type { ProjectState } from "@/domain";
import { InviteMemberDialog } from "../../features/lab/components/InviteMemberDialog";
import { hasAtLeastRole } from "../../features/lab/lib/roles";
import type { LabContext } from "../../features/lab/lib/context";

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
 * Coquille atelier (doc 06 §4, V2 item 3) : hauteur d'écran fixe, aucun
 * défilement de page — seul l'espace de travail (Outlet) défile selon ses
 * propres règles. Barre de projet 52px avec retour nommé vers la fiche
 * (R-NAV2), état + nombre de membres, onglets routés Le Mur / Les Tâches et
 * bouton Inviter (porteur/co-porteur).
 *
 * Accès : sans appartenance -> état permission (l'atelier est un espace
 * d'équipe, doc 06 §4) ; observateur -> lecture seule (R-W1) ; projet
 * `done` -> lecture seule (R-PR4). Ces deux derniers cas sont transmis aux
 * onglets via `<Outlet context>` (voir `features/lab/lib/context.ts`)
 * plutôt que recalculés par chaque page.
 *
 * Pas d'avatars de présence ici : ils supposeraient l'awareness Yjs du Mur,
 * qui n'existe qu'une fois l'éditeur monté (et qu'aucune configuration
 * WebSocket n'active dans ce lot, voir WallPage) — les afficher à partir de
 * la liste des membres du projet ferait passer une appartenance pour une
 * présence en ligne, ce que la mission interdit explicitement.
 */
export function LabLayout() {
  const { slug = "" } = useParams<{ slug: string }>();
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useProject(slug);
  const {
    data: members,
    isLoading: isMembersLoading,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useMembers(slug);
  const { data: currentUser } = useSession();
  const [inviteOpen, setInviteOpen] = useState(false);

  const isLoading = isProjectLoading || isMembersLoading;
  const isError = isProjectError || isMembersError;

  const myMembership = members?.find((m) => m.userId === currentUser?.id);
  const isMember = Boolean(myMembership);
  const canInvite = hasAtLeastRole(myMembership?.role, "co_owner");
  const readOnly =
    myMembership?.role === "observer" || project?.state === "done";

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-13 shrink-0 items-center gap-4 border-b border-border px-4">
        <Link
          to={`/projets/${slug}`}
          className="flex items-center gap-2 text-body-md font-semibold text-foreground transition-colors hover:text-muted-foreground"
        >
          <ArrowLeft size={18} className="shrink-0 text-muted-foreground" />
          {isProjectLoading ? (
            <Spinner size="sm" />
          ) : (
            (project?.title ?? "Projet")
          )}
        </Link>

        {project && (
          <>
            <Badge tone={STATE_TONE[project.state]} className="shrink-0">
              {STATE_LABEL[project.state]}
            </Badge>
            {members && (
              <span className="shrink-0 text-body-sm text-muted-foreground">
                {members.length} membre{members.length > 1 ? "s" : ""}
              </span>
            )}
          </>
        )}

        {isMember && (
          <nav className="flex h-full items-center gap-1" aria-label="Le Lab">
            <TabLink to="mur">Le Mur</TabLink>
            <TabLink to="taches">Les Tâches</TabLink>
          </nav>
        )}

        {canInvite && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus size={14} />
            Inviter
          </Button>
        )}
      </header>

      <main className="min-h-0 flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError || !project || !members ? (
          <div className="flex h-full items-center justify-center">
            <ErrorState
              message="Impossible de charger cet atelier pour le moment."
              onRetry={() => {
                refetchProject();
                refetchMembers();
              }}
            />
          </div>
        ) : !isMember ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={Lock}
              title="L'atelier est réservé à l'équipe"
              description="Le Mur et Les Tâches ne sont visibles que par les membres de ce projet. Rejoins l'équipe depuis la fiche du projet pour y accéder."
              action={
                <Button render={<Link to={`/projets/${slug}`} />}>
                  Voir la fiche du projet
                </Button>
              }
            />
          </div>
        ) : (
          <Outlet
            context={
              {
                slug,
                project,
                myRole: myMembership!.role,
                readOnly,
                members,
              } satisfies LabContext
            }
          />
        )}
      </main>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        slug={slug}
      />
    </div>
  );
}
