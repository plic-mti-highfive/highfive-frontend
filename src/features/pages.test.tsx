// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiUrl } from "@/mocks/handlers/utils";
import { getDb } from "@/mocks/db";
import { loginAs, server, setupMswServer } from "@/test/msw";
import { renderRoutes } from "@/test/render";
import { NotificationsPage } from "./notifications";
import { SearchPage } from "./search/pages/SearchPage";
import UserProfilePage from "./user/pages/UserProfilePage";

setupMswServer();

describe("NotificationsPage", () => {
  it("liste les notifications et 'Tout marquer comme lu' vide les non-lues", async () => {
    await loginAs("alex.rivera@example.com");
    const user = userEvent.setup();
    renderRoutes({ "/notifications": <NotificationsPage /> }, "/notifications");

    const button = await screen.findByRole("button", {
      name: /Tout marquer comme lu/,
    });
    const alex = getDb().users.findOne(
      (u) => u.email === "alex.rivera@example.com",
    )!;
    const unread = () =>
      getDb().notifications.find((n) => n.recipientId === alex.id && !n.read)
        .length;
    expect(unread()).toBeGreaterThan(0);

    await user.click(button);
    await waitFor(() => expect(unread()).toBe(0));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /Tout marquer comme lu/ }),
      ).toBeNull(),
    );
  });

  it("erreur serveur : affiche le message de l'API", async () => {
    await loginAs("alex.rivera@example.com");
    server.use(
      http.get(apiUrl("/notifications"), () =>
        HttpResponse.json(
          { code: "internal", message: "Notifications indisponibles." },
          { status: 500 },
        ),
      ),
    );
    renderRoutes({ "/notifications": <NotificationsPage /> }, "/notifications");
    expect(
      await screen.findByText("Notifications indisponibles."),
    ).toBeTruthy();
  });
});

describe("SearchPage", () => {
  it("sans requete : titre 'Recherche' et aucun appel de recherche", async () => {
    let called = false;
    server.use(
      http.get(apiUrl("/search"), () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    renderRoutes({ "/recherche": <SearchPage /> }, "/recherche");
    expect(
      await screen.findByRole("heading", { name: "Recherche" }),
    ).toBeTruthy();
    expect(called).toBe(false);
  });

  it("requete inconnue : etat vide 'Aucun projet trouve'", async () => {
    renderRoutes(
      { "/recherche": <SearchPage /> },
      "/recherche?q=zzzzintrouvablezzzz",
    );
    expect(await screen.findByText("Aucun projet trouvé")).toBeTruthy();
  });

  it("requete connue : affiche le titre du projet trouve", async () => {
    renderRoutes({ "/recherche": <SearchPage /> }, "/recherche?q=fresque");
    expect((await screen.findAllByText(/fresque/i)).length).toBeGreaterThan(1);
  });
});

describe("UserProfilePage", () => {
  it("affiche le profil d'une personne existante", async () => {
    renderRoutes({ "/u/:pseudo": <UserProfilePage /> }, "/u/camille.petit");
    expect(
      (await screen.findAllByText(/Camille Petit/)).length,
    ).toBeGreaterThan(0);
  });

  it("pseudo inconnu : etat 'Profil introuvable'", async () => {
    renderRoutes({ "/u/:pseudo": <UserProfilePage /> }, "/u/personne.inconnue");
    expect(await screen.findByText("Profil introuvable")).toBeTruthy();
  });

  it("erreur serveur : message de chargement en echec", async () => {
    server.use(
      http.get(apiUrl("/users/:username"), () =>
        HttpResponse.json({ code: "x", message: "Panne." }, { status: 500 }),
      ),
    );
    renderRoutes({ "/u/:pseudo": <UserProfilePage /> }, "/u/camille.petit");
    expect(
      await screen.findByText("Ce profil n'a pas pu être chargé."),
    ).toBeTruthy();
  });
});
