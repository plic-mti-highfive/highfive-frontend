import { lazy, Suspense } from "react";
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

/**
 * Routeur applicatif (V2 item 1, socle "socle applicatif v2"). Routes FR de
 * la convention V2-9 (docs/v2/CONVENTIONS.md) / doc 06. Chaque page est
 * chargee en lazy (`React.lazy`) et suspendue derriere un `Spinner`.
 */

// --- Pages, chargees en lazy ------------------------------------------------

const HomePage = lazy(() => import("@features/home/pages/HomePage"));
const LoginPage = lazy(() => import("@features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@features/auth/pages/RegisterPage"));
const SearchPage = lazy(() =>
  import("@features/search/pages/SearchPage").then((m) => ({
    default: m.SearchPage,
  })),
);
const UserProfilePage = lazy(
  () => import("@features/user/pages/UserProfilePage"),
);
const CreateProjectPage = lazy(
  () => import("@features/projects/pages/CreateProjectPage"),
);
const ProjectDetailPage = lazy(() =>
  import("@features/projects/pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const ProjectNewsPage = lazy(() =>
  import("@features/projects/pages/ProjectNewsPage").then((m) => ({
    default: m.ProjectNewsPage,
  })),
);
const LabTasksPage = lazy(() => import("@features/lab/pages/LabPage"));
const LabWallPage = lazy(() => import("@features/lab/pages/MoodboardPage"));

// Features en cours en parallele (consignes de mission) : on importe leurs
// pages telles quelles, sans toucher a leurs fichiers ni a leurs exports.
const MessagesPage = lazy(() =>
  import("@features/messages/pages/MessagesPage").then((m) => ({
    default: m.MessagesPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("@features/notifications/pages/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
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

/** /tags/:tag (doc 06) : SearchPage ne route pas encore par tag dedie (filtre en query). */
function TagRedirect() {
  const { tag } = useParams<{ tag: string }>();
  return (
    <Navigate to={`/recherche?tag=${encodeURIComponent(tag ?? "")}`} replace />
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Connexion/inscription : coquille propre (DESIGN.md "Layout"), pas
          de SiteLayout — AuthLayout gere son propre plein ecran. */}
      <Route path="/connexion" element={withSuspense(<LoginPage />)} />
      <Route path="/inscription" element={withSuspense(<RegisterPage />)} />

      {/* Coquille site (doc 06 §3) */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={withSuspense(<HomePage />)} />
        <Route path="/recherche" element={withSuspense(<SearchPage />)} />
        <Route path="/tags/:tag" element={<TagRedirect />} />
        <Route path="/u/:pseudo" element={withSuspense(<UserProfilePage />)} />
        <Route
          path="/projets/nouveau"
          element={
            <ProtectedRoute>
              {withSuspense(<CreateProjectPage />)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/projets/:slug"
          element={withSuspense(<ProjectDetailPage />)}
        />
        <Route
          path="/projets/:slug/annonces"
          element={withSuspense(<ProjectNewsPage />)}
        />
        {/* TODO(v2-L4) : pas de page Equipe dediee dans ce lot — la fiche
            projet affiche deja l'equipe dans sa colonne d'appui
            (ProjectSidebar). A separer quand l'onglet Equipe sera construit. */}
        <Route
          path="/projets/:slug/equipe"
          element={withSuspense(<ProjectDetailPage />)}
        />
      </Route>

      {/* Coquille atelier — Le Lab (doc 06 §4) */}
      <Route path="/projets/:slug/lab" element={<LabLayout />}>
        {/* Le Mur n'est pas encore construit (V2-10) : on atterrit sur Les
            Tâches tant qu'il n'existe pas. */}
        <Route index element={<Navigate to="taches" replace />} />
        <Route path="mur" element={withSuspense(<LabWallPage />)} />
        <Route path="taches" element={withSuspense(<LabTasksPage />)} />
      </Route>

      {/* Messages, notifications, administration : features migrees en
          parallele par d'autres agents (src/features/messages,
          notifications, admin). Leurs pages gardent leur propre Header/
          Footer — montees hors SiteLayout pour ne pas les doubler. */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>{withSuspense(<MessagesPage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/messages/:id"
        element={
          <ProtectedRoute>{withSuspense(<MessagesPage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>{withSuspense(<NotificationsPage />)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>{withSuspense(<AdminDashboardPage />)}</AdminRoute>
        }
      />

      {/* Redirections des anciennes routes (id -> slug/pseudo impossible sans
          donnee supplementaire : direction l'accueil plutot qu'une 404). */}
      <Route path="/login" element={<LegacyRedirect to="/connexion" />} />
      <Route path="/register" element={<LegacyRedirect to="/inscription" />} />
      <Route path="/search" element={<LegacyRedirect to="/recherche" />} />
      <Route
        path="/search/projects"
        element={<LegacyRedirect to="/recherche" />}
      />
      <Route
        path="/search/users"
        element={<LegacySearchTypeRedirect type="users" />}
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
  );
}
