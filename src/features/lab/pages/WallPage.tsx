import { useEffect, useState } from "react";
import { Tldraw, renderPlaintextFromRichText } from "tldraw";
import type { Editor, TLShape, TLShapeId } from "@tldraw/editor";
import "tldraw/tldraw.css";

import { Button, ErrorState, Spinner } from "@shared/ui";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { ApiError } from "@/api/client";
import { useSession } from "@/api/queries/auth";
import {
  useAcceptSuggestedTasks,
  useConvertWallSelectionToTasks,
  useSuggestWallTasks,
} from "@/api/queries/wall";
import { useLabContext } from "../lib/context";
import { useTldrawColorScheme } from "../wall/tldrawTheme";
import { publishLocalPresence } from "../wall/presence";
import { useWallSync, type WallSync } from "../wall/useWallSync";
import {
  ConvertSelectionDialog,
  type WallSelectionItem,
} from "../components/ConvertSelectionDialog";
import {
  SuggestTasksDialog,
  type SuggestTasksPhase,
} from "../components/SuggestTasksDialog";

const MOBILE_BREAKPOINT = 640;

const SHAPE_TYPE_LABEL: Record<string, string> = {
  geo: "Forme",
  draw: "Dessin",
  arrow: "Flèche",
  line: "Ligne",
  frame: "Cadre",
  image: "Image",
  video: "Vidéo",
  highlight: "Surlignage",
  bookmark: "Lien",
  embed: "Contenu intégré",
};

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(query.matches);
    handler();
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function describeShape(editor: Editor, shape: TLShape): string {
  if (shape.type === "text" || shape.type === "note") {
    const richText = (shape.props as { richText?: unknown }).richText;
    if (richText) {
      const text = renderPlaintextFromRichText(
        editor,
        richText as Parameters<typeof renderPlaintextFromRichText>[1],
      ).trim();
      if (text) return text.length > 80 ? `${text.slice(0, 80)}…` : text;
    }
    return shape.type === "note" ? "Note (sans texte)" : "Texte (sans contenu)";
  }
  return SHAPE_TYPE_LABEL[shape.type] ?? "Élément";
}

/**
 * Tableau blanc (`/projets/:slug/lab/mur`, doc 04 §10, V2-10) : un seul espace
 * tldraw, partagé en temps réel entre les membres via le service canvas
 * (Yjs/Hocuspocus, `useWallSync`) et persisté côté serveur. Le bandeau reflète
 * l'état réel de la connexion (jamais de faux « synchronisé »).
 *
 * Deux façons de créer des tâches depuis le Mur : convertir la sélection
 * (un élément = une tâche, sans IA) ou « Suggérer des tâches (IA) » (le core
 * lit le Mur, l'IA propose, l'utilisateur valide).
 */
