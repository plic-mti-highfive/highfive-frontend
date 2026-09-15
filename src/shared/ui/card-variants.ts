import { cva } from "class-variance-authority";

// `interactive` s'appuie sur --shadow-lift, qui compose déjà un anneau teinté
// via var(--card-accent, transparent) : poser `data-accent="rose|orange|…"`
// sur la Card suffit à teinter le survol, sans logique JS supplémentaire.
//
// `isolate` (V2, retour util. 1) : force un nouveau contexte d'empilement sur
// la carte elle-meme. Sans ca, un descendant positionne avec un z-index
// "eleve" pour rester cliquable au-dessus du lien overlay de la carte
// (ex. HighfiveButton, `relative z-20` dans ProjectCard) se compare aux
// autres elements du DOCUMENT entier des lors que la carte n'a pas de
// z-index propre (position:relative + z-index:auto ne cree pas de contexte
// d'empilement) : son z-20 local pouvait alors depasser l'en-tete/la barre
// de themes collants (z-sticky=20) pendant le defilement. `isolate` borne
// tous les z-index internes (lien overlay, bouton highfive...) a
// l'interieur de la carte, qui reste elle-meme un bloc normal dans le flux
// d'empilement de la page — jamais au-dessus des tokens `z-sticky`/`z-dropdown`
// globaux.
export const cardVariants = cva(
  "isolate rounded-xl bg-card text-card-foreground transition-shadow duration-base",
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
