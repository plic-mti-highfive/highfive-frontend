import { useState } from "react";
import type { ProposedTask } from "@/api/types/canvas.types";

interface TaskProposalsPanelProps {
  tasks: ProposedTask[];
  onConfirm: (tasks: ProposedTask[]) => Promise<void>;
  onClose: () => void;
}

/**
 * L'IA propose, l'utilisateur dispose : rien n'est cree tant qu'il n'a pas
 * valide. Il peut decocher ce qui ne va pas et corriger les titres.
 */
export const TaskProposalsPanel = ({
  tasks,
  onConfirm,
  onClose,
}: TaskProposalsPanelProps) => {
  const [selected, setSelected] = useState<boolean[]>(() =>
    tasks.map(() => true),
  );
  const [edited, setEdited] = useState<ProposedTask[]>(tasks);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keptCount = selected.filter(Boolean).length;

  const toggle = (index: number) =>
    setSelected((current) =>
      current.map((value, i) => (i === index ? !value : value)),
    );

  const editTitle = (index: number, title: string) =>
    setEdited((current) =>
      current.map((task, i) => (i === index ? { ...task, title } : task)),
    );

  const confirm = async () => {
    const kept = edited.filter(
      (_, index) => selected[index] && edited[index].title.trim(),
    );
    if (!kept.length) return;

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(kept);
    } catch {
      setError("La creation des tickets a echoue. Reessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <header className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Taches proposees
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Deduites du canvas et de la description du projet. Decochez ce que
            vous ne voulez pas : rien n'est cree avant validation.
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {edited.map((task, index) => (
            <div
              key={index}
              className={`rounded-md border p-3 transition ${
                selected[index]
                  ? "border-gray-900 bg-white"
                  : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected[index]}
                  onChange={() => toggle(index)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <input
                    value={task.title}
                    onChange={(event) => editTitle(index, event.target.value)}
                    className="w-full rounded border border-transparent bg-transparent font-medium text-gray-900 hover:border-gray-300 focus:border-gray-900 focus:outline-none"
                  />
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {task.description}
                    </p>
                  )}
                  {task.sourceHints.length > 0 && (
                    <p className="mt-2 text-xs text-gray-400">
                      D'apres : {task.sourceHints.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <footer className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <span className="text-sm text-gray-500">
            {keptCount} tache{keptCount > 1 ? "s" : ""} retenue
            {keptCount > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={submitting || keptCount === 0}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {submitting
                ? "Creation..."
                : `Creer ${keptCount} ticket${keptCount > 1 ? "s" : ""}`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
