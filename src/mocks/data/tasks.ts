import {
  columnSchema,
  taskSchema,
  type Column,
  type TagAccent,
  type Task,
} from "@/domain";
import type { DbUser } from "../db";
import { dateIn, daysAgo, nextId } from "./ids";
import { PROJECTS } from "./projects";
import * as u from "./users";

const DEFAULT_COLUMNS: { label: string; color?: TagAccent }[] = [
  { label: "À faire" },
  { label: "En cours" },
  { label: "Fait" },
];

/**
 * R-K1 : trois colonnes par défaut (À faire, En cours, Fait). R-K2 : un projet
 * peut en avoir de 1 à 6 ; quelques-uns ont les leurs, pour que l'écran
 * montre autre chose que trois colonnes identiques partout.
 */
const CUSTOM_COLUMNS: Record<string, { label: string; color?: TagAccent }[]> = {
  "maree-basse-jeu-video": [
    { label: "Idées", color: "purple" },
    { label: "À faire" },
    { label: "En cours" },
    { label: "À tester", color: "sky" },
    { label: "Fait" },
  ],
  "verger-conservatoire": [
    { label: "À faire" },
    { label: "En cours" },
    { label: "En attente", color: "orange" },
    { label: "Fait" },
  ],
};

export const COLUMNS: Column[] = [];
const columnsBySlug = new Map<string, Column[]>();

for (const project of PROJECTS) {
  const columns = (CUSTOM_COLUMNS[project.slug] ?? DEFAULT_COLUMNS).map(
    (definition, order) =>
      columnSchema.parse({
        id: nextId(),
        projectId: project.id,
        label: definition.label,
        order,
        color: definition.color,
      }),
  );
  COLUMNS.push(...columns);
  columnsBySlug.set(project.slug, columns);
}

interface TaskOptions {
  to?: DbUser[];
  due?: string;
  details?: string;
  wallOriginId?: string;
}

/** [colonne, titre, créée par, il y a N jours, options]. */
type TaskRow = [
  column: string,
  title: string,
  createdBy: DbUser,
  createdDaysAgo: number,
  options?: TaskOptions,
];

export const TASKS: Task[] = [];
const nextOrder = new Map<string, number>();

function board(slug: string, rows: TaskRow[]): void {
  const columns = columnsBySlug.get(slug);
  if (!columns) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  for (const [label, title, createdBy, createdDaysAgo, options] of rows) {
    const column = columns.find((c) => c.label === label);
    if (!column) throw new Error(`Colonne "${label}" introuvable pour ${slug}`);
    const order = nextOrder.get(column.id) ?? 0;
    nextOrder.set(column.id, order + 1);
    TASKS.push(
      taskSchema.parse({
        id: nextId(),
        columnId: column.id,
        title,
        details: options?.details,
        assigneeIds: options?.to?.map((user) => user.id) ?? [],
        dueDate: options?.due,
        order,
        createdBy: createdBy.id,
        createdAt: daysAgo(createdDaysAgo),
        wallOriginId: options?.wallOriginId,
      }),
    );
  }
}

// Fresque : l'échéance dépassée, deux idées nées du tableau blanc, plusieurs
// personnes assignées et une tâche confiée à alex.rivera (notification).
board("fresque-murale-collaborative", [
  [
    "À faire",
    "Repeindre le mur nord",
    u.camillePetit,
    12,
    {
      to: [u.alexRivera],
      details:
        "Deuxième couche sur la partie basse du premier panneau, avant de commencer la forêt.",
      wallOriginId: "wall-idea-fresque-trois-panneaux",
    },
  ],
  [
    "À faire",
    "Trouver de la peinture extérieure",
    u.alexRivera,
    20,
    {
      due: dateIn(-3),
      details:
        "Deux pots de blanc, un de rose bonbon. Demander un devis à la droguerie de la rue Gambetta.",
    },
  ],
  [
    "À faire",
    "Prévenir les riverains",
    u.alexRivera,
    10,
    { wallOriginId: "wall-idea-accord-mairie" },
  ],
  [
    "À faire",
    "Préparer le goûter du samedi",
    u.camillePetit,
    3,
    { to: [u.camillePetit], due: dateIn(6) },
  ],
  [
    "À faire",
    "Imprimer des affiches pour le quartier",
    u.yasmineT,
    4,
    { to: [u.yasmineT, u.sophieMartin], due: dateIn(4) },
  ],
  [
    "En cours",
    "Faire le relevé des dimensions",
    u.camillePetit,
    5,
    { to: [u.sophieMartin, u.camillePetit] },
  ],
  [
    "En cours",
    "Préparer les gabarits du deuxième panneau",
    u.marcLeroy,
    8,
    { to: [u.marcLeroy, u.thomasDupont], due: dateIn(10) },
  ],
  ["Fait", "Publier l'annonce", u.alexRivera, 25],
  ["Fait", "Réserver la nacelle", u.alexRivera, 22],
  ["Fait", "Choisir les couleurs", u.marcLeroy, 30],
  [
    "Fait",
    "Obtenir l'accord de la mairie",
    u.alexRivera,
    35,
    { to: [u.alexRivera] },
  ],
  [
    "Fait",
    "Dessiner la maquette avec l'école",
    u.yasmineT,
    40,
    { to: [u.yasmineT] },
  ],
  [
    "Fait",
    "Photographier le mur avant",
    u.sophieMartin,
    24,
    { to: [u.sophieMartin] },
  ],
]);