export default function WallPage() {
  const { slug, project, readOnly: shellReadOnly } = useLabContext();
  useDocumentTitle(`Tableau blanc · ${project.title}`);
  const isMobile = useIsMobile();
  const colorScheme = useTldrawColorScheme();
  const convertSelection = useConvertWallSelectionToTasks(slug);
  const suggest = useSuggestWallTasks(slug);
  const acceptSuggestions = useAcceptSuggestedTasks(slug);
  const sync = useWallSync(slug);
  const { data: me } = useSession();

  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedIds, setSelectedIds] = useState<TLShapeId[]>([]);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertItems, setConvertItems] = useState<WallSelectionItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [suggestOpen, setSuggestOpen] = useState(false);

  // Le serveur impose la lecture seule aux observateurs (`role: viewer`).
  const readOnly = shellReadOnly || isMobile || sync.role === "viewer";

  useEffect(() => {
    editor?.updateInstanceState({ isReadonly: readOnly });
  }, [editor, readOnly]);

  const awareness = sync.awareness;
  const meId = me?.id;
  const meName = me?.displayName ?? me?.username;
  useEffect(() => {
    if (!editor || !awareness || !meId || !meName) return;
    return publishLocalPresence(awareness, editor, { id: meId, name: meName });
  }, [editor, awareness, meId, meName]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  function handleMount(mounted: Editor) {
    setEditor(mounted);
    mounted.updateInstanceState({ isReadonly: readOnly });
    const unlisten = mounted.store.listen(
      () => setSelectedIds(mounted.getSelectedShapeIds()),
      { source: "user", scope: "all" },
    );
    return () => {
      unlisten();
      setEditor(null);
      setSelectedIds([]);
    };
  }

  function openConvertDialog() {
    if (!editor) return;
    const items = editor
      .getSelectedShapes()
      .map((shape) => ({ id: shape.id, label: describeShape(editor, shape) }));
    setConvertItems(items);
    setConvertOpen(true);
  }

  function openSuggestDialog() {
    acceptSuggestions.reset();
    setSuggestOpen(true);
    suggest.mutate();
  }

  function closeSuggestDialog() {
    setSuggestOpen(false);
    suggest.reset();
    acceptSuggestions.reset();
  }

  const suggestPhase: SuggestTasksPhase = suggest.isPending
    ? "loading"
    : suggest.isError
      ? "error"
      : suggest.data?.empty
        ? "empty"
        : suggest.data
          ? "ready"
          : "loading";

  return (
    <div className="flex h-full flex-col">
      {isMobile ? (
        <p className="shrink-0 border-b border-warning-border/30 bg-warning-bg px-4 py-2 text-body-sm text-warning-fg">
          Le tableau blanc se modifie depuis un ordinateur : lecture seule sur
          mobile.
        </p>
      ) : shellReadOnly ? (
        <p className="shrink-0 border-b border-border bg-muted px-4 py-2 text-body-sm text-muted-foreground">
          Lecture seule : tu ne peux pas modifier le tableau blanc.
        </p>
      ) : null}

      <SyncBanner sync={sync} />

      {successMessage && (
        <p
          role="status"
          className="shrink-0 border-b border-success-border/30 bg-success-bg px-4 py-2 text-body-sm text-success-fg"
        >
          {successMessage}
        </p>
      )}

      <div className="relative min-h-0 flex-1">
        {sync.status === "ready" && sync.store ? (
          <Tldraw
            key={sync.store.id}
            store={sync.store}
            colorScheme={colorScheme}
            onMount={handleMount}
          />
        ) : sync.status === "error" ? (
          <ErrorState
            className="h-full"
            message={sync.error ?? "Le tableau blanc est indisponible."}
            onRetry={sync.retry}
          />
        ) : (
          <div
            className="flex h-full items-center justify-center gap-3 text-body-md text-muted-foreground"
            role="status"
          >
            <Spinner size="sm" />
            <span>Connexion au tableau blanc…</span>
          </div>
        )}

        {!readOnly && sync.status === "ready" && (
          <div className="pointer-events-none absolute bottom-20 right-3 z-10 flex flex-col items-end gap-2">
            <Button
              className="pointer-events-auto shadow-overlay"
              size="sm"
              variant="outline"
              onClick={openSuggestDialog}
            >
              Suggérer des tâches (IA)
            </Button>
            <Button
              className="pointer-events-auto shadow-overlay"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={openConvertDialog}
            >
              Convertir la sélection en tâches
              {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
            </Button>
          </div>
        )}
      </div>

      <SuggestTasksDialog
        open={suggestOpen}
        phase={suggestPhase}
        proposals={suggest.data?.tasks ?? []}
        errorMessage={suggest.isError ? apiMessage(suggest.error) : undefined}
        accepting={acceptSuggestions.isPending}
        acceptError={
          acceptSuggestions.isError
            ? apiMessage(acceptSuggestions.error)
            : undefined
        }
        onClose={closeSuggestDialog}
        onRetry={() => suggest.mutate()}
        onConfirm={(tasks) =>
          acceptSuggestions.mutate(
            { tasks },
            {
              onSuccess: (created) => {
                closeSuggestDialog();
                setSuccessMessage(
                  `${created.length} tâche${created.length > 1 ? "s" : ""} créée${created.length > 1 ? "s" : ""} dans Étapes.`,
                );
              },
            },
          )
        }
      />

      <ConvertSelectionDialog
        open={convertOpen}
        items={convertItems}
        pending={convertSelection.isPending}
        onClose={() => setConvertOpen(false)}
        onConfirm={(elements) => {
          convertSelection.mutate(
            { elements },
            {
              onSuccess: (tasks) => {
                setConvertOpen(false);
                editor?.selectNone();
                setSuccessMessage(
                  `${tasks.length} tâche${tasks.length > 1 ? "s" : ""} créée${tasks.length > 1 ? "s" : ""} dans Étapes.`,
                );
              },
            },
          );
        }}
      />
    </div>
  );
}

function apiMessage(error: unknown): string {
  if (error instanceof ApiError && error.message) return error.message;
  return "Une erreur est survenue. Réessaie dans un instant.";
}

/** État honnête de la synchronisation (connexion, hors ligne, erreur). */
function SyncBanner({ sync }: { sync: WallSync }) {
  if (sync.status === "loading") {
    return (
      <p
        role="status"
        className="shrink-0 border-b border-info-border/30 bg-info-bg px-4 py-2 text-body-sm text-info-fg"
      >
        Connexion au tableau blanc partagé…
      </p>
    );
  }
  if (sync.status === "error") return null;
  if (sync.connection === "offline") {
    return (
      <div
        role="alert"
        className="flex shrink-0 items-center justify-between gap-3 border-b border-warning-border/30 bg-warning-bg px-4 py-2 text-body-sm text-warning-fg"
      >
        <span>
          {sync.error ??
            "Hors ligne : tes modifications ne sont pas partagées pour l'instant et seront envoyées à la reconnexion."}
        </span>
        <Button size="sm" variant="outline" onClick={sync.retry}>
          Réessayer
        </Button>
      </div>
    );
  }
  return (
    <p
      role="status"
      className="shrink-0 border-b border-success-border/30 bg-success-bg px-4 py-2 text-body-sm text-success-fg"
    >
      Tableau blanc partagé : les modifications sont synchronisées en temps
      réel.
    </p>
  );
}
