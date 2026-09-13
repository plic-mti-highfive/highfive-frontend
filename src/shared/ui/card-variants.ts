import { cva } from "class-variance-authority";

// `interactive` s'appuie sur --shadow-lift, qui compose déjà un anneau teinté
// via var(--card-accent, transparent) : poser `data-accent="rose|orange|…"`
// sur la Card suffit à teinter le survol, sans logique JS supplémentaire.
export const cardVariants = cva(
  "rounded-xl bg-card text-card-foreground transition-shadow duration-base",
  {
    variants: {
      variant: {
        flat: "shadow-rest",
        interactive: "shadow-rest cursor-pointer hover:shadow-lift",
      },
    },
    defaultVariants: {
      variant: "flat",
    },
  },
);
