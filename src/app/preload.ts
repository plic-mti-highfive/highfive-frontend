/**
 * Fonctions de prechargement des chunks lazy des pages principales (V2,
 * retour util. 5). Source unique de chaque `import()` dynamique : `router.tsx`
 * les reutilise pour ses `React.lazy(...)` (un seul chunk par page, pas de
 * `import()` duplique) et les points d'entree de navigation
 * (survol/focus d'un lien, `SiteHeader`/`SiteMobileTabBar`/`ProjectCard`)
 * les appellent directement pour declencher le fetch du chunk avant le clic
 * — un module deja recupere par le navigateur ne redeclenche pas de requete.
 */

export const preloadHome = () => import("@features/home/pages/HomePage");

export const preloadSearch = () => import("@features/search/pages/SearchPage");

export const preloadProjectFiche = () =>
  import("@features/projects/components/ProjectLayout");

export const preloadProjectDetail = () =>
  import("@features/projects/pages/ProjectDetailPage");

export const preloadUserProfile = () =>
  import("@features/user/pages/UserProfilePage");

export const preloadMessages = () =>
  import("@features/messages/pages/MessagesPage");

export const preloadCreateProject = () =>
  import("@features/projects/pages/CreateProjectPage");

export const preloadNotifications = () =>
  import("@features/notifications/pages/NotificationsPage");

/**
 * Precharge les pages principales (Decouvrir, fiche projet, recherche,
 * profil, messages) une fois le premier rendu passe, hors periode critique
 * (`requestIdleCallback`, repli `setTimeout` pour les navigateurs qui ne
 * l'exposent pas). Appelee une seule fois par `SiteLayout`.
 */
export function preloadMainPagesWhenIdle(): void {
  if (typeof window === "undefined") return;

  const run = () => {
    void preloadHome();
    void preloadSearch();
    void preloadProjectFiche();
    void preloadProjectDetail();
    void preloadUserProfile();
    void preloadMessages();
  };

  const ric = window.requestIdleCallback;
  if (ric) {
    ric(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1000);
  }
}
