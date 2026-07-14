// Mock tags - source de vérité unique pour tous les tags de l'application
// Ces tags sont utilisés pour catégoriser les projets et les utilisateurs
// Tags variés et accessibles pour tous types de projets

export const ALL_TAGS = [
  // Catégories générales et populaires
  "Créatif",
  "Communauté",
  "Éducation",
  "Environnement",
  "Social",
  "Culture",
  "Innovation",
  "Solidarité",
  "Bien-être",
  "Collaboration",

  // Arts et créativité
  "Art",
  "Musique",
  "Photographie",
  "Cinéma",
  "Écriture",
  "Design",
  "Artisanat",
  "Mode",
  "Illustration",
  "Peinture",

  // Sciences et éducation
  "Science",
  "Recherche",
  "Pédagogie",
  "Histoire",
  "Philosophie",
  "Psychologie",

  // Environnement et durabilité
  "Écologie",
  "Agriculture",
  "Jardinage",
  "Zéro déchet",
  "Énergie",

  // Social et solidarité
  "Humanitaire",
  "Bénévolat",
  "Entraide",
  "Inclusion",
  "Diversité",

  // Sport et bien-être
  "Sport",
  "Fitness",
  "Yoga",
  "Nutrition",
  "Santé mentale",

  // Événements et organisation
  "Événement",
  "Festival",
  "Atelier",
  "Rencontre",
  "Conférence",

  // Technologie et numérique
  "Technologie",
  "Tech",
  "Open Source",
  "Web",
  "Mobile",
  "IA / ML",
  "Data",
  "Cybersécurité",
  "DIY",
  "Maker",
  "Hardware",
  "Robotique",

  // Autres domaines
  "Cuisine",
  "Voyage",
  "Littérature",
  "Jeu",
  "Entrepreneuriat",
  "Finance participative",
] as const;

export type Tag = (typeof ALL_TAGS)[number];

// Helper pour vérifier si un tag est valide
export function isValidTag(tag: string): tag is Tag {
  return ALL_TAGS.includes(tag as Tag);
}

// Helper pour obtenir tous les tags
export function getAllTags(): readonly string[] {
  return ALL_TAGS;
}