board("jardin-partage-derriere-lecole", [
  ["À faire", "Réparer le composteur", u.camillePetit, 6],
  [
    "À faire",
    "Acheter du grillage anti-chats",
    u.mathildeD,
    4,
    { to: [u.paulMercier], due: dateIn(8) },
  ],
  [
    "À faire",
    "Commander les semis d'automne",
    u.camillePetit,
    5,
    { to: [u.amelieVasseur], due: dateIn(12) },
  ],
  [
    "En cours",
    "Planifier le planning d'arrosage d'été",
    u.camillePetit,
    3,
    { to: [u.annickR] },
  ],
  [
    "En cours",
    "Installer le récupérateur d'eau",
    u.paulMercier,
    9,
    {
      to: [u.paulMercier, u.alexRivera],
      details: "Cuve de 300 litres à brancher sur la gouttière de la cabane.",
    },
  ],
  [
    "Fait",
    "Désherber l'allée centrale",
    u.sophieMartin,
    14,
    { to: [u.sophieMartin] },
  ],
  ["Fait", "Peindre la cabane", u.alexRivera, 70, { to: [u.alexRivera] }],
  ["Fait", "Étiqueter les six bacs", u.camillePetit, 90],
]);

board("maree-basse-jeu-video", [
  ["Idées", "Mode photo pour partager ses captures", u.lisaMoreau, 6],
  ["Idées", "Un petit crabe qui suit le sous-marin", u.yasmineT, 5],
  ["Idées", "Un journal de bord illustré", u.lisaMoreau, 12],
  [
    "À faire",
    "Écrire les textes des épaves",
    u.nadiaK,
    8,
    { to: [u.lisaMoreau], due: dateIn(14) },
  ],
  [
    "À faire",
    "Dessiner le décor de la grotte",
    u.enzoB,
    7,
    { to: [u.enzoB, u.yasmineT] },
  ],
  [
    "À faire",
    "Intégrer la musique du niveau 1",
    u.nadiaK,
    10,
    { to: [u.marcLeroy] },
  ],
  [
    "En cours",
    "Finir le niveau 2",
    u.nadiaK,
    4,
    {
      to: [u.nadiaK, u.enzoB],
      details:
        "Trois épaves, une grotte, un champ d'algues. Priorité à la grotte.",
    },
  ],
  [
    "En cours",
    "Corriger la vitesse de rotation du sous-marin",
    u.nadiaK,
    1,
    { to: [u.nadiaK], due: dateIn(2) },
  ],
  ["À tester", "Collisions des algues", u.nadiaK, 3, { to: [u.hugoLemaire] }],
  ["Fait", "Prototype jouable à 60 fps", u.nadiaK, 1],
  ["Fait", "Créer le dépôt ouvert", u.nadiaK, 38],
  ["Fait", "Choisir le nom du jeu", u.enzoB, 36],
  ["Fait", "Menu principal", u.enzoB, 25, { to: [u.enzoB] }],
]);

