// @vitest-environment jsdom
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { AdminRoute, ProtectedRoute } from "@/app/guards";
import { tokenStorage } from "@/api/token-storage";
import { apiUrl } from "@/mocks/handlers/utils";
import { server, setupMswServer } from "@/test/msw";
import { renderRoutes } from "@/test/render";
import { useAuth } from "@shared/contexts";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

setupMswServer();

const ALEX = { email: "alex.rivera@example.com", password: "demo1234" };
const ANNICK = { email: "annick.r@example.com", password: "demo1234" };

async function loginViaApi(credentials: { email: string; password: string }) {
  const response = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const session = (await response.json()) as { token: string };
  tokenStorage.setAccessToken(session.token);
}

async function alertText() {
  return (await screen.findByRole("alert")).textContent ?? "";
}

function location() {
  return screen.getByTestId("location").textContent;
}

describe("LoginPage", () => {
  const routes = {
    "/connexion": <LoginPage />,
    "/": <p>Accueil</p>,
    "/projets/x": <p>Page demandee</p>,
  };

  it("connexion reussie : stocke le jeton et redirige vers l'accueil", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/connexion");
    await user.type(screen.getByLabelText("Adresse e-mail"), ALEX.email);
    await user.type(screen.getByLabelText(/Mot de passe/), ALEX.password);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await screen.findByText("Accueil");
    expect(tokenStorage.getAccessToken()).toBeTruthy();
  });

  it("connexion reussie avec ?suite= : revient sur la route demandee", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/connexion?suite=%2Fprojets%2Fx");
    await user.type(screen.getByLabelText("Adresse e-mail"), ALEX.email);
    await user.type(screen.getByLabelText(/Mot de passe/), ALEX.password);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await screen.findByText("Page demandee");
  });

  it("?suite= externe est ignore (pas de redirection ouverte)", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/connexion?suite=https%3A%2F%2Fevil.example");
    await user.type(screen.getByLabelText("Adresse e-mail"), ALEX.email);
    await user.type(screen.getByLabelText(/Mot de passe/), ALEX.password);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await screen.findByText("Accueil");
  });

  it("mauvais mot de passe : affiche le message d'erreur francais, reste sur la page, pas de jeton", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/connexion");
    await user.type(screen.getByLabelText("Adresse e-mail"), ALEX.email);
    await user.type(screen.getByLabelText(/Mot de passe/), "faux-mot-de-passe");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await alertText()).toContain("Connecte-toi pour continuer.");
    expect(location()).toBe("/connexion");
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("adresse mal formee : message de validation sans appel reseau", async () => {
    const user = userEvent.setup();
    let called = false;
    server.use(
      http.post(apiUrl("/auth/login"), () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    renderRoutes(routes, "/connexion");
    await user.type(screen.getByLabelText("Adresse e-mail"), "pas-un-mail");
    await user.type(screen.getByLabelText(/Mot de passe/), "abcdefgh");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await alertText()).toContain("Cette adresse n'a pas le bon format.");
    expect(called).toBe(false);
  });

  it("erreur serveur 500 : affiche le message de l'API", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(apiUrl("/auth/login"), () =>
        HttpResponse.json(
          { code: "internal", message: "Le serveur est indisponible." },
          { status: 500 },
        ),
      ),
    );
    renderRoutes(routes, "/connexion");
    await user.type(screen.getByLabelText("Adresse e-mail"), ALEX.email);
    await user.type(screen.getByLabelText(/Mot de passe/), ALEX.password);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await alertText()).toContain("Le serveur est indisponible.");
  });
});

