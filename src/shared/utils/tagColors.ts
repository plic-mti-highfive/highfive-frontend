// Couleurs accent disponibles pour les tags
const TAG_COLORS = [
  {
    bg: "bg-rose-light dark:bg-rose-deeper/40",
    text: "text-rose-dark dark:text-rose-mid",
    border: "border-rose",
  },
  {
    bg: "bg-orange-light dark:bg-orange-deeper/40",
    text: "text-orange-dark dark:text-orange-mid",
    border: "border-orange",
  },
  {
    bg: "bg-yellow-light dark:bg-yellow-deeper/40",
    text: "text-yellow-dark dark:text-yellow-mid",
    border: "border-yellow",
  },
  {
    bg: "bg-apple-light dark:bg-apple-deeper/40",
    text: "text-apple-dark dark:text-apple-mid",
    border: "border-apple",
  },
  {
    bg: "bg-sky-light dark:bg-sky-deeper/40",
    text: "text-sky-dark dark:text-sky-mid",
    border: "border-sky",
  },
  {
    bg: "bg-purple-light dark:bg-purple-deeper/40",
    text: "text-purple-dark dark:text-purple-mid",
    border: "border-purple",
  },
];

// Hash simple pour assigner une couleur cohérente basée sur le nom du tag
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Obtient les classes de couleur pour un tag donné
export function getTagColor(tag: string) {
  const index = hashString(tag) % TAG_COLORS.length;
  return TAG_COLORS[index];
}
