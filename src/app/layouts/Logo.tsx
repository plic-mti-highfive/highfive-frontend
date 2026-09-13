import { Link } from "react-router-dom";
import { cn } from "@shared/lib/cn";

interface LogoProps {
  className?: string;
}

/**
 * Marque HighFive! (deplacee depuis src/features/layout/components/Logo.tsx,
 * V2 item 3). Fraunces italique reserve exclusivement au logotype (regle du
 * serif reserve au mot-marque, DESIGN.md) : `font-display` porte la police,
 * jamais de style={{}} pour la simuler.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "font-display italic font-black leading-none text-foreground select-none transition-opacity hover:opacity-80",
        className,
      )}
    >
      HighFive<span className="text-rose">!</span>
    </Link>
  );
}
