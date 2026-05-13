import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Logo } from "@features/layout";
import { useTheme } from "@shared/contexts";

const LINKS = [
  { label: "Documentation", to: "/" },
  { label: "Communauté", to: "/" },
  { label: "Confidentialité", to: "/" },
  { label: "Conditions", to: "/" },
];

export default function Footer() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <footer className="w-full bg-sidebar border-t border-sidebar-border">
      {/* Corps */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Marque */}
        <div className="flex flex-col gap-2 shrink-0">
          <Logo className="text-xl" textColor="text-foreground" />
        </div>

        {/* Liens - Ligne unique */}
        <div className="flex items-center gap-6">
          {LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-body-md text-foreground hover:text-muted-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Droits et toggle thème */}
        <div className="flex items-center gap-4 shrink-0">
          <p className="text-body-md text-muted-foreground">
            © {new Date().getFullYear()} HighFive
          </p>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:bg-muted transition-colors outline-none"
            aria-label={
              resolvedTheme === "light"
                ? "Activer le mode sombre"
                : "Activer le mode clair"
            }
          >
            {resolvedTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </footer>
  );
}
