// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { presetTheme } from "@shared/lib/projectThemePresets";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  projectSchema,
  type Project,
  type ProjectCustomization,
} from "@/domain";
import type { TeamMember } from "@/api/memberships";
import { ProjectCustomizePage } from "./ProjectCustomizePage";

const mocks = vi.hoisted(() => ({
  project: undefined as unknown,
  members: [] as unknown[],
  userId: "00000000-0000-4000-8000-000000000200",
  update: vi.fn(),
  updateProject: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/api/queries/projects", () => ({
  useProject: () => ({
    data: mocks.project,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useUpdateProject: () => ({
    mutate: mocks.updateProject,
    isPending: false,
    error: null,
  }),
}));
vi.mock("../components/TagPicker", () => ({
  TagPicker: () => <div data-testid="tag-picker" />,
}));
vi.mock("@/api/queries/memberships", () => ({
  useMembers: () => ({
    data: mocks.members,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@features/auth/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: { id: mocks.userId },
    isAuthenticated: true,
    isLoading: false,
  }),
}));
vi.mock("@/api/queries/customization", () => ({
  useUpdateCustomization: () => ({
    mutate: mocks.update,
    isPending: false,
    error: null,
  }),
  useUploadCustomizationImage: () => ({ mutateAsync: mocks.upload }),
  useDeleteCustomizationImage: () => ({ mutate: mocks.remove }),
}));
vi.mock("../lib/imageCompression", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/imageCompression")>()),
  compressImage: async (file: File) => file,
}));
vi.mock("../components/customize/CustomizePreview", () => ({
  CustomizePreview: ({ draft }: { draft: ProjectCustomization }) => (
    <div data-testid="preview">{draft.theme?.accent ?? "auto"}</div>
  ),
}));

const OWNER_ID = "00000000-0000-4000-8000-000000000200";
const MEMBER_ID = "00000000-0000-4000-8000-000000000300";

