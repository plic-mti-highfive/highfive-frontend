import { useState } from "react";
import {
  GROUP_MAX_PARTICIPANTS,
  type ConversationDetail,
  type CurrentUser,
  type UserSummary,
} from "@/domain";
import { ApiError } from "@/api/client";
import {
  useAddConversationParticipants,
  useLeaveConversation,
  useRemoveConversationParticipant,
  useRenameConversation,
} from "@/api/queries/conversations";
import {
  Avatar,
  Button,
  Dialog,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  Field,
  Input,
  Spinner,
} from "@shared/ui";
import { PeoplePicker } from "./PeoplePicker";

export interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationDetail;
  currentUser: CurrentUser;
  /** Appele une fois le groupe quitte (la conversation n'est plus lisible). */
  onLeft: () => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * R-MSG9 : tout participant renomme le groupe, y ajoute des personnes et le
 * quitte ; seul l'administrateur (le createur, puis le plus ancien) retire
 * quelqu'un. Un compte suspendu peut seulement quitter.
 */
export function GroupSettingsDialog({
  open,
  onOpenChange,
  conversation,
  currentUser,
  onLeft,
}: GroupSettingsDialogProps) {
  const [title, setTitle] = useState(conversation.title ?? "");
  const [newPeople, setNewPeople] = useState<UserSummary[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const rename = useRenameConversation(conversation.id);
  const addParticipants = useAddConversationParticipants(conversation.id);
  const removeParticipant = useRemoveConversationParticipant(conversation.id);
  const leave = useLeaveConversation(conversation.id);

  const canWrite = currentUser.accountStatus === "active";
  const isAdmin = conversation.adminId === currentUser.id;
  const remainingSeats =
    GROUP_MAX_PARTICIPANTS - conversation.participants.length;
  const trimmedTitle = title.trim();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTitle(conversation.title ?? "");
      setNewPeople([]);
      setConfirmLeave(false);
      rename.reset();
      addParticipants.reset();
      removeParticipant.reset();
      leave.reset();
    }
    onOpenChange(next);
  }

  if (confirmLeave) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogPopup>
          <DialogTitle>Quitter le groupe ?</DialogTitle>
          <DialogDescription>
            Tu n'auras plus accès à cette conversation ni à son historique.
            {isAdmin &&
              " L'administration du groupe passera à la personne la plus ancienne."}
          </DialogDescription>
          {leave.error && (
            <p role="alert" className="mt-3 text-body-sm text-destructive">
              {errorMessage(leave.error, "Impossible de quitter le groupe.")}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmLeave(false)}
              disabled={leave.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={leave.isPending}
              onClick={() =>
                leave.mutate(undefined, {
                  onSuccess: () => {
                    handleOpenChange(false);
                    onLeft();
                  },
                })
              }
            >
              {leave.isPending && <Spinner size="sm" />}
              Quitter
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup>
        <DialogTitle>Paramètres du groupe</DialogTitle>

        <div className="mt-4 flex flex-col gap-6">
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (trimmedTitle) rename.mutate(trimmedTitle);
            }}
          >
            <Field label="Nom du groupe">
              <div className="flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder="Ex. Chorale du mardi"
                  disabled={!canWrite}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={
                    !canWrite ||
                    !trimmedTitle ||
                    trimmedTitle === conversation.title ||
                    rename.isPending
                  }
                >
                  Renommer
                </Button>
              </div>
            </Field>
            {rename.error && (
              <p role="alert" className="text-body-sm text-destructive">
                {errorMessage(
                  rename.error,
                  "Le groupe n'a pas pu être renommé.",
                )}
              </p>
            )}
          </form>

          <section className="flex flex-col gap-2">
            <p className="text-label uppercase text-muted-foreground">
              Membres · {conversation.participants.length}
            </p>
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {conversation.participants.map((person) => {
                const isSelf = person.id === currentUser.id;
                return (
                  <li
                    key={person.id}
                    className="flex items-center gap-2 rounded-md px-1 py-1"
                  >
                    <Avatar
                      name={person.displayName ?? person.username}
                      src={person.avatar}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-body-md text-foreground">
                      {person.displayName ?? `@${person.username}`}
                      {isSelf && (
                        <span className="text-muted-foreground"> (toi)</span>
                      )}
                    </span>
                    {person.id === conversation.adminId && (
                      <span className="shrink-0 text-body-sm text-muted-foreground">
                        Admin
                      </span>
                    )}
                    {isAdmin && canWrite && !isSelf && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={removeParticipant.isPending}
                        onClick={() => removeParticipant.mutate(person.id)}
                      >
                        Retirer
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
            {removeParticipant.error && (
              <p role="alert" className="text-body-sm text-destructive">
                {errorMessage(
                  removeParticipant.error,
                  "Cette personne n'a pas pu être retirée.",
                )}
              </p>
            )}
          </section>

          {canWrite && (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newPeople.length === 0) return;
                addParticipants.mutate(
                  newPeople.map((person) => person.id),
                  { onSuccess: () => setNewPeople([]) },
                );
              }}
            >
              <Field
                label="Ajouter des personnes"
                description={`${GROUP_MAX_PARTICIPANTS} personnes au plus par groupe.`}
              >
                <PeoplePicker
                  selected={newPeople}
                  onChange={setNewPeople}
                  excludeIds={conversation.participantIds}
                  disabled={remainingSeats <= 0}
                />
              </Field>
              {newPeople.length > remainingSeats && (
                <p role="alert" className="text-body-sm text-destructive">
                  Il reste {Math.max(remainingSeats, 0)} place
                  {remainingSeats > 1 ? "s" : ""} dans ce groupe.
                </p>
              )}
              {addParticipants.error && (
                <p role="alert" className="text-body-sm text-destructive">
                  {errorMessage(
                    addParticipants.error,
                    "Ces personnes n'ont pas pu être ajoutées.",
                  )}
                </p>
              )}
              {newPeople.length > 0 && (
                <Button
                  type="submit"
                  className="self-end"
                  disabled={
                    addParticipants.isPending ||
                    newPeople.length > remainingSeats
                  }
                >
                  {addParticipants.isPending && <Spinner size="sm" />}
                  Ajouter
                </Button>
              )}
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          <Button variant="destructive" onClick={() => setConfirmLeave(true)}>
            Quitter le groupe
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
