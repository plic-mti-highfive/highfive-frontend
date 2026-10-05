import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";

import { Button, ErrorState, Skeleton, TabLink } from "@shared/ui";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { useProject } from "@/api/queries/projects";
import { useMembers } from "@/api/queries/memberships";
import { useProjectHighfivers } from "@/api/queries/highfives";
import { ApiError } from "@/api/client";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { getMembershipRole, getProjectCapabilities } from "../lib/capabilities";
import { ProjectBanner } from "./ProjectBanner";
import { ProjectHeader } from "./ProjectHeader";

export interface ProjectOutletContext {
  project: NonNullable<ReturnType<typeof useProject>["data"]>;
  members: NonNullable<ReturnType<typeof useMembers>["data"]>;
  capabilities: ReturnType<typeof getProjectCapabilities>;
}

function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-6 w-24 rounded-pill" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/**
 * Coquille de la fiche projet (mission item 1) : recupere le projet une
 * seule fois pour les trois onglets-routes (Apercu/Annonces/Equipe, R-R3),
 * affiche l'en-tete commun et les cinq etats (chargement/vide n.a./erreur/
 * permission/succes, doc 16). Les pages enfants recoivent le contexte via
 * `useOutletContext<ProjectOutletContext>()`.
 */
export function ProjectLayout() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCurrentUser();

  const projectQuery = useProject(slug);
  const membersQuery = useMembers(slug);
  const highfiversQuery = useProjectHighfivers(slug);

  useDocumentTitle(projectQuery.data?.title);

  if (projectQuery.isLoading || membersQuery.isLoading) {
    return (
      <div className="mx-auto max-w-content px-6 py-10">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  const error = projectQuery.error;
  if (error instanceof ApiError && error.status === 403) {
    return (
      <div className="mx-auto max-w-content px-6 py-20">
        <ErrorState message="Ce projet est privé. Il faut une invitation pour le voir." />
        <div className="mt-2 flex justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Retour à Découvrir
          </Button>
        </div>
      </div>
    );
  }
  if (
    (error instanceof ApiError && error.status === 404) ||
    !projectQuery.data
  ) {
    return (
      <div className="mx-auto max-w-content px-6 py-20">
        <ErrorState message="Cette page n'existe pas. Le lien est peut-être ancien, ou le projet a été supprimé." />
        <div className="mt-2 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            Retour à Découvrir
          </Button>
          <Button variant="outline" onClick={() => navigate("/recherche")}>
            Rechercher
          </Button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-content px-6 py-20">
        <ErrorState
          message="Le projet n'a pas pu être chargé."
          onRetry={() => projectQuery.refetch()}
        />
      </div>
    );
  }

  const project = projectQuery.data;
  const members = membersQuery.data ?? [];
  const owner = members.find((member) => member.role === "owner")?.user;
  const role = getMembershipRole(members, user?.id);
  const capabilities = getProjectCapabilities(role, isAuthenticated);
  const highfiveGiven = Boolean(
    user && highfiversQuery.data?.items.some((person) => person.id === user.id),
  );

  // Accent choisi par le porteur : pose `data-accent` sur toute la fiche (les
  // variables `--accent-*` en descendent) et teinte le header. Sans accent,
  // aucun attribut ni fond : la fiche reste identique a celle d'origine.
  const accent = project.customization?.accent;
  const header = (
    <ProjectHeader
      project={project}
      owner={owner}
      isAuthenticated={isAuthenticated}
      isMember={capabilities.isMember}
      canEdit={capabilities.canEdit}
      highfiveGiven={highfiveGiven}
      tinted={accent !== undefined}
    />
  );
  // `border-[var(--accent-base)]` n'est valide que sous un `data-accent` :
  // on ne le passe qu'avec un accent, sinon l'onglet garde `border-foreground`.
  const accentTabClass = accent
    ? ({ isActive }: { isActive: boolean }) =>
        isActive ? "border-[var(--accent-base)]" : undefined
    : undefined;

  return (
    <div
      data-accent={accent}
      className="mx-auto flex max-w-content flex-col gap-6 px-6 py-10"
    >
      <ProjectBanner banner={project.customization?.banner} />

      {project.state === "done" && (
        <div className="rounded-lg bg-info-bg px-4 py-3 text-body-sm text-info-fg">
          Ce projet est terminé. Le Lab est en lecture seule, les commentaires
          restent ouverts.
        </div>
      )}
      {project.state === "archived" && (
        <div className="rounded-lg bg-muted px-4 py-3 text-body-sm text-muted-foreground">
          <Lock size={14} className="mr-1.5 inline align-text-bottom" />
          Ce projet est archivé.
        </div>
      )}

      {accent ? (
        <div className="rounded-xl bg-[var(--accent-light)] p-6">{header}</div>
      ) : (
        header
      )}

      <nav className="border-b border-border" aria-label="Sections du projet">
        <div className="flex gap-1">
          <TabLink to={`/projets/${slug}`} end className={accentTabClass}>
            Aperçu
          </TabLink>
          <TabLink to={`/projets/${slug}/annonces`} className={accentTabClass}>
            Annonces
          </TabLink>
          <TabLink to={`/projets/${slug}/equipe`} className={accentTabClass}>
            <span className="flex items-center gap-2">
              Équipe
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {members.length}
              </span>
            </span>
          </TabLink>
        </div>
      </nav>

      <Outlet
        context={
          { project, members, capabilities } satisfies ProjectOutletContext
        }
      />
    </div>
  );
}
