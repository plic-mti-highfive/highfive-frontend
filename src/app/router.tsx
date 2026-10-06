import { lazy, Suspense, useDeferredValue } from "react";
import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { Spinner } from "@shared/ui";
import { AdminRoute, ProtectedRoute } from "./guards";
import { LabLayout, SiteLayout } from "./layouts";
import { NavigationPendingProvider } from "./navigation-pending";
import {
  preloadCreateProject,
  preloadCustomizeProject,
  preloadHome,
  preloadMessages,
  preloadNotifications,
  preloadProjectDetail,
  preloadProjectFiche,
  preloadSearch,
  preloadUserProfile,
} from "./preload";

/**
 * Routeur applicatif (V2 item 1, socle "socle applicatif v2"). Routes FR de
 * la convention V2-9 (docs/v2/CONVENTIONS.md) / doc 06. Chaque page est
 * chargee en lazy (`React.lazy`) et suspendue derriere un `Spinner`.
 */

// --- Pages, chargees en lazy -------------------------------------------------
// Les pages "principales" (Decouvrir, recherche, fiche projet, profil,
// messages, creation, notifications) partagent leur fonction d'import avec
// `src/app/preload.ts` (V2, retour util. 5) : un seul `import()` par page,
// que ce soit pour le lazy() ci-dessous ou pour un prechargement au
// survol/focus d'un lien ailleurs dans l'app.

const HomePage = lazy(preloadHome);
const LoginPage = lazy(() => import("@features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@features/auth/pages/RegisterPage"));
const SearchPage = lazy(() =>
  preloadSearch().then((m) => ({ default: m.SearchPage })),
);
const UserProfilePage = lazy(preloadUserProfile);
const CreateProjectPage = lazy(preloadCreateProject);
const ProjectCustomizePage = lazy(() =>
  preloadCustomizeProject().then((m) => ({ default: m.ProjectCustomizePage })),
);
const ProjectLayout = lazy(() =>
  preloadProjectFiche().then((m) => ({ default: m.ProjectLayout })),
);
const ProjectDetailPage = lazy(() =>
  preloadProjectDetail().then((m) => ({ default: m.ProjectDetailPage })),
);
const ProjectNewsPage = lazy(() =>
  import("@features/projects/pages/ProjectNewsPage").then((m) => ({
    default: m.ProjectNewsPage,
  })),
);
const ProjectTeamPage = lazy(() =>
  import("@features/projects/pages/ProjectTeamPage").then((m) => ({
    default: m.ProjectTeamPage,
  })),
);
const LabTasksPage = lazy(() => import("@features/lab/pages/TasksPage"));
const LabWallPage = lazy(() => import("@features/lab/pages/WallPage"));

