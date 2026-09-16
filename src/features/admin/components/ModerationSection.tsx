import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  Field,
  Skeleton,
  Textarea,
} from "@shared/ui";
import { ApiError } from "@/api/client";
import {
  useDeleteReportedComment,
  useHideReportedComment,
  useRejectReport,
  useReportsInfinite,
  useResolveReport,
  useSuspendUser,
} from "@/api/queries/admin";
import type { ReportStatus, ReportSummary } from "@/domain";
import { REPORT_REASON_LABELS, REPORT_TARGET_TYPE_LABELS } from "../lib/labels";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { LoadMoreButton } from "./LoadMoreButton";

/** R-S2 : les signalements sur une même cible se lisent comme une seule ligne. */
interface ReportGroup {
  targetId: string;
  representative: ReportSummary;
  reports: ReportSummary[];
  reasons: ReportSummary["reason"][];
}

function groupReports(reports: ReportSummary[]): ReportGroup[] {
  const byTarget = new Map<string, ReportSummary[]>();
  for (const report of reports) {
    byTarget.set(report.targetId, [
      ...(byTarget.get(report.targetId) ?? []),
      report,
    ]);
  }
  return [...byTarget.values()].map((list) => {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return {
      targetId: sorted[0].targetId,
      representative: sorted[0],
      reports: sorted,
      reasons: [...new Set(list.map((r) => r.reason))],
    };
  });
}

const STATUS_FILTERS: { id: ReportStatus; label: string }[] = [
  { id: "new", label: "Nouveaux" },
  { id: "handled", label: "Traités" },
  { id: "rejected", label: "Rejetés" },
];

type PendingAction =
  | { kind: "resolve" | "reject"; group: ReportGroup }
  | { kind: "hide" | "delete-comment"; group: ReportGroup }
  | { kind: "suspend-author"; group: ReportGroup };

