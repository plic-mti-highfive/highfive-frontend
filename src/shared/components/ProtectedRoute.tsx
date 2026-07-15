import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@shared/contexts";

/**
 * Gardes de routes.
 *
 * L'application n'en avait aucune : /admin, /messages, /notifications et
 * /create-project se rendaient pour n'importe qui, y compris deconnecte. Les
 * donnees restaient protegees par le backend (401/403), mais l'interface
 * d'administration s'affichait et l'utilisateur se retrouvait devant des
 * ecrans vides sans comprendre pourquoi.
 */

function AuthPending() {
  return <div className="min-h-screen bg-background" />;
}

/** Reserve une route aux utilisateurs connectes. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthPending />;
  if (!isAuthenticated) {
    // `state` permet de revenir sur la page demandee apres connexion.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Reserve une route aux administrateurs plateforme. */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthPending />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // Un non-admin n'a pas a savoir que cette page existe : on renvoie sur
  // l'accueil plutot que d'afficher un refus.
  if (user?.systemRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
