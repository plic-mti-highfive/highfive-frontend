import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SiteMobileTabBar } from "./SiteMobileTabBar";

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
 */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 pb-14 sm:pb-0">
        <Outlet />
      </div>
      <SiteFooter />
      <SiteMobileTabBar />
    </div>
  );
}