export function ModerationSection() {
  const [status, setStatus] = useState<ReportStatus>("new");
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const reportsQuery = useReportsInfinite();
  const resolveReport = useResolveReport();
  const rejectReport = useRejectReport();
  const hideComment = useHideReportedComment();
  const deleteComment = useDeleteReportedComment();
  const suspendUser = useSuspendUser();

  const allReports = useMemo(
    () => reportsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [reportsQuery.data],
  );
  const allGroups = useMemo(() => groupReports(allReports), [allReports]);
  const groups = useMemo(
    () => allGroups.filter((g) => g.representative.status === status),
    [allGroups, status],
  );
  const counts = useMemo(() => {
    const byStatus: Record<ReportStatus, number> = {
      new: 0,
      handled: 0,
      rejected: 0,
    };
    for (const group of allGroups) byStatus[group.representative.status] += 1;
    return byStatus;
  }, [allGroups]);

  function closeDialog() {
    setPendingAction(null);
    setReason("");
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    const { kind, group } = pendingAction;
    if (kind === "resolve") {
      await Promise.all(
        group.reports.map((r) =>
          resolveReport.mutateAsync({ reportId: r.id, reason }),
        ),
      );
    } else if (kind === "reject") {
      await Promise.all(
        group.reports.map((r) =>
          rejectReport.mutateAsync({ reportId: r.id, reason }),
        ),
      );
    } else if (kind === "hide") {
      await hideComment.mutateAsync(group.targetId);
    } else if (kind === "delete-comment") {
      await deleteComment.mutateAsync(group.targetId);
    } else if (
      kind === "suspend-author" &&
      group.representative.target?.author
    ) {
      await suspendUser.mutateAsync({
        userId: group.representative.target.author.id,
        reason,
      });
      await Promise.all(
        group.reports.map((r) =>
          resolveReport.mutateAsync({ reportId: r.id, reason }),
        ),
      );
    }
    closeDialog();
  }

  const isPending =
    resolveReport.isPending ||
    rejectReport.isPending ||
    hideComment.isPending ||
    deleteComment.isPending ||
    suspendUser.isPending;

  const needsReason =
    pendingAction?.kind === "resolve" ||
    pendingAction?.kind === "reject" ||
    pendingAction?.kind === "suspend-author";

  if (reportsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (reportsQuery.isError) {
    const message =
      reportsQuery.error instanceof ApiError &&
      reportsQuery.error.status === 403
        ? "Tu n'as pas le droit de voir la modération."
        : "Les signalements n'ont pas pu être chargés.";
    return (
      <ErrorState message={message} onRetry={() => reportsQuery.refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            size="sm"
            variant={status === filter.id ? "secondary" : "ghost"}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
            {counts[filter.id] > 0 && ` (${counts[filter.id]})`}
          </Button>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Aucun signalement en attente" />
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const r = group.representative;
            return (
              <Card key={group.targetId}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Badge tone="warning">
                          {group.reports.length} signalement
                          {group.reports.length > 1 ? "s" : ""}
                        </Badge>
                        <span className="text-body-sm text-muted-foreground">
                          {REPORT_TARGET_TYPE_LABELS[r.targetType]} ·{" "}
                          {group.reasons
                            .map((reason) => REPORT_REASON_LABELS[reason])
                            .join(", ")}
                        </span>
                      </div>
                      {r.target?.excerpt && (
                        <p className="text-body-md text-foreground">
                          « {r.target.excerpt} »
                        </p>
                      )}
                      {(r.target?.author || r.target?.projectTitle) && (
                        <p className="text-body-sm text-muted-foreground">
                          {r.target.author && (
                            <>par @{r.target.author.username}</>
                          )}
                          {r.target.author &&
                            r.target.projectTitle &&
                            " · sur "}
                          {r.target.projectTitle}
                        </p>
                      )}
                    </div>
                    <span
                      className="shrink-0 text-body-sm text-muted-foreground"
                      title={formatExactDateTime(r.createdAt)}
                    >
                      {formatRelativeDate(r.createdAt)}
                    </span>
                  </div>

                  {status === "new" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {r.target?.projectSlug && (
                        <Link
                          to={`/projets/${r.target.projectSlug}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          Voir en contexte
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPendingAction({ kind: "reject", group })
                        }
                      >
                        Rejeter
                      </Button>
                      {r.targetType === "comment" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPendingAction({ kind: "hide", group })
                            }
                          >
                            Masquer le commentaire
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setPendingAction({
                                kind: "delete-comment",
                                group,
                              })
                            }
                          >
                            Supprimer le commentaire
                          </Button>
                        </>
                      )}
                      {r.target?.author && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setPendingAction({ kind: "suspend-author", group })
                          }
                        >
                          Suspendre l'auteur
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() =>
                          setPendingAction({ kind: "resolve", group })
                        }
                      >
                        Résoudre
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <LoadMoreButton
        hasNextPage={Boolean(reportsQuery.hasNextPage)}
        isFetchingNextPage={reportsQuery.isFetchingNextPage}
        onClick={() => reportsQuery.fetchNextPage()}
      />

      <ConfirmActionDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && closeDialog()}
        title={
          pendingAction?.kind === "resolve"
            ? "Résoudre ce signalement ?"
            : pendingAction?.kind === "reject"
              ? "Rejeter ce signalement ?"
              : pendingAction?.kind === "hide"
                ? "Masquer ce commentaire ?"
                : pendingAction?.kind === "suspend-author"
                  ? "Suspendre l'auteur ?"
                  : "Supprimer ce commentaire ?"
        }
        description={
          pendingAction?.kind === "delete-comment"
            ? "Le commentaire sera supprimé pour tout le monde."
            : pendingAction?.kind === "suspend-author"
              ? "La personne perd toute capacité d'écriture jusqu'à la levée de la suspension."
              : undefined
        }
        confirmLabel={
          pendingAction?.kind === "resolve"
            ? "Résoudre"
            : pendingAction?.kind === "reject"
              ? "Rejeter"
              : pendingAction?.kind === "hide"
                ? "Masquer"
                : pendingAction?.kind === "suspend-author"
                  ? "Suspendre l'auteur"
                  : "Supprimer le commentaire"
        }
        destructive={
          pendingAction?.kind === "delete-comment" ||
          pendingAction?.kind === "reject" ||
          pendingAction?.kind === "suspend-author"
        }
        pending={isPending}
        confirmDisabled={needsReason && reason.trim().length === 0}
        onConfirm={confirmPendingAction}
      >
        {needsReason && (
          <Field
            label="Motif"
            required
            description="Journalisé, visible par la personne concernée."
          >
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </Field>
        )}
      </ConfirmActionDialog>
    </div>
  );
}
