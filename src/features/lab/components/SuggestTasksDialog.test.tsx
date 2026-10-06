// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProposedTask } from "@/domain";
import {
  SuggestTasksDialog,
  type SuggestTasksDialogProps,
} from "./SuggestTasksDialog";

afterEach(cleanup);

const PROPOSALS: ProposedTask[] = [
  {
    title: "Préparer la maquette",
    description: "Dessiner les écrans clés.",
    sourceHints: ["post-it maquette"],
  },
  { title: "Écrire le brief", description: "", sourceHints: [] },
  { title: "Contacter la mairie", description: "", sourceHints: [] },
];

function setup(overrides: Partial<SuggestTasksDialogProps> = {}) {
  const props: SuggestTasksDialogProps = {
    open: true,
    phase: "ready",
    proposals: PROPOSALS,
    accepting: false,
    onClose: vi.fn(),
    onRetry: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<SuggestTasksDialog {...props} />);
  return props;
}

describe("SuggestTasksDialog", () => {
  it("affiche titre, description et indices d'origine des propositions", () => {
    setup();
    expect(screen.getByDisplayValue("Préparer la maquette")).toBeTruthy();
    expect(screen.getByText("Dessiner les écrans clés.")).toBeTruthy();
    expect(screen.getByText(/post-it maquette/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Créer 3 tâches" })).toBeTruthy();
  });

  it("envoie uniquement les propositions cochées, titres corrigés", async () => {
    const user = userEvent.setup();
    const props = setup();

    await user.click(screen.getByLabelText("Retenir la proposition 2"));
    const title = screen.getByLabelText("Titre de la proposition 1");
    await user.clear(title);
    await user.type(title, "  Maquettes v1  ");
    await user.click(screen.getByRole("button", { name: "Créer 2 tâches" }));

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith([
      {
        title: "Maquettes v1",
        description: "Dessiner les écrans clés.",
        sourceHints: ["post-it maquette"],
      },
      { title: "Contacter la mairie", description: "", sourceHints: [] },
    ]);
  });

  it("n'envoie pas une proposition dont le titre est vidé et désactive la validation à zéro", async () => {
    const user = userEvent.setup();
    setup({ proposals: [PROPOSALS[1]] });

    await user.clear(screen.getByLabelText("Titre de la proposition 1"));

    const button = screen.getByRole("button", {
      name: "Créer 0 tâche",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("affiche l'état vide du Mur", async () => {
    const user = userEvent.setup();
    const props = setup({ phase: "empty", proposals: [] });
    expect(
      screen.getByText(/Le Mur ne contient pas encore assez de texte/),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(props.onRetry).toHaveBeenCalled();
  });

  it("affiche le message d'erreur en français (IA non configurée)", () => {
    setup({
      phase: "error",
      proposals: [],
      errorMessage: "L'assistant IA n'est pas configuré.",
    });
    expect(screen.getByRole("alert").textContent).toBe(
      "L'assistant IA n'est pas configuré.",
    );
  });

  it("affiche l'erreur de création sans perdre la liste", () => {
    setup({ acceptError: "La création a échoué." });
    expect(screen.getByRole("alert").textContent).toBe("La création a échoué.");
    expect(screen.getByDisplayValue("Écrire le brief")).toBeTruthy();
  });

  it("indique l'analyse en cours", () => {
    setup({ phase: "loading", proposals: [] });
    expect(screen.getByText("Analyse du Mur en cours…")).toBeTruthy();
  });
});
