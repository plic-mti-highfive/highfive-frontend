import { useEffect, useState } from "react";
import { Tldraw, renderPlaintextFromRichText } from "tldraw";
import type { Editor, TLShape, TLShapeId } from "@tldraw/editor";
import "tldraw/tldraw.css";

import { Button } from "@shared/ui";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useConvertWallSelectionToTasks } from "@/api/queries/wall";
import { useLabContext } from "../lib/context";
import { useTldrawColorScheme } from "../wall/tldrawTheme";
import {
  ConvertSelectionDialog,
  type WallSelectionItem,
} from "../components/ConvertSelectionDialog";

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
 * tldraw qui remplace les deux anciens espaces de travail (l'un
 * collaboratif via Yjs/Hocuspocus, l'autre un tableau de post-its maison).
 * Aucune configuration WebSocket n'existe dans ce lot (le seul flux temps
 * réel du dépôt reposait sur une route de session dédiée à l'ancien espace
 * collaboratif, hors du contrat v2 — voir `docs/v2/API-ROUTES.md`) :
 * l'éditeur tourne donc en
 * mode local, persisté par onglet via `persistenceKey` (IndexedDB), avec un
 * bandeau clair plutôt qu'une fausse synchronisation (P7 : jamais d'écran
 * d'erreur générique).
 */
export default function WallPage() {
  const { slug, project, readOnly: shellReadOnly } = useLabContext();
  useDocumentTitle(`Tableau blanc · ${project.title}`);
  const isMobile = useIsMobile();
  const colorScheme = useTldrawColorScheme();
  const convertSelection = useConvertWallSelectionToTasks(slug);

  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedIds, setSelectedIds] = useState<TLShapeId[]>([]);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertItems, setConvertItems] = useState<WallSelectionItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const readOnly = shellReadOnly || isMobile;

  useEffect(() => {
    editor?.updateInstanceState({ isReadonly: readOnly });
  }, [editor, readOnly]);

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
    return unlisten;
  }

  function openConvertDialog() {
    if (!editor) return;
    const items = editor
      .getSelectedShapes()
      .map((shape) => ({ id: shape.id, label: describeShape(editor, shape) }));
    setConvertItems(items);
    setConvertOpen(true);
  }

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
      ) : (
        <p className="shrink-0 border-b border-info-border/30 bg-info-bg px-4 py-2 text-body-sm text-info-fg">
          Les modifications ne sont pas partagées pour l'instant.
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="shrink-0 border-b border-success-border/30 bg-success-bg px-4 py-2 text-body-sm text-success-fg"
        >
          {successMessage}
        </p>
      )}

      <div className="relative min-h-0 flex-1">
        <Tldraw
          persistenceKey={`highfive-wall-${slug}`}
          colorScheme={colorScheme}
          onMount={handleMount}
        />

        {!readOnly && (
          <div className="pointer-events-none absolute bottom-20 right-3 z-10">
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
