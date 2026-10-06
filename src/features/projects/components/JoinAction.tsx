import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@shared/ui";
import { useCreateJoinRequest } from "@/api/queries/memberships";
import type { Participation } from "@/domain";
import { JoinProjectModal } from "./JoinProjectModal";

/**
 * Action principale de la fiche (doc 13 E-10, composant `JoinAction`, six
 * etats). Le contrat v2 n'expose pas de route pour consulter l'etat de sa
 * propre demande (`GET .../join-requests` est reserve au porteur+, doc
 * API-ROUTES) : apres envoi, l'etat "demande envoyee" reste local a la
 * session plutot que rechargeable — signale dans le rapport de mission.
 */
export function JoinAction({
  slug,
  projectTitle,
  participation,
  isAuthenticated,
  isMember,
}: {
  slug: string;
  projectTitle: string;
  participation: Participation;
  isAuthenticated: boolean;
  isMember: boolean;
}) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const createJoinRequest = useCreateJoinRequest(slug);

  if (isMember) {
    return (
      <Button
        variant="secondary"
        onClick={() => navigate(`/projets/${slug}/lab`)}
      >
        Aller au Lab
        <ArrowRight aria-hidden="true" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={() =>
          navigate(`/connexion?suite=${encodeURIComponent(`/projets/${slug}`)}`)
        }
      >
        Se connecter pour rejoindre
        <ArrowRight aria-hidden="true" />
      </Button>
    );
  }

  if (participation === "on_invite") {
    return (
      <Button variant="outline" disabled>
        Sur invitation
      </Button>
    );
  }

  if (requestSent) {
    return (
      <Button variant="outline" disabled>
        Demande envoyée
      </Button>
    );
  }

  if (participation === "on_request") {
    return (
      <>
        <Button onClick={() => setModalOpen(true)}>Demander à rejoindre</Button>
        <JoinProjectModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projectTitle={projectTitle}
          isSubmitting={createJoinRequest.isPending}
          onSubmit={(message) => {
            createJoinRequest.mutate(
              { message },
              {
                onSuccess: () => {
                  setModalOpen(false);
                  setRequestSent(true);
                },
              },
            );
          }}
        />
      </>
    );
  }

  // participation === "open" : R-D... auto-accepte cote handler.
  return (
    <Button
      disabled={createJoinRequest.isPending}
      onClick={() =>
        createJoinRequest.mutate({}, { onSuccess: () => setRequestSent(true) })
      }
    >
      Rejoindre le projet
    </Button>
  );
}