function makeProject(customization?: ProjectCustomization): Project {
  return projectSchema.parse({
    id: "00000000-0000-4000-8000-000000000100",
    slug: "projet-test",
    title: "Projet test",
    tagline: "Une accroche",
    tags: ["dessin"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: OWNER_ID,
    customization,
    highfiveCount: 0,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
    lastActivityAt: "2026-09-01T10:00:00.000Z",
  });
}

function member(userId: string, role: TeamMember["role"]): TeamMember {
  return {
    projectId: "00000000-0000-4000-8000-000000000100",
    userId,
    role,
    joinedAt: "2026-09-01T10:00:00.000Z",
    blocked: false,
    user: {
      id: userId,
      username: "alex",
      avatar: "https://example.test/a.png",
    },
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/projets/projet-test/modifier"]}>
      <Routes>
        <Route path="/projets/:slug" element={<p>FICHE</p>} />
        <Route
          path="/projets/:slug/modifier"
          element={<ProjectCustomizePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.project = makeProject();
  mocks.members = [member(OWNER_ID, "owner"), member(MEMBER_ID, "member")];
  mocks.userId = OWNER_ID;
  mocks.update.mockReset();
  mocks.updateProject.mockReset();
  mocks.upload.mockReset();
  mocks.remove.mockReset();
  mocks.upload.mockResolvedValue({
    id: "00000000-0000-4000-8c0d-000000000009",
    url: "https://example.test/new.webp",
  });
});
afterEach(cleanup);

async function openTab(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("tab", { name }));
}

const png = new File([new Uint8Array(8)], "b.png", { type: "image/png" });

describe("ProjectCustomizePage", () => {
  it("refuse l'acces a un simple membre", () => {
    mocks.userId = MEMBER_ID;
    renderPage();
    expect(
      screen.getByText(
        "Seuls le porteur et les co-porteurs peuvent modifier la fiche",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Enregistrer" })).toBeNull();
  });

  it("ne propose au co-porteur que l'onglet Infos", () => {
    mocks.members = [member(OWNER_ID, "owner"), member(MEMBER_ID, "co_owner")];
    mocks.userId = MEMBER_ID;
    renderPage();
    expect(screen.getByLabelText(/Titre/)).toBeTruthy();
    // Seuls les onglets d'affichage (Edition / Apercu) restent.
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.queryByRole("tab", { name: "Couleurs" })).toBeNull();
  });

  it("affiche l'editeur au porteur, avec l'apercu et aucune modification", () => {
    renderPage();
    expect(screen.getByText("Modifier la fiche")).toBeTruthy();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Édition",
      "Aperçu",
      "Infos",
      "Images",
      "Sections",
      "Couleurs",
    ]);
    expect(screen.getByTestId("preview").textContent).toBe("auto");
    expect(screen.queryByText("Modifications non enregistrées")).toBeNull();
  });

  it("Annuler sans modification retourne directement a la fiche", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("FICHE")).toBeTruthy();
  });

  it("met a jour l'apercu et signale les modifications non enregistrees", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Bonbon" }));
    expect(screen.getByTestId("preview").textContent).toBe(
      presetTheme("bonbon").accent,
    );
    expect(screen.getByText("Modifications non enregistrées")).toBeTruthy();
  });

  it("demande confirmation avant de quitter avec des modifications", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Bonbon" }));

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Quitter sans enregistrer ?")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Continuer à modifier" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("FICHE")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    await user.click(
      screen.getByRole("button", { name: "Quitter sans enregistrer" }),
    );
    expect(screen.getByText("FICHE")).toBeTruthy();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("garde aussi le lien de retour quand il y a des modifications", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Bonbon" }));
    await user.click(screen.getByRole("link", { name: /Projet test/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.queryByText("FICHE")).toBeNull();
  });

  it("refuse d'enregistrer une image sans texte alternatif, nomme l'image et y emmene, puis enregistre une fois complete", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await openTab(user, "Images");
    await user.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      png,
    );

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(mocks.update).not.toHaveBeenCalled();

    // Le resume nomme l'image fautive...
    const summary = screen
      .getAllByRole("alert")
      .find((el) => /il manque un texte alternatif/.test(el.textContent ?? ""));
    expect(summary).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bannière" })).toBeTruthy();
    // ... et le champ a corriger a deja le focus.
    const field = screen.getByLabelText(/Texte alternatif/);
    expect(document.activeElement).toBe(field);

    await user.type(field, "Un mur peint");
    expect(
      screen
        .queryAllByRole("alert")
        .some((el) =>
          /il manque un texte alternatif/.test(el.textContent ?? ""),
        ),
    ).toBe(false);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(mocks.update).toHaveBeenCalledTimes(1);
    const draft = mocks.update.mock.calls[0][0] as ProjectCustomization;
    expect(draft.banner?.alt).toBe("Un mur peint");
    expect(draft.banner?.id).toBe("00000000-0000-4000-8c0d-000000000009");
  });

  it("amene au champ de l'image choisie dans le resume, galerie comprise", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await openTab(user, "Images");
    const inputs = container.querySelectorAll("input[type=file]");
    // 1er : banniere, 2e : galerie.
    await user.upload(inputs[0] as HTMLInputElement, png);
    await user.upload(inputs[1] as HTMLInputElement, png);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(screen.getByRole("button", { name: "Bannière" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Image 1" }));
    const focused = document.activeElement as HTMLElement;
    expect(focused.id).toMatch(/^customize-alt-/);
    expect(focused.id).not.toBe("customize-alt-banner");
  });

  it("envoie le brouillon complet puis retourne a la fiche apres l'enregistrement", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Océan" }));
    await openTab(user, "Sections");
    await user.click(
      screen.getByRole("button", { name: "Descendre « Annonce épinglée »" }),
    );
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(mocks.update).toHaveBeenCalledTimes(1);
    const [draft, options] = mocks.update.mock.calls[0] as [
      ProjectCustomization,
      { onSuccess: () => void },
    ];
    expect(draft.theme).toEqual(presetTheme("ocean"));
    expect(draft.sections.map((s) => s.id)).toEqual([
      "needs",
      "pinned",
      "about",
      "gallery",
      "comments",
    ]);
    await act(async () => options.onSuccess());
    expect(screen.getByText("FICHE")).toBeTruthy();
  });

  it("enregistre les infos puis retourne a la fiche, sans toucher a la personnalisation", async () => {
    const user = userEvent.setup();
    renderPage();
    const title = screen.getByLabelText(/Titre/);
    await user.clear(title);
    await user.type(title, "  Nouveau titre  ");
    expect(screen.getByText("Modifications non enregistrées")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(mocks.updateProject).toHaveBeenCalledTimes(1);
    const [input, options] = mocks.updateProject.mock.calls[0] as [
      { title: string; tagline: string },
      { onSuccess: () => void },
    ];
    expect(input.title).toBe("Nouveau titre");
    expect(input.tagline).toBe("Une accroche");
    await act(async () => options.onSuccess());
    expect(mocks.update).not.toHaveBeenCalled();
    expect(screen.getByText("FICHE")).toBeTruthy();
  });

  it("refuse d'enregistrer des infos invalides et amene au champ", async () => {
    const user = userEvent.setup();
    renderPage();
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Bonbon" }));
    await openTab(user, "Infos");
    await user.clear(screen.getByLabelText(/Titre/));
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(mocks.updateProject).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(
      screen.getByText("Le titre doit faire au moins 3 caractères."),
    ).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/Titre/));
  });

  it("enregistre les infos avant la personnalisation quand les deux changent", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/Titre/), " 2");
    await openTab(user, "Couleurs");
    await user.click(screen.getByRole("button", { name: "Bonbon" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(mocks.updateProject).toHaveBeenCalledTimes(1);
    expect(mocks.update).not.toHaveBeenCalled();
    const [, options] = mocks.updateProject.mock.calls[0] as [
      unknown,
      { onSuccess: () => void },
    ];
    await act(async () => options.onSuccess());
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it("nettoie sur le serveur les images televersees puis abandonnees", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await openTab(user, "Images");
    await user.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      png,
    );
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    await user.click(
      screen.getByRole("button", { name: "Quitter sans enregistrer" }),
    );
    expect(mocks.remove).toHaveBeenCalledWith(
      "00000000-0000-4000-8c0d-000000000009",
    );
  });

  it("retirer une image juste televersee la supprime sur le serveur", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await openTab(user, "Images");
    await user.upload(
      container.querySelector("input[type=file]") as HTMLInputElement,
      png,
    );
    await user.click(
      screen.getByRole("button", { name: "Retirer la bannière" }),
    );
    expect(mocks.remove).toHaveBeenCalledWith(
      "00000000-0000-4000-8c0d-000000000009",
    );
  });
});
