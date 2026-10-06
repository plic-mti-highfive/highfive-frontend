import { projectFileSchema, type ProjectFile } from "@/domain";
import type { DbUser } from "../db";
import { daysAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

const MIME = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  mp3: "audio/mpeg",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  zip: "application/zip",
  txt: "text/plain",
} as const;

function file(
  slug: string,
  uploadedBy: DbUser,
  name: string,
  size: number,
  type: keyof typeof MIME,
  uploadedDaysAgo: number,
): ProjectFile {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return projectFileSchema.parse({
    id: nextId(),
    projectId: project.id,
    uploadedBy: uploadedBy.id,
    name,
    size,
    mimeType: MIME[type],
    uploadedAt: daysAgo(uploadedDaysAgo),
  });
}

/**
 * R-F1/R-F2 : fichiers réalistes de tous types (images, PDF, tableurs, audio,
 * archives), sous les plafonds de taille (20 Mo par fichier, 200 Mo par
 * projet). Seuls les membres déposent.
 */
export const FILES: ProjectFile[] = [
  // Fresque murale collaborative
  file(
    "fresque-murale-collaborative",
    u.alexRivera,
    "relevé-dimensions-mur-nord.pdf",
    812_000,
    "pdf",
    5,
  ),
  file(
    "fresque-murale-collaborative",
    u.sophieMartin,
    "photo-mur-avant.jpg",
    2_400_000,
    "jpg",
    3,
  ),
  file(
    "fresque-murale-collaborative",
    u.yasmineT,
    "maquette-trois-panneaux.pdf",
    4_800_000,
    "pdf",
    9,
  ),
  file(
    "fresque-murale-collaborative",
    u.marcLeroy,
    "palette-couleurs.png",
    310_000,
    "png",
    30,
  ),
  file(
    "fresque-murale-collaborative",
    u.alexRivera,
    "autorisation-mairie.pdf",
    240_000,
    "pdf",
    3,
  ),
  file(
    "fresque-murale-collaborative",
    u.sophieMartin,
    "mur-nord-lumiere-du-matin.jpg",
    3_100_000,
    "jpg",
    12,
  ),

  // Jardin partagé
  file(
    "jardin-partage-derriere-lecole",
    u.paulMercier,
    "cahier-de-culture-2026.pdf",
    1_200_000,
    "pdf",
    21,
  ),
  file(
    "jardin-partage-derriere-lecole",
    u.camillePetit,
    "planning-arrosage-septembre.pdf",
    95_000,
    "pdf",
    4,
  ),
  file(
    "jardin-partage-derriere-lecole",
    u.camillePetit,
    "plan-des-bacs.png",
    540_000,
    "png",
    200,
  ),
  file(
    "jardin-partage-derriere-lecole",
    u.amelieVasseur,
    "liste-semis-automne.xlsx",
    28_000,
    "xlsx",
    5,
  ),

  // Marée basse
  file(
    "maree-basse-jeu-video",
    u.nadiaK,
    "moodboard-fonds-marins.png",
    1_100_000,
    "png",
    8,
  ),
  file(
    "maree-basse-jeu-video",
    u.yasmineT,
    "croquis-crabe.png",
    820_000,
    "png",
    6,
  ),
  file(
    "maree-basse-jeu-video",
    u.marcLeroy,
    "theme-des-profondeurs-v2.mp3",
    4_200_000,
    "mp3",
    2,
  ),
  file(
    "maree-basse-jeu-video",
    u.nadiaK,
    "game-design-document.pdf",
    1_900_000,
    "pdf",
    35,
  ),
  file(
    "maree-basse-jeu-video",
    u.enzoB,
    "niveau-2-decor-grotte.png",
    2_300_000,
    "png",
    9,
  ),

  // Repair café
  file(
    "repair-cafe-du-mois",
    u.alexRivera,
    "affiche-session-octobre.pdf",
    640_000,
    "pdf",
    4,
  ),
  file(
    "repair-cafe-du-mois",
    u.yanisF,
    "liste-pieces-detachees.xlsx",
    41_000,
    "xlsx",
    12,
  ),
  file(
    "repair-cafe-du-mois",
    u.thomasDupont,
    "reglement-interieur.pdf",
    180_000,
    "pdf",
    300,
  ),
  file(
    "repair-cafe-du-mois",
    u.thomasDupont,
    "bilan-septembre.pdf",
    220_000,
    "pdf",
    7,
  ),

  // Soupe
  file(
    "distribution-de-soupe-lhiver",
    u.annickR,
    "planning-novembre.pdf",
    90_000,
    "pdf",
    20,
  ),
  file(
    "distribution-de-soupe-lhiver",
    u.amelieVasseur,
    "liste-allergenes.pdf",
    150_000,
    "pdf",
    10,
  ),
  file(
    "distribution-de-soupe-lhiver",
    u.amelieVasseur,
    "recette-soupe-potiron.docx",
    70_000,
    "docx",
    200,
  ),
  file(
    "distribution-de-soupe-lhiver",
    u.annickR,
    "bilan-hiver-dernier.pdf",
    310_000,
    "pdf",
    120,
  ),

  // Ciné-club
  file(
    "cine-club-de-quartier",
    u.annickR,
    "programme-de-la-saison.pdf",
    520_000,
    "pdf",
    30,
  ),
  file(
    "cine-club-de-quartier",
    u.yasmineT,
    "affiche-octobre-brouillon.png",
    1_400_000,
    "png",
    5,
  ),
  file(
    "cine-club-de-quartier",
    u.annickR,
    "droits-de-projection.pdf",
    200_000,
    "pdf",
    40,
  ),

  // Podcast
  file(
    "podcast-des-metiers-oublies",
    u.lisaMoreau,
    "guide-enregistrement.pdf",
    380_000,
    "pdf",
    41,
  ),
  file(
    "podcast-des-metiers-oublies",
    u.lisaMoreau,
    "episode-6-gisele.mp3",
    9_500_000,
    "mp3",
    8,
  ),
  file(
    "podcast-des-metiers-oublies",
    u.karimHaddad,
    "transcription-gisele.txt",
    18_000,
    "txt",
    10,
  ),

  // Langues
  file(
    "cours-de-langue-par-echange",
    u.claraMartinez,
    "feuille-d-inscription.pdf",
    62_000,
    "pdf",
    190,
  ),
  file(
    "cours-de-langue-par-echange",
    u.karimHaddad,
    "binomes-septembre.xlsx",
    22_000,
    "xlsx",
    3,
  ),

  // Console rétro
  file(
    "console-retro-en-bois",
    u.enzoB,
    "plans-de-la-borne-v2.pdf",
    2_800_000,
    "pdf",
    33,
  ),
  file(
    "console-retro-en-bois",
    u.julienGarnier,
    "plan-de-decoupe.pdf",
    410_000,
    "pdf",
    20,
  ),
  file(
    "console-retro-en-bois",
    u.enzoB,
    "photos-chantier.zip",
    14_000_000,
    "zip",
    7,
  ),

  // Album
  file(
    "album-de-reprises-au-local",
    u.marcLeroy,
    "liste-des-morceaux.pdf",
    54_000,
    "pdf",
    29,
  ),
  file(
    "album-de-reprises-au-local",
    u.marcLeroy,
    "demo-titre-5.mp3",
    6_800_000,
    "mp3",
    3,
  ),

  // Bowl
  file(
    "remise-en-etat-du-bowl",
    u.yanisF,
    "recensement-fissures.xlsx",
    36_000,
    "xlsx",
    80,
  ),
  file(
    "remise-en-etat-du-bowl",
    u.yanisF,
    "autorisation-mairie.pdf",
    180_000,
    "pdf",
    41,
  ),
  file(
    "remise-en-etat-du-bowl",
    u.julienGarnier,
    "fiche-technique-mortier.pdf",
    760_000,
    "pdf",
    25,
  ),

  // Bancs
  file(
    "carte-des-bancs-publics",
    u.alexRivera,
    "modele-de-fiche.pdf",
    120_000,
    "pdf",
    20,
  ),
  file(
    "carte-des-bancs-publics",
    u.karimHaddad,
    "releves-quartier-nord.xlsx",
    58_000,
    "xlsx",
    4,
  ),

  // Chorale
  file(
    "chorale-improvisee-du-mardi",
    u.lisaMoreau,
    "paroles-dona-nobis-pacem.pdf",
    45_000,
    "pdf",
    4,
  ),
  file(
    "chorale-improvisee-du-mardi",
    u.baptisteN,
    "chant-georgien-partition.pdf",
    130_000,
    "pdf",
    3,
  ),

  // Refuge à hérissons
  file(
    "refuge-a-herissons",
    u.mathildeD,
    "plans-abri-herisson.pdf",
    1_400_000,
    "pdf",
    120,
  ),
  file(
    "refuge-a-herissons",
    u.paulMercier,
    "suivi-des-passages.xlsx",
    31_000,
    "xlsx",
    100,
  ),

  // Bibliothèque de rue
  file(
    "bibliotheque-de-rue",
    u.julienGarnier,
    "plans-boite-a-livres.pdf",
    980_000,
    "pdf",
    270,
  ),

  // Vélo-école
  file(
    "velo-ecole-pour-adultes",
    u.amelieVasseur,
    "fiche-de-suivi.pdf",
    70_000,
    "pdf",
    60,
  ),
  file(
    "velo-ecole-pour-adultes",
    u.yanisF,
    "progression-en-quatre-seances.pdf",
    210_000,
    "pdf",
    100,
  ),

  // Fanzine
  file("fanzine-du-lycee", u.lisaMoreau, "numero-3.pdf", 6_400_000, "pdf", 52),
  file(
    "fanzine-du-lycee",
    u.yasmineT,
    "maquette-numero-4.pdf",
    3_900_000,
    "pdf",
    5,
  ),

  // Repair vélo mobile
  file(
    "repair-velo-mobile",
    u.thomasDupont,
    "plan-de-la-remorque.pdf",
    1_100_000,
    "pdf",
    18,
  ),

  // Échecs
  file(
    "club-dechecs-du-mercredi",
    u.enzoB,
    "regles-du-tournoi.pdf",
    85_000,
    "pdf",
    5,
  ),

  // Verger
  file(
    "verger-conservatoire",
    u.paulMercier,
    "liste-des-quarante-varietes.xlsx",
    44_000,
    "xlsx",
    100,
  ),
  file(
    "verger-conservatoire",
    u.mathildeD,
    "plan-de-plantation.png",
    1_800_000,
    "png",
    15,
  ),

  // Couture
  file(
    "atelier-couture-solidaire",
    u.annickR,
    "fiche-retouche.pdf",
    52_000,
    "pdf",
    38,
  ),

  // Fresques sonores
  file(
    "fresques-sonores",
    u.marcLeroy,
    "carte-des-six-balades.pdf",
    2_200_000,
    "pdf",
    100,
  ),
  file(
    "fresques-sonores",
    u.marcLeroy,
    "balade-4-la-chorale-sous-le-pont.mp3",
    12_000_000,
    "mp3",
    190,
  ),

  // Berges
  file(
    "nettoyage-des-berges",
    u.mathildeD,
    "bilan-premiere-sortie.xlsx",
    26_000,
    "xlsx",
    9,
  ),
  file(
    "nettoyage-des-berges",
    u.alexRivera,
    "itineraire-du-3-octobre.pdf",
    340_000,
    "pdf",
    4,
  ),

  // Code pour aînés
  file(
    "cours-de-code-pour-aines",
    u.nadiaK,
    "support-seance-1.pdf",
    460_000,
    "pdf",
    6,
  ),
];

/** Retrouve un fichier de démo par projet et nom (pièces jointes de messages). */
export function fileOf(slug: string, name: string): ProjectFile {
  const projectId = PROJECT_BY_SLUG.get(slug)?.id;
  const found = FILES.find((f) => f.projectId === projectId && f.name === name);
  if (!found) throw new Error(`Fichier de demo introuvable : ${slug}/${name}`);
  return found;
}
