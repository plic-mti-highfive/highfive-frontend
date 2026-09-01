import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tldraw } from "tldraw";
import type { Editor } from "@tldraw/editor";
import "tldraw/tldraw.css";

import { useAuth } from "@/shared/contexts/AuthContext";
import { canvasService } from "@/api/services/http/canvas.service.http";
import type { CanvasSession, ProposedTask } from "@/api/types/canvas.types";
import { useYjsStore, publishPresence } from "../hooks/useYjsStore";
import { useCanvasChat } from "../hooks/useCanvasChat";
import { CanvasChat } from "../components/CanvasChat";
import { TaskProposalsPanel } from "../components/TaskProposalsPanel";

export const CanvasPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<CanvasSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Le core verifie les droits projet puis emet le token du serveur canvas :
  // sans cet appel, la connexion WebSocket serait refusee.
  useEffect(() => {
    if (!projectId) return;

    canvasService
      .openSession(projectId)
      .then(setSession)
      .catch(() =>
        setSessionError("Impossible d'ouvrir le canvas de ce projet."),
      );
  }, [projectId]);

  if (sessionError) {
    return <CenteredMessage>{sessionError}</CenteredMessage>;
  }
  if (!session || !user) {
    return <CenteredMessage>Ouverture du canvas...</CenteredMessage>;
  }

  return (
    <CanvasWorkspace
      session={session}
      user={{ id: user.id, name: user.email }}
      onTicketsCreated={() => navigate(`/projects/${session.projectId}`)}
    />
  );
};

interface CanvasWorkspaceProps {
  session: CanvasSession;
  user: { id: string; name: string };
  onTicketsCreated: () => void;
}

/**
 * Separe de CanvasPage parce que les hooks de synchro ont besoin d'une session
 * deja resolue : les appeler avant reviendrait a ouvrir un WebSocket sans token.
 */
const CanvasWorkspace = ({
  session,
  user,
  onTicketsCreated,
}: CanvasWorkspaceProps) => {
  const { storeWithStatus, provider } = useYjsStore(session);
  const { messages, send } = useCanvasChat(provider);

  const [proposals, setProposals] = useState<ProposedTask[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const readOnly = session.role === "viewer";

  const onMount = useCallback(
    (editor: Editor) => {
      if (!provider) return;
      return publishPresence(provider, editor, user);
    },
    [provider, user],
  );

  const generate = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const result = await canvasService.generateTasks(
        session.projectId,
        session.canvasId,
      );
      if (result.empty || result.tasks.length === 0) {
        setNotice(
          "Le canvas ne contient pas encore assez de matiere. Ajoutez des post-its ou discutez dans le chat.",
        );
        return;
      }
      setProposals(result.tasks);
    } catch {
      setNotice("La generation a echoue. Reessayez dans un instant.");
    } finally {
      setGenerating(false);
    }
  };

  const confirm = async (tasks: ProposedTask[]) => {
    await canvasService.acceptTasks(session.projectId, session.canvasId, tasks);
    setProposals(null);
    onTicketsCreated();
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            {session.name}
          </h1>
          <p className="text-xs text-gray-500">
            {readOnly ? "Lecture seule" : "Edition collaborative"}
            {storeWithStatus.status === "synced-remote" &&
              storeWithStatus.connectionStatus === "offline" &&
              " · hors ligne"}
          </p>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={generating || readOnly}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {generating ? "Analyse du canvas..." : "Generer les taches"}
        </button>
      </header>

      {notice && (
        <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-800">
          {notice}
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1">
          {storeWithStatus.status === "error" ? (
            <CenteredMessage>Acces au canvas refuse.</CenteredMessage>
          ) : (
            <Tldraw store={storeWithStatus} onMount={onMount} />
          )}
        </div>

        <CanvasChat
          messages={messages}
          onSend={send}
          currentUserId={user.id}
          disabled={readOnly || !provider}
        />
      </div>

      {proposals && (
        <TaskProposalsPanel
          tasks={proposals}
          onConfirm={confirm}
          onClose={() => setProposals(null)}
        />
      )}
    </div>
  );
};

const CenteredMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen items-center justify-center">
    <p className="text-sm text-gray-500">{children}</p>
  </div>
);

export default CanvasPage;
