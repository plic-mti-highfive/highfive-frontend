import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// L'échelle de tailles de texte custom définie dans index.css (--text-*)
// n'est pas connue de tailwind-merge par défaut. Sans cette extension,
// tailwind-merge classe "text-body-lg" dans le même groupe que les
// couleurs de texte ("text-primary-foreground", etc.) et ne garde que la
// dernière classe du groupe : selon l'ordre des classes, cela peut
// supprimer silencieusement la couleur (texte invisible).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "heading-lg",
            "heading-md",
            "body-lg",
            "body-md",
            "body-sm",
            "ui-md",
            "ui-sm",
            "label",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
