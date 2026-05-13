// Couleurs accent disponibles pour les tags
const TAG_COLORS = [
  { bg: "bg-rose-light", text: "text-rose-dark", border: "border-rose" },
  { bg: "bg-orange-light", text: "text-orange-dark", border: "border-orange" },
  { bg: "bg-yellow-light", text: "text-yellow-dark", border: "border-yellow" },
  { bg: "bg-apple-light", text: "text-apple-dark", border: "border-apple" },
  { bg: "bg-sky-light", text: "text-sky-dark", border: "border-sky" },
  { bg: "bg-purple-light", text: "text-purple-dark", border: "border-purple" },
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