board("repair-cafe-du-mois", [
  ["À faire", "Commander des piles pour les testeurs", u.thomasDupont, 2],
  [
    "À faire",
    "Acheter un deuxième fer à souder",
    u.thomasDupont,
    9,
    { to: [u.julienGarnier], due: dateIn(18) },
  ],
  [
    "À faire",
    "Trier les pièces détachées",
    u.thomasDupont,
    12,
    { to: [u.yanisF] },
  ],
  [
    "En cours",
    "Imprimer l'affiche de la session d'octobre",
    u.thomasDupont,
    5,
    { to: [u.alexRivera], due: dateIn(14) },
  ],
  ["Fait", "Réserver la salle jusqu'en décembre", u.thomasDupont, 40],
  ["Fait", "Faire la liste des bénévoles", u.julienGarnier, 60],
  ["Fait", "Acheter la caisse à outils", u.thomasDupont, 120],
]);

board("distribution-de-soupe-lhiver", [
  [
    "À faire",
    "Recruter des bénévoles pour le mardi",
    u.annickR,
    14,
    { to: [u.claraMartinez] },
  ],
  [
    "À faire",
    "Réviser la liste des allergènes",
    u.amelieVasseur,
    10,
    { to: [u.amelieVasseur], due: dateIn(30) },
  ],
  ["À faire", "Trouver une camionnette pour le jeudi soir", u.annickR, 6],
  [
    "En cours",
    "Récupérer les marmites chez le traiteur",
    u.annickR,
    4,
    { to: [u.lisaMoreau, u.camillePetit] },
  ],
  ["Fait", "Réserver la salle paroissiale", u.annickR, 120],
  [
    "Fait",
    "Établir le planning de novembre",
    u.annickR,
    20,
    { to: [u.annickR] },
  ],
]);

board("cine-club-de-quartier", [
  [
    "À faire",
    "Choisir les films de novembre et décembre",
    u.annickR,
    6,
    { to: [u.karimHaddad] },
  ],
  ["À faire", "Faire les sous-titres du prochain film", u.annickR, 4],
  [
    "En cours",
    "Imprimer les affiches d'octobre",
    u.annickR,
    5,
    { to: [u.yasmineT], due: dateIn(10) },
  ],
  [
    "Fait",
    "Louer les droits de projection",
    u.annickR,
    40,
    { to: [u.annickR] },
  ],
  ["Fait", "Emprunter le vidéoprojecteur", u.sophieMartin, 18],
]);

board("podcast-des-metiers-oublies", [
  ["À faire", "Monter l'épisode 7", u.lisaMoreau, 6, { to: [u.marcLeroy] }],
  [
    "À faire",
    "Contacter le grand-père de Paul",
    u.lisaMoreau,
    4,
    { to: [u.lisaMoreau] },
  ],
  [
    "En cours",
    "Transcrire l'entretien avec Gisèle",
    u.lisaMoreau,
    10,
    { to: [u.karimHaddad] },
  ],
  ["Fait", "Publier l'épisode 6", u.lisaMoreau, 8],
  ["Fait", "Écrire le guide d'enregistrement", u.lisaMoreau, 41],
]);

board("cours-de-langue-par-echange", [
  [
    "À faire",
    "Trouver un binôme pour le portugais",
    u.claraMartinez,
    7,
    { to: [u.claraMartinez] },
  ],
  [
    "À faire",
    "Organiser le repas du 26",
    u.claraMartinez,
    8,
    { to: [u.annickR, u.amelieVasseur], due: dateIn(12) },
  ],
  [
    "En cours",
    "Mettre à jour la liste des binômes",
    u.claraMartinez,
    3,
    { to: [u.karimHaddad] },
  ],
  ["Fait", "Créer la feuille d'inscription", u.claraMartinez, 190],
  ["Fait", "Réserver la salle pour le samedi", u.annickR, 60],
]);

board("console-retro-en-bois", [
  ["À faire", "Peindre la façade", u.enzoB, 5, { to: [u.yanisF] }],
  [
    "À faire",
    "Commander les boutons d'arcade",
    u.enzoB,
    8,
    { to: [u.enzoB], due: dateIn(5) },
  ],
  [
    "En cours",
    "Découper les panneaux latéraux",
    u.enzoB,
    7,
    { to: [u.julienGarnier, u.enzoB] },
  ],
  [
    "En cours",
    "Installer les jeux libres",
    u.enzoB,
    6,
    { to: [u.hugoLemaire, u.nadiaK] },
  ],
  ["Fait", "Souder les joysticks", u.enzoB, 12, { to: [u.julienGarnier] }],
  ["Fait", "Dessiner les plans", u.enzoB, 33],
]);

