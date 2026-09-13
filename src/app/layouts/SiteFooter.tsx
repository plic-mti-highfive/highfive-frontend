import { Link } from "react-router-dom";
import { Logo } from "./Logo";

// Pages legales pas encore construites dans ce lot (/a-propos,
// /confidentialite, /conditions n'apparaissent pas dans la liste de routes
// du chantier router) : les liens renvoient a l'accueil plutot que vers une
// route inexistante, comme le faisait deja l'ancien Footer.
const LINKS = [
  { label: "À propos", to: "/" },
  { label: "Confidentialité", to: "/" },
  { label: "Conditions", to: "/" },
];

/**
 * Pied de la coquille site (doc 06 §3.1). Deplace/reecrit depuis
 * src/features/layout/components/Footer.tsx (V2 item 3).
 */
export function SiteFooter() {
  return (
    <footer className="w-full border-t border-sidebar-border bg-sidebar">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-6 sm:flex-row">
        <Logo className="text-xl" />

        <nav className="flex items-center gap-6">
          {LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-body-md text-foreground transition-colors hover:text-muted-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-body-md text-muted-foreground">
          HighFive! {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
