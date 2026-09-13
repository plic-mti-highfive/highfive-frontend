import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Badge,
  Button,
  buttonVariants,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/ui";
import { ApiError } from "@/api/client";
import {
  useAdminProjectsInfinite,
  useDeleteProjectAsAdmin,
} from "@/api/queries/admin";
import type { ProjectState, ProjectSummary } from "@/domain";
import { PROJECT_STATE_LABELS } from "../lib/labels";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { LoadMoreButton } from "./LoadMoreButton";

const STATE_TONE: Record<ProjectState, "success" | "info" | "neutral"> = {
  draft: "neutral",
  active: "success",
  done: "info",
  archived: "neutral",
};

export function ProjectsSection() {
  const [search, setSearch] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(
    null,
  );
  const [confirmTitle, setConfirmTitle] = useState("");

  const projectsQuery = useAdminProjectsInfinite();
  const deleteProject = useDeleteProjectAsAdmin();

  const projects = useMemo(
    () => projectsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [projectsQuery.data],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.owner.username.toLowerCase().includes(q),
    );
  }, [projects, search]);

  function closeDialog() {
    setProjectToDelete(null);
    setConfirmTitle("");
  }

  async function confirmDelete() {
    if (!projectToDelete) return;
    await deleteProject.mutateAsync({
      slug: projectToDelete.slug,
      confirmTitle,
    });
    closeDialog();
  }

  if (projectsQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (projectsQuery.isError) {
    const message =
      projectsQuery.error instanceof ApiError &&
      projectsQuery.error.status === 403
        ? "Tu n'as pas le droit de voir les projets."
        : "Les projets n'ont pas pu être chargés.";
    return (
      <ErrorState message={message} onRetry={() => projectsQuery.refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un projet ou un porteur"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState title="Aucun projet ne correspond à ta recherche" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Porteur</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Membres</TableHead>
              <TableHead className="text-right">Highfives</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <p className="max-w-xs truncate font-medium text-foreground">
                    {project.title}
                  </p>
                  <p className="max-w-xs truncate text-body-sm text-muted-foreground">
                    {project.tagline}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  @{project.owner.username}
                </TableCell>
                <TableCell>
                  <Badge tone={STATE_TONE[project.state]}>
                    {PROJECT_STATE_LABELS[project.state]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {project.membersCount}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {project.highfiveCount}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/projets/${project.slug}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      Voir
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setProjectToDelete(project)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <LoadMoreButton
        hasNextPage={Boolean(projectsQuery.hasNextPage)}
        isFetchingNextPage={projectsQuery.isFetchingNextPage}
        onClick={() => projectsQuery.fetchNextPage()}
      />

      <ConfirmActionDialog
        open={projectToDelete !== null}
        onOpenChange={(open) => !open && closeDialog()}
        title={`Supprimer ${projectToDelete?.title} ?`}
        description="Le projet, Le Mur, Les Tâches et les fichiers seront supprimés. Écris le titre du projet pour confirmer."
        confirmLabel="Supprimer le projet"
        destructive
        pending={deleteProject.isPending}
        confirmDisabled={confirmTitle !== projectToDelete?.title}
        onConfirm={confirmDelete}
      >
        <Field label="Titre du projet">
          <Input
            value={confirmTitle}
            onChange={(e) => setConfirmTitle(e.target.value)}
          />
        </Field>
      </ConfirmActionDialog>
    </div>
  );
}
