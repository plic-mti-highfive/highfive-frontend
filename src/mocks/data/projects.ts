import {
  projectSchema,
  type Need,
  type Participation,
  type Project,
  type ProjectState,
  type Visibility,
} from "@/domain";
import { daysAgo, hoursAgo, nextId } from "./ids";
import * as u from "./users";

function need(label: string, tagId?: string, fulfilled = false): Need {
  return { id: nextId(), label, tagId, fulfilled };
}

interface ProjectSeed {
  title: string;
  slug: string;
  tagline: string;
  description?: string;
  tags: string[];
  needs?: Need[];
  visibility: Visibility;
  participation: Participation;
  state: ProjectState;
  ownerId: string;
  highfiveCount: number;
  createdDaysAgo: number;
  lastActivityHoursAgo: number;
}

/**
 * 25 projets (doc 23 §2 : les 18 premiers reprennent le tableau au mot pres ;
 * 19 a 25 sont ajoutes dans le meme ton pour atteindre la volumetrie demandee
 * par le lot — ecart documente dans le rapport final).
 *
 * Projet #10 est passe en variante privee (participation sur_invitation)
 * pour servir de demonstration de l'ecran 403, comme demande par le doc.
 */
const SEEDS: ProjectSeed[] = [
  {
    title: "Fresque murale collaborative",
    slug: "fresque-murale-collaborative",
    tagline:
      "On repeint Tableau blanc du gymnase avec les habitants du quartier, un samedi par mois.",
    tags: ["dessin", "quartier"],
    needs: [
      need("quelqu'un pour la photo", "photo"),
      need("un coup de main le samedi"),
    ],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.alexRivera.id,
    highfiveCount: 63,
    createdDaysAgo: 90,
    lastActivityHoursAgo: 3,
  },
  {
    title: "Jardin partagé derrière l'école",
    slug: "jardin-partage-derriere-lecole",
    tagline: "Six bacs, vingt familles, et un composteur qui fonctionne enfin.",
    tags: ["jardinage", "quartier"],
    needs: [need("quelqu'un qui s'y connaît en arrosage", "jardinage")],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.camillePetit.id,
    highfiveCount: 41,
    createdDaysAgo: 240,
    lastActivityHoursAgo: 20,
  },
  {
    title: "Marée basse, jeu vidéo",
    slug: "maree-basse-jeu-video",
    tagline:
      "Un petit jeu d'exploration sous-marine, fait à quatre, sans budget.",
    tags: ["jeu-video", "dessin", "musique"],
    needs: [
      need("quelqu'un pour la musique", "musique"),
      need("un dev Godot", "code"),
    ],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.nadiaK.id,
    highfiveCount: 76,
    createdDaysAgo: 40,
    lastActivityHoursAgo: 1,
  },
  {
    title: "Repair café du mois",
    slug: "repair-cafe-du-mois",
    tagline:
      "On répare grille-pains, vélos et lampes le premier samedi. Gratuit.",
    tags: ["reparation", "solidarite"],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.thomasDupont.id,
    highfiveCount: 54,
    createdDaysAgo: 320,
    lastActivityHoursAgo: 48,
  },
  {
    title: "Distribution de soupe l'hiver",
    slug: "distribution-de-soupe-lhiver",
    tagline: "Trois soirs par semaine, de novembre à mars, devant la gare.",
    tags: ["solidarite"],
    needs: [need("des bras le mardi")],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.annickR.id,
    highfiveCount: 48,
    createdDaysAgo: 260,
    lastActivityHoursAgo: 30,
  },
  {
    title: "Ciné-club de quartier",
    slug: "cine-club-de-quartier",
    tagline:
      "Un film par mois dans la salle des fêtes, choisi par ceux qui viennent.",
    tags: ["spectacle", "quartier"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.sophieMartin.id,
    highfiveCount: 35,
    createdDaysAgo: 150,
    lastActivityHoursAgo: 72,
  },
  {
    title: "Podcast des métiers oubliés",
    slug: "podcast-des-metiers-oublies",
    tagline: "On enregistre ceux qui font des métiers qui disparaissent.",
    tags: ["ecriture", "histoire"],
    needs: [need("quelqu'un pour le montage son", "musique")],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.lisaMoreau.id,
    highfiveCount: 19,
    createdDaysAgo: 70,
    lastActivityHoursAgo: 96,
  },
  {
    title: "Cours de langue par échange",
    slug: "cours-de-langue-par-echange",
    tagline:
      "Une heure de français contre une heure d'arabe, d'espagnol ou d'ukrainien.",
    tags: ["langues", "entraide-scolaire"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.claraMartinez.id,
    highfiveCount: 31,
    createdDaysAgo: 200,
    lastActivityHoursAgo: 50,
  },
  {
    title: "Console rétro en bois",
    slug: "console-retro-en-bois",
    tagline: "Une borne d'arcade construite de zéro, avec les moyens du bord.",
    tags: ["bricolage", "jeu-video"],
    needs: [need("quelqu'un qui sait souder", "bricolage")],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.enzoB.id,
    highfiveCount: 28,
    createdDaysAgo: 55,
    lastActivityHoursAgo: 40,
  },
  {
    title: "Album de reprises au local",
    slug: "album-de-reprises-au-local",
    tagline:
      "On enregistre huit morceaux avant l'été, dans le local de répétition.",
    tags: ["musique"],
    needs: [need("un batteur", "musique")],
    // Variante privee de demonstration (doc 23) : force on_invite (R-PR1).
    visibility: "private",
    participation: "on_invite",
    state: "active",
    ownerId: u.marcLeroy.id,
    highfiveCount: 22,
    createdDaysAgo: 65,
    lastActivityHoursAgo: 12,
  },
  {
    title: "Remise en état du bowl",
    slug: "remise-en-etat-du-bowl",
    tagline: "Le skatepark se fissure. On rebouche, on ponce, on repeint.",
    tags: ["sport", "bricolage"],
    needs: [need("du béton et quelqu'un qui sait le poser", "bricolage")],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.yanisF.id,
    highfiveCount: 26,
    createdDaysAgo: 85,
    lastActivityHoursAgo: 60,
  },
  {
    title: "Carte des bancs publics",
    slug: "carte-des-bancs-publics",
    tagline:
      "On recense tous les bancs de la ville, leur état, et ceux qui manquent.",
    tags: ["quartier", "sciences"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.alexRivera.id,
    highfiveCount: 17,
    createdDaysAgo: 35,
    lastActivityHoursAgo: 100,
  },
  {
    title: "Chorale improvisée du mardi",
    slug: "chorale-improvisee-du-mardi",
    tagline: "Pas d'audition, pas de partition, juste le mardi à 19 h.",
    tags: ["musique", "evenement"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.claraMartinez.id,
    highfiveCount: 12,
    createdDaysAgo: 100,
    lastActivityHoursAgo: 24,
  },
  {
    title: "Refuge à hérissons",
    slug: "refuge-a-herissons",
    tagline: "Vingt abris construits et posés dans les jardins du quartier.",
    tags: ["animaux", "jardinage"],
    visibility: "public",
    participation: "open",
    state: "done",
    ownerId: u.camillePetit.id,
    highfiveCount: 23,
    createdDaysAgo: 260,
    lastActivityHoursAgo: 700,
  },
  {
    title: "Bibliothèque de rue",
    slug: "bibliotheque-de-rue",
    tagline:
      "Trois boîtes à livres fabriquées et installées près des arrêts de bus.",
    tags: ["ecriture", "quartier"],
    visibility: "public",
    participation: "open",
    state: "archived",
    ownerId: u.lisaMoreau.id,
    highfiveCount: 15,
    createdDaysAgo: 400,
    lastActivityHoursAgo: 4500,
  },
  {
    title: "Atelier sérigraphie",
    slug: "atelier-serigraphie",
    tagline: "Idée en cours de rédaction.",
    tags: ["dessin"],
    // Brouillon (R-PR2) : visible du seul porteur, quelle que soit la visibilite.
    visibility: "private",
    participation: "on_invite",
    state: "draft",
    ownerId: u.sophieMartin.id,
    highfiveCount: 0,
    createdDaysAgo: 2,
    lastActivityHoursAgo: 20,
  },
  {
    title: "Vélo-école pour adultes",
    slug: "velo-ecole-pour-adultes",
    tagline: "Apprendre à pédaler à 40 ans, sans se sentir ridicule.",
    tags: ["sport", "solidarite"],
    needs: [need("des vélos à prêter")],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.yanisF.id,
    highfiveCount: 37,
    createdDaysAgo: 130,
    lastActivityHoursAgo: 15,
  },
  {
    title: "Fanzine du lycée",
    slug: "fanzine-du-lycee",
    tagline: "Vingt pages par trimestre, écrites et imprimées par les élèves.",
    tags: ["ecriture", "dessin"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.lisaMoreau.id,
    highfiveCount: 21,
    createdDaysAgo: 110,
    lastActivityHoursAgo: 33,
  },
  {
    title: "Repair vélo mobile",
    slug: "repair-velo-mobile",
    tagline:
      "Une remorque a outils qui va reparer les velos ou ils sont laisses a l'abandon.",
    tags: ["bricolage", "solidarite"],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.thomasDupont.id,
    highfiveCount: 9,
    createdDaysAgo: 20,
    lastActivityHoursAgo: 80,
  },
  {
    title: "Club d'échecs du mercredi",
    slug: "club-dechecs-du-mercredi",
    tagline:
      "Des tables pliantes, des pendules qui retardent, et personne ne s'en plaint.",
    tags: ["jeux", "evenement"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.enzoB.id,
    highfiveCount: 14,
    createdDaysAgo: 75,
    lastActivityHoursAgo: 18,
  },
  {
    title: "Verger conservatoire",
    slug: "verger-conservatoire",
    tagline:
      "On plante des variétés anciennes avant qu'elles ne disparaissent pour de bon.",
    tags: ["jardinage", "environnement"],
    needs: [need("quelqu'un qui connaît la greffe", "jardinage")],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.camillePetit.id,
    highfiveCount: 20,
    createdDaysAgo: 160,
    lastActivityHoursAgo: 90,
  },
  {
    title: "Atelier couture solidaire",
    slug: "atelier-couture-solidaire",
    tagline: "On répare et on retouche gratuitement, un mercredi sur deux.",
    tags: ["bricolage", "solidarite"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.annickR.id,
    highfiveCount: 11,
    createdDaysAgo: 45,
    lastActivityHoursAgo: 65,
  },
  {
    title: "Fresques sonores",
    slug: "fresques-sonores",
    tagline:
      "Six balades enregistrées dans le quartier, a ecouter en marchant.",
    tags: ["musique", "quartier"],
    visibility: "public",
    participation: "open",
    state: "done",
    ownerId: u.marcLeroy.id,
    highfiveCount: 30,
    createdDaysAgo: 220,
    lastActivityHoursAgo: 1200,
  },
  {
    title: "Nettoyage des berges",
    slug: "nettoyage-des-berges",
    tagline: "Deux samedis par saison, des gants, et beaucoup de mégots.",
    tags: ["environnement", "quartier"],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.alexRivera.id,
    highfiveCount: 8,
    createdDaysAgo: 15,
    lastActivityHoursAgo: 200,
  },
  {
    title: "Cours de code pour aînés",
    slug: "cours-de-code-pour-aines",
    tagline: "Une heure par semaine pour dérider un ordinateur, sans jargon.",
    tags: ["code", "entraide-scolaire"],
    visibility: "public",
    participation: "on_request",
    state: "active",
    ownerId: u.nadiaK.id,
    highfiveCount: 6,
    createdDaysAgo: 10,
    lastActivityHoursAgo: 55,
  },
];

export const PROJECTS: Project[] = SEEDS.map((seed) =>
  projectSchema.parse({
    id: nextId(),
    slug: seed.slug,
    title: seed.title,
    tagline: seed.tagline,
    description: seed.description,
    tags: seed.tags,
    needs: seed.needs ?? [],
    visibility: seed.visibility,
    participation: seed.participation,
    state: seed.state,
    ownerId: seed.ownerId,
    highfiveCount: seed.highfiveCount,
    createdAt: daysAgo(seed.createdDaysAgo),
    updatedAt: hoursAgo(seed.lastActivityHoursAgo),
    lastActivityAt: hoursAgo(seed.lastActivityHoursAgo),
  }),
);

export const PROJECT_BY_SLUG = new Map(
  PROJECTS.map((project) => [project.slug, project]),
);

/** "Projet du moment" (doc 23) : Marée basse, 76 highfives sur 7 jours. */
export const PROJECT_OF_THE_MOMENT = PROJECT_BY_SLUG.get(
  "maree-basse-jeu-video",
)!;
