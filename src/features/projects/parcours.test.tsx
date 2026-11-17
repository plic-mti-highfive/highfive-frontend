// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LabLayout } from "@/app/layouts/LabLayout";
import { getDb } from "@/mocks/db";
import { loginAs, setupMswServer } from "@/test/msw";
import { LocationProbe, renderWithProviders } from "@/test/render";
import TasksPage from "@features/lab/pages/TasksPage";
import { JoinAction } from "./components/JoinAction";
import { ProjectLayout } from "./components/ProjectLayout";
import { ProjectTeamPage } from "./pages/ProjectTeamPage";

setupMswServer();

const FRESQUE = "fresque-murale-collaborative";
const JARDIN = "jardin-partage-derriere-lecole";
const OPEN = "distribution-de-soupe-lhiver";

function joinAction(
  props: Partial<Parameters<typeof JoinAction>[0]> & { slug: string },
) {
  return renderWithProviders(
    <>
      <LocationProbe />
      <JoinAction
        projectTitle="Mon projet"
        participation="on_request"
        isAuthenticated
        isMember={false}
        {...props}
      />
    </>,
  );
}

describe("candidater a un projet (JoinAction)", () => {
  it("visiteur : propose de se connecter et redirige avec ?suite=", async () => {
    const user = userEvent.setup();
    joinAction({ slug: JARDIN, isAuthenticated: false });
    await user.click(
      screen.getByRole("button", { name: /Se connecter pour rejoindre/ }),
    );
    expect(screen.getByTestId("location").textContent).toBe(
      `/connexion?suite=${encodeURIComponent(`/projets/${JARDIN}`)}`,
    );
  });

  it("membre : bouton 'Aller au Lab'", async () => {
    const user = userEvent.setup();
    joinAction({ slug: JARDIN, isMember: true });
    await user.click(screen.getByRole("button", { name: /Aller au Lab/ }));
    expect(screen.getByTestId("location").textContent).toBe(
      `/projets/${JARDIN}/lab`,
    );
  });

  it("projet sur invitation : bouton desactive", () => {
    joinAction({ slug: JARDIN, participation: "on_invite" });
    const button = screen.getByRole("button", { name: "Sur invitation" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("projet sur demande : envoie le message, passe a 'Demande envoyee'", async () => {
    await loginAs("yanis.f@example.com");
    const user = userEvent.setup();
    joinAction({ slug: JARDIN });
    await user.click(
      screen.getByRole("button", { name: "Demander à rejoindre" }),
    );
    await user.type(
      await screen.findByPlaceholderText(/Pourquoi tu veux rejoindre/),
      "Je sais jardiner.",
    );
    await user.click(
      screen.getByRole("button", { name: "Envoyer la demande" }),
    );

    const sent = await screen.findByRole("button", { name: "Demande envoyée" });
    expect((sent as HTMLButtonElement).disabled).toBe(true);
    const stored = getDb().joinRequests.find(
      (r) => r.message === "Je sais jardiner.",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].status).toBe("pending");
  });

  it("projet ouvert : 'Rejoindre le projet' cree directement l'appartenance", async () => {
    await loginAs("yanis.f@example.com");
    const user = userEvent.setup();
    joinAction({ slug: OPEN, participation: "open" });
    await user.click(
      screen.getByRole("button", { name: "Rejoindre le projet" }),
    );
    await screen.findByRole("button", { name: "Demande envoyée" });
    const yanis = getDb().users.findOne(
      (u) => u.email === "yanis.f@example.com",
    )!;
    expect(
      getDb().memberships.find(
        (m) => m.userId === yanis.id && m.role === "member",
      ).length,
    ).toBeGreaterThan(0);
  });
});

function teamRoutes() {
  return (
    <>
      <LocationProbe />
      <Routes>
        <Route path="/projets/:slug" element={<ProjectLayout />}>
          <Route path="equipe" element={<ProjectTeamPage />} />
        </Route>
      </Routes>
    </>
  );
}

describe("onglet Equipe : accepter / refuser un membre", () => {
  it("le porteur accepte une demande : elle disparait et le membre rejoint l'equipe", async () => {
    await loginAs("alex.rivera@example.com");
    const user = userEvent.setup();
    renderWithProviders(teamRoutes(), { route: `/projets/${FRESQUE}/equipe` });

    const demandes = await screen.findByText(/^Demandes · 1$/);
    expect(demandes).toBeTruthy();
    await user.click(await screen.findByRole("button", { name: "Accepter" }));

    await waitFor(() =>
      expect(screen.getByText("Aucune demande en attente.")).toBeTruthy(),
    );
    const yanis = getDb().users.findOne(
      (u) => u.email === "yanis.f@example.com",
    )!;
    expect(
      getDb()
        .memberships.find((m) => m.userId === yanis.id)
        .some((m) => m.role === "member"),
    ).toBe(true);
  });

  it("le porteur refuse une demande : aucun membre ajoute", async () => {
    await loginAs("alex.rivera@example.com");
    const user = userEvent.setup();
    renderWithProviders(teamRoutes(), { route: `/projets/${FRESQUE}/equipe` });
    await screen.findByText(/^Demandes · 1$/);
    const membersBefore = getDb().memberships.find(
      (m) =>
        m.projectId === getDb().projects.findOne((p) => p.slug === FRESQUE)!.id,
    ).length;
    await user.click(await screen.findByRole("button", { name: /Refuser/ }));
    await waitFor(() =>
      expect(screen.getByText("Aucune demande en attente.")).toBeTruthy(),
    );
    const membersAfter = getDb().memberships.find(
      (m) =>
        m.projectId === getDb().projects.findOne((p) => p.slug === FRESQUE)!.id,
    ).length;
    expect(membersAfter).toBe(membersBefore);
  });

  it("un simple membre ne voit pas la file des demandes", async () => {
    await loginAs("enzo.b@example.com");
    renderWithProviders(teamRoutes(), { route: `/projets/${FRESQUE}/equipe` });
    await screen.findByText(/^Équipe · /);
    expect(screen.queryByText(/^Demandes/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Accepter" })).toBeNull();
  });
});

describe("Etapes du Lab : creer / editer une tache", () => {
  function labRoutes() {
    return (
      <Routes>
        <Route path="/projets/:slug/lab" element={<LabLayout />}>
          <Route path="etapes" element={<TasksPage />} />
        </Route>
      </Routes>
    );
  }

  it("un membre ajoute une etape dans une colonne", async () => {
    await loginAs("alex.rivera@example.com");
    const user = userEvent.setup();
    renderWithProviders(labRoutes(), {
      route: `/projets/${FRESQUE}/lab/etapes`,
    });

    const columns = await screen.findAllByRole("region");
    const column = columns[0];
    await user.click(
      within(column).getByRole("button", { name: "Ajouter une étape" }),
    );
    await user.type(
      within(column).getByPlaceholderText("Titre de l'étape…"),
      "Nettoyer le mur",
    );
    await user.click(within(column).getByRole("button", { name: "Ajouter" }));

    expect(await screen.findByText("Nettoyer le mur")).toBeTruthy();
    expect(
      getDb().tasks.find((t) => t.title === "Nettoyer le mur"),
    ).toHaveLength(1);
  });

  it("le bouton Ajouter reste desactive tant que le titre est vide", async () => {
    await loginAs("alex.rivera@example.com");
    const user = userEvent.setup();
    renderWithProviders(labRoutes(), {
      route: `/projets/${FRESQUE}/lab/etapes`,
    });
    const column = (await screen.findAllByRole("region"))[0];
    await user.click(
      within(column).getByRole("button", { name: "Ajouter une étape" }),
    );
    const add = within(column).getByRole("button", { name: "Ajouter" });
    expect((add as HTMLButtonElement).disabled).toBe(true);
  });

  it("un non-membre n'a pas acces a l'atelier", async () => {
    await loginAs("yanis.f@example.com");
    renderWithProviders(labRoutes(), {
      route: `/projets/${FRESQUE}/lab/etapes`,
    });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Ajouter une étape" }),
      ).toBeNull(),
    );
    expect(screen.queryByRole("navigation", { name: "Le Lab" })).toBeNull();
  });
});
