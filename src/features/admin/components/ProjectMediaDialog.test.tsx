// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminProjectMedia, ProjectSummary } from "@/domain";
import { ProjectMediaDialog } from "./ProjectMediaDialog";

const mocks = vi.hoisted(() => ({
  query: {} as Record<string, unknown>,
  mutateAsync: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/api/queries/admin", () => ({
  useAdminProjectMedia: () => mocks.query,
  useAdminRemoveProjectMedia: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  }),
}));

const IMAGE_BASE = {
  url: "https://example.test/x.webp",
};
const MEDIA: AdminProjectMedia = {
  banner: {
    ...IMAGE_BASE,
    id: "00000000-0000-4000-8c0d-000000000001",
    alt: "Un mur rose",
    focal: { x: 50, y: 50 },
  },
  gallery: [
    {
      ...IMAGE_BASE,
      id: "00000000-0000-4000-8c0d-000000000002",
      alt: "Premier jet",
      caption: "Palette",
    },
    {
      ...IMAGE_BASE,
      id: "00000000-0000-4000-8c0d-000000000003",
      alt: "Atelier du samedi",
    },
  ],
};

const PROJECT = {
  id: "00000000-0000-4000-8000-000000000100",
  slug: "fresque",
  title: "Fresque murale",
} as ProjectSummary;

function setQuery(partial: Record<string, unknown>) {
  mocks.query = {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: mocks.refetch,
    ...partial,
  };
}

function setup(onClose = vi.fn()) {
  render(<ProjectMediaDialog project={PROJECT} onClose={onClose} />);
  return { user: userEvent.setup(), onClose };
}

beforeEach(() => {
  mocks.mutateAsync.mockReset();
  mocks.mutateAsync.mockResolvedValue(undefined);
  mocks.refetch.mockReset();
  setQuery({ data: MEDIA });
});
afterEach(cleanup);

describe("ProjectMediaDialog", () => {
  it("liste la banniere puis chaque image avec son texte alternatif, sa legende et le cas decoratif", () => {
    setup();
    const dialog = screen.getByRole("dialog", {
      name: /Médias de « Fresque murale »/,
    });
    const items = within(dialog).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText("Bannière")).toBeTruthy();
    expect(
      within(items[0]).getByText("Texte alternatif : Un mur rose"),
    ).toBeTruthy();
    expect(within(items[1]).getByText("Image 1")).toBeTruthy();
    expect(within(items[1]).getByText("Légende : Palette")).toBeTruthy();
    expect(within(items[2]).getByText("Image 2")).toBeTruthy();
    expect(
      within(items[2]).getByText("Texte alternatif : Atelier du samedi"),
    ).toBeTruthy();
  });

  it("explique que l'action est journalisee", () => {
    setup();
    expect(screen.getByText(/l'action est journalisée/)).toBeTruthy();
  });

  it("affiche un etat vide sans media", () => {
    setQuery({ data: { gallery: [] } });
    setup();
    expect(
      screen.getByText("Ce projet n'a ni bannière ni image de galerie."),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Retirer" })).toBeNull();
  });

  it("affiche une erreur avec relance", async () => {
    setQuery({ isError: true });
    const { user } = setup();
    expect(
      screen.getByText("Les médias n'ont pas pu être chargés."),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Réessayer/ }));
    expect(mocks.refetch).toHaveBeenCalled();
  });

  it("ouvre une image en grand dans la visionneuse, a la bonne position", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Agrandir : Image 1" }),
    );
    expect(screen.getByText("Image 2 sur 3")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Image 2 sur 3")).toBeNull();
    // La popup parente reste ouverte.
    expect(screen.getByRole("dialog", { name: /Médias de/ })).toBeTruthy();
  });

  it("retire un media avec un motif, apres confirmation", async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole("button", { name: "Retirer" })[1]);
    expect(screen.getByText("Retirer « Image 1 » ?")).toBeTruthy();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();

    await user.type(
      screen.getByLabelText("Motif (facultatif)"),
      "  Hors sujet  ",
    );
    await user.click(screen.getByRole("button", { name: "Retirer l'image" }));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      imageId: MEDIA.gallery[0].id,
      reason: "Hors sujet",
    });
    expect(screen.queryByText("Retirer « Image 1 » ?")).toBeNull();
  });

  it("le motif est facultatif : envoye absent s'il est vide", async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole("button", { name: "Retirer" })[0]);
    expect(screen.getByText("Retirer « Bannière » ?")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retirer l'image" }));
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      imageId: MEDIA.banner!.id,
      reason: undefined,
    });
  });

  it("n'efface rien si on annule la confirmation, et repart sans motif ensuite", async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole("button", { name: "Retirer" })[1]);
    await user.type(screen.getByLabelText("Motif (facultatif)"), "brouillon");
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(mocks.mutateAsync).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole("button", { name: "Retirer" })[2]);
    expect(
      (screen.getByLabelText("Motif (facultatif)") as HTMLTextAreaElement)
        .value,
    ).toBe("");
  });

  it("se ferme par Echap", async () => {
    const { user, onClose } = setup();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
