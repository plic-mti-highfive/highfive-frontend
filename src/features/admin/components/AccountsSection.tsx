import { useMemo, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
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
  Textarea,
} from "@shared/ui";
import { ApiError } from "@/api/client";
import {
  useAdminUsersInfinite,
  useReactivateUser,
  useSuspendUser,
} from "@/api/queries/admin";
import type { AccountStatus, CurrentUser } from "@/domain";
import { ACCOUNT_STATUS_LABELS } from "../lib/labels";
import { formatExactDateTime, formatRelativeDate } from "@shared/lib/dates";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { LoadMoreButton } from "./LoadMoreButton";

const STATUS_TONE: Record<AccountStatus, "success" | "warning" | "danger"> = {
  active: "success",
  suspended: "warning",
  deleted: "danger",
};

type PendingAction = { kind: "suspend" | "reactivate"; user: CurrentUser };

export function AccountsSection() {
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const usersQuery = useAdminUsersInfinite();
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();

  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [usersQuery.data],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  function closeDialog() {
    setPendingAction(null);
    setReason("");
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    if (pendingAction.kind === "suspend") {
      await suspendUser.mutateAsync({ userId: pendingAction.user.id, reason });
    } else {
      await reactivateUser.mutateAsync({
        userId: pendingAction.user.id,
        reason,
      });
    }
    closeDialog();
  }

  if (usersQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (usersQuery.isError) {
    const message =
      usersQuery.error instanceof ApiError && usersQuery.error.status === 403
        ? "Tu n'as pas le droit de voir les comptes."
        : "Les comptes n'ont pas pu être chargés.";
    return (
      <ErrorState message={message} onRetry={() => usersQuery.refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un pseudo ou un e-mail"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState title="Aucun compte ne correspond à ta recherche" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personne</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      name={user.displayName ?? user.username}
                      src={user.avatar}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        @{user.username}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[user.accountStatus]}>
                    {ACCOUNT_STATUS_LABELS[user.accountStatus]}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-muted-foreground"
                  title={formatExactDateTime(user.createdAt)}
                >
                  {formatRelativeDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {user.accountStatus === "suspended" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPendingAction({ kind: "reactivate", user })
                      }
                    >
                      Lever la suspension
                    </Button>
                  ) : user.accountStatus === "active" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setPendingAction({ kind: "suspend", user })
                      }
                    >
                      Suspendre
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <LoadMoreButton
        hasNextPage={Boolean(usersQuery.hasNextPage)}
        isFetchingNextPage={usersQuery.isFetchingNextPage}
        onClick={() => usersQuery.fetchNextPage()}
      />

      <ConfirmActionDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && closeDialog()}
        title={
          pendingAction?.kind === "suspend"
            ? `Suspendre @${pendingAction.user.username} ?`
            : `Lever la suspension de @${pendingAction?.user.username} ?`
        }
        description={
          pendingAction?.kind === "suspend"
            ? "La personne perd toute capacité d'écriture jusqu'à la levée de la suspension."
            : "La personne retrouve toutes ses capacités d'écriture."
        }
        confirmLabel={
          pendingAction?.kind === "suspend"
            ? "Suspendre"
            : "Lever la suspension"
        }
        destructive={pendingAction?.kind === "suspend"}
        pending={suspendUser.isPending || reactivateUser.isPending}
        confirmDisabled={
          pendingAction?.kind === "suspend" && reason.trim().length === 0
        }
        onConfirm={confirmPendingAction}
      >
        {pendingAction?.kind === "suspend" && (
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