describe("RegisterPage", () => {
  const routes = { "/inscription": <RegisterPage />, "/": <p>Accueil</p> };

  async function fill(
    user: ReturnType<typeof userEvent.setup>,
    values: {
      username: string;
      email: string;
      password: string;
      confirm: string;
    },
  ) {
    await user.type(screen.getByLabelText("Pseudo"), values.username);
    await user.type(screen.getByLabelText("Adresse e-mail"), values.email);
    await user.type(screen.getByLabelText("Mot de passe"), values.password);
    await user.type(
      screen.getByLabelText(/Confirmer le mot de passe/),
      values.confirm,
    );
    await user.click(screen.getByRole("button", { name: /Créer|Inscription/ }));
  }

  it("inscription valide : cree le compte, stocke le jeton, redirige", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/inscription");
    await fill(user, {
      username: "nouvelle.personne",
      email: "nouvelle@example.com",
      password: "motdepasse1",
      confirm: "motdepasse1",
    });
    await screen.findByText("Accueil");
    expect(tokenStorage.getAccessToken()).toBeTruthy();
  });

  it.each([
    [
      "pseudo invalide",
      {
        username: "A",
        email: "a@b.fr",
        password: "motdepasse1",
        confirm: "motdepasse1",
      },
      "3 à 24 caractères, lettres minuscules, chiffres, . _ -",
    ],
    [
      "e-mail invalide",
      {
        username: "abc",
        email: "abc",
        password: "motdepasse1",
        confirm: "motdepasse1",
      },
      "Cette adresse n'a pas le bon format.",
    ],
    [
      "mot de passe trop court",
      { username: "abc", email: "a@b.fr", password: "court", confirm: "court" },
      "8 caractères minimum.",
    ],
    [
      "confirmation differente",
      {
        username: "abc",
        email: "a@b.fr",
        password: "motdepasse1",
        confirm: "motdepasse2",
      },
      "Les mots de passe ne correspondent pas.",
    ],
  ])("%s : affiche l'erreur et ne cree rien", async (_nom, values, message) => {
    const user = userEvent.setup();
    renderRoutes(routes, "/inscription");
    await fill(user, values);
    expect(await alertText()).toContain(message);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("adresse deja utilisee : affiche le message de l'API", async () => {
    const user = userEvent.setup();
    renderRoutes(routes, "/inscription");
    await fill(user, {
      username: "autre.pseudo",
      email: ALEX.email,
      password: "motdepasse1",
      confirm: "motdepasse1",
    });
    expect(await alertText()).toContain("La demande n'est pas valide.");
  });
});

function Whoami() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  return (
    <div>
      <p>
        {isLoading
          ? "chargement"
          : isAuthenticated
            ? `connecte:${user?.username}`
            : "anonyme"}
      </p>
      <button onClick={() => void logout()}>Quitter</button>
    </div>
  );
}

describe("useAuth — session", () => {
  it("sans jeton : anonyme, aucun appel /me", async () => {
    let called = false;
    server.use(
      http.get(apiUrl("/me"), () => {
        called = true;
        return HttpResponse.json({});
      }),
    );
    renderRoutes({ "/": <Whoami /> }, "/");
    expect(screen.getByText("anonyme")).toBeTruthy();
    expect(called).toBe(false);
  });

  it("restaure la session depuis le jeton stocke", async () => {
    await loginViaApi(ALEX);
    renderRoutes({ "/": <Whoami /> }, "/");
    expect(await screen.findByText("connecte:alex.rivera")).toBeTruthy();
  });

  it("jeton perime (401 sur /me) : jeton efface, visiteur anonyme", async () => {
    tokenStorage.setAccessToken("jeton-perime");
    renderRoutes({ "/": <Whoami /> }, "/");
    expect(await screen.findByText("anonyme")).toBeTruthy();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("deconnexion : efface le jeton et repasse en anonyme", async () => {
    const user = userEvent.setup();
    await loginViaApi(ALEX);
    renderRoutes({ "/": <Whoami /> }, "/");
    await screen.findByText("connecte:alex.rivera");
    await user.click(screen.getByRole("button", { name: "Quitter" }));
    await waitFor(() => expect(tokenStorage.getAccessToken()).toBeNull());
    expect(await screen.findByText("anonyme")).toBeTruthy();
  });
});

describe("gardes de routes", () => {
  const routes = {
    "/connexion": <p>Page de connexion</p>,
    "/": <p>Accueil</p>,
    "/mes-projets": (
      <ProtectedRoute>
        <p>Contenu protege</p>
      </ProtectedRoute>
    ),
    "/admin": (
      <AdminRoute>
        <p>Contenu admin</p>
      </AdminRoute>
    ),
  };

  it("ProtectedRoute : un visiteur est renvoye vers /connexion?suite=<route>", async () => {
    renderRoutes(routes, "/mes-projets?onglet=2");
    await screen.findByText("Page de connexion");
    expect(location()).toBe(
      `/connexion?suite=${encodeURIComponent("/mes-projets?onglet=2")}`,
    );
  });

  it("ProtectedRoute : une personne connectee voit le contenu", async () => {
    await loginViaApi(ALEX);
    renderRoutes(routes, "/mes-projets");
    expect(await screen.findByText("Contenu protege")).toBeTruthy();
  });

  it("AdminRoute : un visiteur est renvoye vers la connexion", async () => {
    renderRoutes(routes, "/admin");
    await screen.findByText("Page de connexion");
    expect(location()).toContain("/connexion?suite=%2Fadmin");
  });

  it("AdminRoute : un membre est renvoye sur l'accueil", async () => {
    await loginViaApi(ALEX);
    renderRoutes(routes, "/admin");
    await screen.findByText("Accueil");
    expect(screen.queryByText("Contenu admin")).toBeNull();
  });

  it("AdminRoute : un admin accede a la page", async () => {
    await loginViaApi(ANNICK);
    renderRoutes(routes, "/admin");
    expect(await screen.findByText("Contenu admin")).toBeTruthy();
  });
});