board("album-de-reprises-au-local", [
  ["À faire", "Enregistrer la batterie des titres 6 à 8", u.marcLeroy, 6],
  ["À faire", "Mixer le titre 2", u.marcLeroy, 10, { to: [u.marcLeroy] }],
  [
    "En cours",
    "Enregistrer les voix du titre 5",
    u.marcLeroy,
    4,
    { to: [u.nadiaK] },
  ],
  [
    "Fait",
    "Enregistrer les basses des titres 1 à 4",
    u.marcLeroy,
    25,
    { to: [u.marcLeroy, u.baptisteN] },
  ],
  ["Fait", "Choisir la liste des huit morceaux", u.baptisteN, 29],
]);

board("remise-en-etat-du-bowl", [
  [
    "À faire",
    "Poncer les bords",
    u.yanisF,
    5,
    { to: [u.yanisF], due: dateIn(6) },
  ],
  [
    "À faire",
    "Acheter le béton de réparation",
    u.yanisF,
    8,
    { to: [u.julienGarnier] },
  ],
  [
    "En cours",
    "Reboucher les fissures 7 à 9",
    u.yanisF,
    4,
    { to: [u.enzoB, u.thomasDupont] },
  ],
  ["Fait", "Obtenir l'autorisation de la mairie", u.yanisF, 41],
  ["Fait", "Recenser les fissures", u.yanisF, 80, { to: [u.yanisF] }],
]);

board("carte-des-bancs-publics", [
  [
    "À faire",
    "Relever le centre-ville",
    u.alexRivera,
    5,
    { to: [u.sophieMartin, u.paulMercier], due: dateIn(14) },
  ],
  ["À faire", "Créer la carte en ligne", u.alexRivera, 6],
  [
    "En cours",
    "Compiler les relevés du quartier nord",
    u.alexRivera,
    4,
    { to: [u.karimHaddad] },
  ],
  ["Fait", "Écrire le modèle de fiche", u.alexRivera, 20],
  [
    "Fait",
    "Relever le quartier nord",
    u.alexRivera,
    12,
    { to: [u.alexRivera, u.oceaneL] },
  ],
]);

board("chorale-improvisee-du-mardi", [
  [
    "À faire",
    "Imprimer les paroles pour mardi",
    u.claraMartinez,
    2,
    { to: [u.lisaMoreau] },
  ],
  [
    "À faire",
    "Trouver un pianiste",
    u.claraMartinez,
    15,
    { to: [u.baptisteN] },
  ],
  [
    "En cours",
    "Apprendre le chant géorgien",
    u.baptisteN,
    3,
    { to: [u.baptisteN] },
  ],
  ["Fait", "Réserver la salle des fêtes", u.claraMartinez, 5],
]);

board("refuge-a-herissons", [
  ["Fait", "Construire vingt abris", u.camillePetit, 240],
  [
    "Fait",
    "Poser les abris chez les voisins",
    u.camillePetit,
    200,
    { to: [u.camillePetit, u.mathildeD] },
  ],
  ["Fait", "Rédiger les plans", u.mathildeD, 120],
  ["Fait", "Suivre les passages pendant l'hiver", u.paulMercier, 100],
]);

board("bibliotheque-de-rue", [
  ["Fait", "Construire les trois boîtes", u.annickR, 360],
  ["Fait", "Les installer aux arrêts", u.julienGarnier, 250],
  ["Fait", "Les enregistrer au registre de la ville", u.annickR, 240],
]);

board("velo-ecole-pour-adultes", [
  [
    "À faire",
    "Trouver des vélos de petite taille",
    u.yanisF,
    9,
    { to: [u.thomasDupont] },
  ],
  ["À faire", "Recruter deux moniteurs", u.yanisF, 6],
  [
    "En cours",
    "Remettre en état deux vélos",
    u.yanisF,
    4,
    { to: [u.thomasDupont, u.julienGarnier] },
  ],
  ["Fait", "Obtenir le parking du stade", u.yanisF, 120],
  ["Fait", "Imprimer les fiches de suivi", u.amelieVasseur, 60],
]);

