import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Spinner } from "@shared/ui";
import { preloadMainPagesWhenIdle } from "../preload";
import { NavigationProgress } from "./NavigationProgress";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SiteMobileTabBar } from "./SiteMobileTabBar";

/** Fallback du `<Suspense>` partage de la coquille site — voir plus bas. */
function OutletFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Coquille site (doc 06 §3, V2 item 3) : en-tete collant 56px opaque, footer
 * À propos · Confidentialité · Conditions, barre basse mobile a 5 entrees.
 * Les pages montees ici ne rendent plus que leur propre contenu.
 *
 * Pas de conteneur de largeur ici : les pages existantes gerent deja leur
 * propre `max-w-*` interne (feed 100rem, fiche projet 1400px...) — en
 * imposer un second au niveau de la coquille aurait double-contraint des
 * pages hors perimetre de ce lot. `contenu max 1240px` (doc 06 §3.1) reste
 * la reference pour les pages neuves de ce chantier.
 *
 * `<Suspense>` unique autour de l'`<Outlet/>` (V2, retour util. 5) : cette
 * coquille persiste (meme fiber) d'une page principale a l'autre, donc ce
 * boundary aussi — contrairement a un `<Suspense>` pose individuellement
 * sur chaque route (remonte a chaque navigation), ce qui permet a
 * `useDeferredValue(location)` (router.tsx) de garder l'ancienne page
 * affichee pendant le chargement du nouveau chunk au lieu de retomber sur
 * ce fallback. Precharge aussi les pages principales une fois inactif
 * (`preloadMainPagesWhenIdle`).
 */
export function SiteLayout() {
  useEffect(() => {
    preloadMainPagesWhenIdle();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <NavigationProgress />
      <div className="flex-1 pb-14 sm:pb-0">
        <Suspense fallback={<OutletFallback />}>
          <Outlet />
        </Suspense>
      </div>
      <SiteFooter />
      <SiteMobileTabBar />
    </div>
  );
}