const MessagesPage = lazy(() =>
  preloadMessages().then((m) => ({ default: m.MessagesPage })),
);
const NotificationsPage = lazy(() =>
  preloadNotifications().then((m) => ({ default: m.NotificationsPage })),
);
const AdminDashboardPage = lazy(() =>
  import("@features/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Reserve aux routes qui ne partagent pas la coquille site (auth, atelier) :
 * `SiteLayout` porte desormais son propre `<Suspense>` unique autour de son
 * `<Outlet/>` (voir SiteLayout.tsx) pour que la navigation entre pages
 * principales puisse garder l'ancien contenu affiche pendant le chargement
 * du nouveau chunk (V2, retour util. 5 — voir `useDeferredValue` ci-dessous)
 * au lieu de retomber sur ce fallback a chaque clic.
 */
function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

/** Redirection d'une ancienne route vers la nouvelle, en conservant la query string. */
function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

/** Anciens /search/users, /search/tags : le type de resultat devient un parametre. */
function LegacySearchTypeRedirect({ type }: { type: string }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set("type", type);
  return <Navigate to={`/recherche?${params.toString()}`} replace />;
}

/**
 * /tags/:tag (doc 06) : SearchPage ne route pas encore par tag dedie (filtre
 * en query). Parametre `tags` (pluriel) pour matcher R-R4 et le contrat de
 * `SearchPage`/`useSearch` (`SearchParams.tags: string[]`), pas `tag`
 * (singulier) qu'aucune page ne lit.
 */
function TagRedirect() {
  const { tag } = useParams<{ tag: string }>();
  return (
    <Navigate
      to={`/recherche?type=projets&tags=${encodeURIComponent(tag ?? "")}`}
      replace
    />
  );
}

export function AppRouter() {
  // V2, retour util. 5 : "plus de page blanche avec spinner central seul".
  // `<Routes>` est rendu sur `deferredLocation`, qui reste sur l'URL
  // precedente tant que React n'a pas fini de "rattraper" `location` en
  // arriere-plan. Quand cette mise a jour differee suspend (chunk lazy pas
  // encore charge sous `SiteLayout`), React garde la derniere UI commitee
  // au lieu d'afficher le fallback Suspense de `SiteLayout` : l'ancienne
  // page (en-tete, contenu) reste visible jusqu'a ce que le nouveau chunk
  // soit pret. `location !== deferredLocation` (comparaison de reference,
  // stable tant que l'URL ne change pas) pilote la barre de progression
  // (`NavigationProgress`, exposee via `NavigationPendingProvider`).
  const location = useLocation();
  const deferredLocation = useDeferredValue(location);

  return (
    <NavigationPendingProvider value={location !== deferredLocation}>
      <Routes location={deferredLocation}>
        {/* Connexion/inscription : coquille propre (DESIGN.md "Layout"), pas
            de SiteLayout — AuthLayout gere son propre plein ecran. */}
        <Route path="/connexion" element={withSuspense(<LoginPage />)} />
        <Route path="/inscription" element={withSuspense(<RegisterPage />)} />

        {/* Coquille site (doc 06 §3). Pages "principales" non suspendues
            individuellement : `SiteLayout` porte un unique `<Suspense>`
            autour de son `<Outlet/>`, partage par toutes ces routes — voir
            le commentaire `useDeferredValue` ci-dessus. */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recherche" element={<SearchPage />} />
          <Route path="/tags/:tag" element={<TagRedirect />} />
          <Route path="/u/:pseudo" element={<UserProfilePage />} />
          <Route
            path="/projets/nouveau"
            element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />
          {/* Fiche projet (doc 13 E-10/E-11/E-12) : coquille commune
              (en-tete + onglets, `ProjectLayout`) partagee par les trois
              onglets-routes, chacun rendu dans son `<Outlet/>` — ceux-ci
              restent suspendus individuellement (onglets secondaires, pas
              dans la liste des "pages principales" a precharger). */}
          <Route path="/projets/:slug" element={<ProjectLayout />}>
            <Route index element={withSuspense(<ProjectDetailPage />)} />
            <Route
              path="annonces"
              element={withSuspense(<ProjectNewsPage />)}
            />
            <Route path="equipe" element={withSuspense(<ProjectTeamPage />)} />
          </Route>
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>{withSuspense(<AdminDashboardPage />)}</AdminRoute>
            }
          />
        </Route>

        {/* Editeur de personnalisation de la fiche : coquille propre (hauteur
            d'ecran fixe, formulaire + apercu live), hors `SiteLayout`. La
            reserve au porteur est verifiee par la page elle-meme. */}
        <Route
          path="/projets/:slug/personnaliser"
          element={
            <ProtectedRoute>
              {withSuspense(<ProjectCustomizePage />)}
            </ProtectedRoute>
          }
        />

        {/* Coquille atelier — Le Lab (doc 06 §4) */}
        <Route path="/projets/:slug/lab" element={<LabLayout />}>
          {/* Tableau blanc (V2-10, fusion des deux anciens espaces de travail sur
              tldraw) est l'entrée par défaut de l'atelier. */}
          <Route index element={<Navigate to="mur" replace />} />
          <Route path="mur" element={withSuspense(<LabWallPage />)} />
          <Route path="taches" element={withSuspense(<LabTasksPage />)} />
        </Route>

        {/* Redirections des anciennes routes (id -> slug/pseudo impossible
            sans donnee supplementaire : direction l'accueil plutot qu'une
            404). */}
        <Route path="/login" element={<LegacyRedirect to="/connexion" />} />
        <Route
          path="/register"
          element={<LegacyRedirect to="/inscription" />}
        />
        <Route path="/search" element={<LegacyRedirect to="/recherche" />} />
        <Route
          path="/search/projects"
          element={<LegacyRedirect to="/recherche" />}
        />
        <Route
          path="/search/users"
          element={<LegacySearchTypeRedirect type="personnes" />}
        />
        <Route
          path="/search/tags"
          element={<LegacySearchTypeRedirect type="tags" />}
        />
        <Route
          path="/create-project"
          element={<Navigate to="/projets/nouveau" replace />}
        />
        <Route path="/projects/:id/*" element={<Navigate to="/" replace />} />
        <Route path="/user/:id" element={<Navigate to="/" replace />} />

        {/* /debug (src/pages/Debug.tsx) supprime : tombe sur la 404. */}
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Routes>
    </NavigationPendingProvider>
  );
}