board("fanzine-du-lycee", [
  [
    "À faire",
    "Relire les textes du numéro 4",
    u.lisaMoreau,
    7,
    { to: [u.claraMartinez], due: dateIn(8) },
  ],
  [
    "En cours",
    "Mise en page du numéro 4",
    u.lisaMoreau,
    5,
    { to: [u.yasmineT, u.lisaMoreau] },
  ],
  ["Fait", "Imprimer le numéro 3", u.claraMartinez, 52],
  ["Fait", "Voter le thème du trimestre", u.lisaMoreau, 20],
]);

board("repair-velo-mobile", [
  [
    "À faire",
    "Acheter un coffre étanche",
    u.thomasDupont,
    6,
    { to: [u.thomasDupont], due: dateIn(7) },
  ],
  ["À faire", "Dessiner le logo", u.thomasDupont, 4],
  [
    "En cours",
    "Monter les rails de la remorque",
    u.thomasDupont,
    12,
    { to: [u.julienGarnier, u.yanisF] },
  ],
  ["Fait", "Souder le cadre", u.thomasDupont, 18],
]);

board("club-dechecs-du-mercredi", [
  [
    "À faire",
    "Organiser le tournoi du 7 octobre",
    u.enzoB,
    5,
    { to: [u.enzoB, u.hugoLemaire], due: dateIn(24) },
  ],
  ["En cours", "Réparer les pendules", u.enzoB, 8, { to: [u.paulMercier] }],
  ["Fait", "Acheter trois échiquiers", u.enzoB, 60],
]);

board("verger-conservatoire", [
  [
    "À faire",
    "Commander quarante porte-greffes",
    u.camillePetit,
    12,
    { to: [u.paulMercier], due: dateIn(3) },
  ],
  [
    "À faire",
    "Préparer les étiquettes",
    u.camillePetit,
    8,
    { to: [u.alexRivera], due: dateIn(30) },
  ],
  [
    "En cours",
    "Cartographier les emplacements",
    u.paulMercier,
    15,
    { to: [u.mathildeD] },
  ],
  [
    "En attente",
    "Réponse de la pépinière pour les variétés rares",
    u.paulMercier,
    20,
  ],
  ["Fait", "Obtenir l'accord de l'agriculteur", u.camillePetit, 150],
  ["Fait", "Choisir les quarante variétés", u.paulMercier, 100],
]);

board("atelier-couture-solidaire", [
  [
    "À faire",
    "Trier les boutons et les fils",
    u.annickR,
    4,
    { to: [u.oceaneL] },
  ],
  [
    "En cours",
    "Réviser les trois machines données",
    u.annickR,
    8,
    { to: [u.annickR, u.amelieVasseur] },
  ],
  ["Fait", "Installer la table de coupe", u.annickR, 38],
]);

board("fresques-sonores", [
  ["Fait", "Enregistrer les six balades", u.marcLeroy, 200],
  [
    "Fait",
    "Imprimer les cartes papier",
    u.marcLeroy,
    100,
    { to: [u.marcLeroy] },
  ],
  ["Fait", "Les déposer à la médiathèque", u.baptisteN, 60],
]);

board("nettoyage-des-berges", [
  [
    "À faire",
    "Louer un caisson à déchets",
    u.alexRivera,
    5,
    { to: [u.paulMercier], due: dateIn(5) },
  ],
  [
    "À faire",
    "Prévenir l'association de pêche",
    u.alexRivera,
    6,
    { to: [u.alexRivera] },
  ],
  [
    "En cours",
    "Peser et trier la collecte",
    u.mathildeD,
    4,
    { to: [u.mathildeD, u.oceaneL] },
  ],
  ["Fait", "Organiser la première sortie", u.alexRivera, 14],
]);

board("cours-de-code-pour-aines", [
  [
    "À faire",
    "Reconditionner trois portables",
    u.nadiaK,
    4,
    { to: [u.hugoLemaire], due: dateIn(10) },
  ],
  [
    "En cours",
    "Préparer le support de la séance 2",
    u.nadiaK,
    3,
    { to: [u.nadiaK, u.claraMartinez] },
  ],
  ["Fait", "Réserver la salle de la médiathèque", u.nadiaK, 9],
]);
