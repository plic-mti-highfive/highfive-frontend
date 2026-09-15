import { ScrollToTop } from "@shared/components/ScrollToTop";
import { ScrollToTopButton } from "@shared/components/ScrollToTopButton";
import { AppRouter } from "./router";

/**
 * Racine applicative (V2 item 1), deplacee/reecrite depuis src/App.tsx —
 * ne porte plus les <Route> directement, voir src/app/router.tsx.
 */
export default function App() {
  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <AppRouter />
    </>
  );
}
