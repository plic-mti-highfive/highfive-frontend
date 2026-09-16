import { Monitor, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { useTheme } from "@shared/contexts";
import {
  DropdownMenu,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  IconButton,
} from "@shared/ui";
import { Logo } from "./Logo";

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const ThemeIcon = THEME_ICONS[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton aria-label="Changer de thème" size="sm">
            <ThemeIcon size={18} />
          </IconButton>
        }
      />
      <DropdownMenuPortal>
        <DropdownMenuPositioner>
          <DropdownMenuPopup>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) =>
                setTheme(value as "light" | "dark" | "system")
              }
            >
              <DropdownMenuRadioItem value="light">
                <Sun size={16} />
                Clair
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon size={16} />
                Sombre
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor size={16} />
                Système
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuPopup>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

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
 * Pied de la coquille site (doc 06 §3.1).
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

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <p className="text-body-md text-muted-foreground">
            HighFive! {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
