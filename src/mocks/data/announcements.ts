import { announcementSchema, type Announcement } from "@/domain";
import type { DbUser } from "../db";
import { daysAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

function announcement(
  slug: string,
  author: DbUser,
  publishedDaysAgo: number,
  title: string,
  body: string,
  pinned = false,
): Announcement {
  const project = PROJECT_BY_SLUG.get(slug);
  if (!project) throw new Error(`Projet inconnu dans le jeu de demo : ${slug}`);
  return announcementSchema.parse({
    id: nextId(),
    projectId: project.id,
    authorId: author.id,
    title,
    body,
    pinned,
    publishedAt: daysAgo(publishedDaysAgo),
  });
}

/**
 * R-A1 : les annonces sont écrites par un porteur ou un co-porteur. R-A2 :
 * une seule annonce épinglée par projet. Les annonces les plus récentes
 * d'un projet sont les plus anciennes dans le tableau : l'ordre d'affichage
 * est de toute façon décidé par le handler.
 */
export const ANNOUNCEMENTS: Announcement[] = [
  // Fresque murale collaborative
  announcement(
    "fresque-murale-collaborative",
    u.alexRivera,
    3,
    "On a l'accord de la mairie",
    "Le service technique nous laisse le mur nord et la nacelle jusqu'à l'été prochain. On commence samedi 19, rendez-vous à 9 h devant le gymnase. Apportez de vieux vêtements.",
    true,
  ),
  announcement(
    "fresque-murale-collaborative",
    u.alexRivera,
    11,
    "Il nous manque quelqu'un pour la photo",
    "On voudrait garder une trace de chaque samedi. Pas besoin de matériel pro.",
  ),
  announcement(
    "fresque-murale-collaborative",
    u.marcLeroy,
    34,
    "Le premier panneau est fini",
    "Quatre samedis, vingt-trois personnes différentes, onze pots de peinture. Le premier panneau, celui de la forêt, est terminé. Merci à tous, et en particulier aux enfants de l'école qui ont refusé de rentrer déjeuner.",
  ),
  announcement(
    "fresque-murale-collaborative",
    u.alexRivera,
    62,
    "Les couleurs sont choisies",
    "Après un vote un peu agité : un rose bonbon, un orange brûlé, un jaune d'œuf, un vert pomme. Le bleu ciel a perdu de justesse. On peut toujours en mettre un peu dans les nuages.",
  ),

  // Jardin partagé
  announcement(
    "jardin-partage-derriere-lecole",
    u.camillePetit,
    4,
    "Le planning d'arrosage de septembre",
    "Les nuits restent douces, on arrose un jour sur deux, le matin. Le tableau est affiché dans la cabane. Si vous partez, échangez votre créneau, ne le laissez pas vide.",
    true,
  ),
  announcement(
    "jardin-partage-derriere-lecole",
    u.paulMercier,
    19,
    "Récolte des courges samedi",
    "Les courges sont prêtes, certaines pèsent plus lourd que les enfants. Venez avec des sacs solides. On garde les plus belles pour la fête de l'école.",
  ),
  announcement(
    "jardin-partage-derriere-lecole",
    u.camillePetit,
    75,
    "Le composteur a un mode d'emploi",
    "Après trois semaines de mystères, le composteur a enfin une affiche : ce qui va dedans, ce qui n'y va pas (les agrumes, les restes de viande), et qui retourne le tas.",
  ),

  // Marée basse
  announcement(
    "maree-basse-jeu-video",
    u.nadiaK,
    1,
    "Le prototype tourne à 60 images par seconde",
    "Plus de saccades dans la baie, même avec les trente poissons à l'écran. Le niveau 2 est le prochain gros chantier. Le prototype jouable est disponible pour les membres de l'équipe, les testeurs externes arrivent après.",
    true,
  ),
  announcement(
    "maree-basse-jeu-video",
    u.enzoB,
    9,
    "Les décors du niveau 2 sont en route",
    "Trois épaves, une grotte, un champ d'algues à traverser sans se faire repérer. On a gardé la palette du niveau 1 mais on joue sur la lumière. Les croquis sont dans les fichiers du projet.",
  ),
  announcement(
    "maree-basse-jeu-video",
    u.nadiaK,
    28,
    "On cherche des testeurs",
    "Dès que le niveau 2 est stable, on cherche des personnes pour y jouer et nous dire honnêtement où elles s'ennuient. Pas besoin de savoir jouer, au contraire.",
  ),

  // Repair café
  announcement(
    "repair-cafe-du-mois",
    u.thomasDupont,
    2,
    "Prochaine session le samedi 3 octobre",
    "Apportez ce qui grince, ce qui ne s'allume plus, ou ce qui prend la poussière. On regarde tout. Nous avons maintenant une table dédiée aux petits appareils électriques.",
    true,
  ),
  announcement(
    "repair-cafe-du-mois",
    u.julienGarnier,
    38,
    "Bilan de la session d'août : 27 objets, 19 réparés",
    "Un grille-pain, trois lampes, un fauteuil roulant, une machine à café italienne qui a eu une seconde vie. Les huit échecs nous ont appris quelque chose, c'est ce qui compte.",
  ),
  announcement(
    "repair-cafe-du-mois",
    u.thomasDupont,
    8,
    "Merci à tous pour la session de septembre",
    "Trente et un objets, vingt-deux réparés, et une file d'attente jusque dans le couloir. Merci à Julien qui a sauvé une machine à coudre de 1962.",
  ),
  announcement(
    "repair-cafe-du-mois",
    u.thomasDupont,
    95,
    "On cherche des fers à souder",
    "Deux fers pour dix bénévoles, c'est un peu court. Si vous en avez un qui dort dans un tiroir, il sera bien accueilli.",
  ),

  // Soupe
  announcement(
    "distribution-de-soupe-lhiver",
    u.annickR,
    6,
    "La reprise est fixée au mardi 3 novembre",
    "Les trois soirs habituels : mardi, jeudi, dimanche. On se retrouve le dimanche 25 octobre à la salle paroissiale pour faire le point et répartir les tournées.",
    true,
  ),
  announcement(
    "distribution-de-soupe-lhiver",
    u.amelieVasseur,
    31,
    "Merci au marché",
    "Quatre commerçants nous donnent désormais leurs invendus chaque samedi matin. On gère le stockage dans le frigo de la salle paroissiale. Il manque encore quelqu'un pour le transport.",
  ),
  announcement(
    "distribution-de-soupe-lhiver",
    u.annickR,
    120,
    "Bilan de l'hiver dernier",
    "5 800 repas servis en cinq mois. Une soixantaine de bénévoles. Beaucoup de conversations. On recommence.",
  ),

  // Ciné-club
  announcement(
    "cine-club-de-quartier",
    u.annickR,
    5,
    "Le film d'octobre est choisi",
    "Vous avez voté : ce sera *Les Parapluies de Cherbourg*, le dimanche 11 octobre à 17 h. Gâteaux bienvenus, parapluies tolérés.",
    true,
  ),
  announcement(
    "cine-club-de-quartier",
    u.annickR,
    36,
    "Séance d'été en plein air",
    "Pour la séance de septembre, on sort le drap blanc dans la cour. Dix-huit spectateurs, un moustique, aucune dispute sur la fin du film.",
  ),

  // Podcast
  announcement(
    "podcast-des-metiers-oublies",
    u.lisaMoreau,
    8,
    "L'épisode 6 est en ligne",
    "On y rencontre Gisèle, qui a réparé des parapluies pendant quarante-deux ans. Vingt-deux minutes. Elle raconte le geste exact pour redresser une baleine tordue.",
    true,
  ),
  announcement(
    "podcast-des-metiers-oublies",
    u.lisaMoreau,
    41,
    "Un tuto pour nos futurs enregistrements",
    "On a rédigé un petit guide : comment poser un micro, quoi demander, comment rester discret. Si vous voulez enregistrer quelqu'un, il est dans les fichiers du projet.",
  ),

  // Langues
  announcement(
    "cours-de-langue-par-echange",
    u.claraMartinez,
    7,
    "Repas des langues samedi 26",
    "On se retrouve à 12 h 30, chacun apporte un plat de chez lui. Règle du jour : on ne parle que la langue qu'on apprend.",
    true,
  ),
  announcement(
    "cours-de-langue-par-echange",
    u.claraMartinez,
    52,
    "On cherche du portugais",
    "Quatre personnes veulent apprendre le portugais, personne ne le parle encore dans le groupe. Si c'est toi, on t'attend.",
  ),

  // Console rétro
  announcement(
    "console-retro-en-bois",
    u.enzoB,
    10,
    "La soudure est terminée",
    "Merci à Julien : les deux joysticks et les huit boutons répondent correctement. Reste l'ébénisterie et le choix des jeux.",
    true,
  ),
  announcement(
    "console-retro-en-bois",
    u.enzoB,
    33,
    "Les premiers plans",
    "Voici la première version du plan de découpe, pour une borne de 1,70 m. N'hésitez pas à critiquer.",
  ),

  // Album
  announcement(
    "album-de-reprises-au-local",
    u.marcLeroy,
    4,
    "Répétition jeudi à 19 h 30",
    "On enregistre les pistes de basse et de voix pour *Sunday Morning*. Pensez à apporter un câble de rechange.",
    true,
  ),
  announcement(
    "album-de-reprises-au-local",
    u.baptisteN,
    29,
    "Liste des huit morceaux",
    "La liste est figée : cinq reprises, trois morceaux à nous. Il manque un batteur sur trois titres, on cherche.",
  ),

  // Bowl
  announcement(
    "remise-en-etat-du-bowl",
    u.yanisF,
    6,
    "Chantier samedi, de 9 h à 13 h",
    "On finit les deux dernières fissures et on commence à poncer. Gants et masques obligatoires, nous en prêtons.",
    true,
  ),
  announcement(
    "remise-en-etat-du-bowl",
    u.yanisF,
    41,
    "La mairie dit oui, avec conditions",
    "On peut intervenir sur le bowl, à condition de baliser le chantier et de laisser le skatepark ouvert le reste du temps. C'est faisable.",
  ),

  // Bancs
  announcement(
    "carte-des-bancs-publics",
    u.alexRivera,
    4,
    "72 bancs recensés, il en reste beaucoup",
    "On a fini le quartier nord. Le centre-ville commence samedi. Pensez à noter l'orientation et l'ombre : c'est ce que les élus nous demanderont.",
    true,
  ),
  announcement(
    "carte-des-bancs-publics",
    u.alexRivera,
    20,
    "Comment relever un banc",
    "Une photo de face, une photo de la vue, la position GPS, un mot sur l'ambiance. Le modèle de fiche est dans les fichiers du projet.",
  ),

  // Chorale
  announcement(
    "chorale-improvisee-du-mardi",
    u.claraMartinez,
    3,
    "Ce mardi : un chant géorgien",
    "Baptiste nous apprend un chant à trois voix que personne ne maîtrise. Venez, même sans l'entendre : on le chantera mal ensemble.",
    true,
  ),
  announcement(
    "chorale-improvisee-du-mardi",
    u.baptisteN,
    47,
    "On change de salle à partir d'octobre",
    "La salle Jean-Moulin est réservée par un club de judo le mardi. On passe dans la salle des fêtes, même heure, même tisane.",
  ),

  // Refuge à hérissons (terminé)
  announcement(
    "refuge-a-herissons",
    u.camillePetit,
    35,
    "Le projet est terminé",
    "Les vingt abris sont posés, quatre sont déjà habités. Le suivi continue avec les propriétaires. Les plans restent disponibles pour que d'autres en construisent.",
    true,
  ),
  announcement(
    "refuge-a-herissons",
    u.mathildeD,
    90,
    "Quelques conseils pour votre jardin",
    "Laissez un coin sauvage, évitez les granulés anti-limaces, installez un petit bol d'eau. Ce sont les plus simples et les plus efficaces.",
  ),

  // Bibliothèque de rue (archivé)
  announcement(
    "bibliotheque-de-rue",
    u.annickR,
    190,
    "Les trois boîtes sont installées",
    "Arrêt Gambetta, arrêt de la Poste, arrêt du collège. Elles se remplissent toutes seules, on y a trouvé des polars, des BD et un manuel de comptabilité 1998.",
    true,
  ),

  // Vélo-école
  announcement(
    "velo-ecole-pour-adultes",
    u.yanisF,
    5,
    "Séance du samedi : nouveaux horaires",
    "À partir de ce samedi, on commence à 9 h 30 au lieu de 10 h. Le parking du stade est occupé par un marché de producteurs l'après-midi.",
    true,
  ),
  announcement(
    "velo-ecole-pour-adultes",
    u.yanisF,
    44,
    "Une élève roule seule !",
    "Mireille, 52 ans, a fait le tour du stade sans personne derrière elle. On a pleuré un peu. Merci à tous ceux qui l'ont accompagnée.",
  ),

  // Fanzine
  announcement(
    "fanzine-du-lycee",
    u.lisaMoreau,
    9,
    "Thème du prochain numéro",
    "« Ce qu'on a perdu cet été ». Textes, dessins, photos : on attend vos propositions avant le 30 septembre.",
    true,
  ),
  announcement(
    "fanzine-du-lycee",
    u.claraMartinez,
    52,
    "Le numéro 3 est imprimé",
    "200 exemplaires, vingt pages. On les distribue au CDI et à la cantine. Les reportages sur la cantine ont rendu certains profs un peu nerveux.",
  ),

  // Repair vélo mobile
  announcement(
    "repair-velo-mobile",
    u.thomasDupont,
    12,
    "La remorque roule",
    "Le prototype est monté, il porte 40 kg d'outils sans broncher. Prochaine étape : le coffre étanche et l'autocollant.",
    true,
  ),

  // Échecs
  announcement(
    "club-dechecs-du-mercredi",
    u.enzoB,
    7,
    "Tournoi interne le 7 octobre",
    "Format à la ronde, quatre parties de 15 minutes chacune. Les débutants jouent entre eux d'abord. Inscription sur place, le mercredi.",
    true,
  ),
  announcement(
    "club-dechecs-du-mercredi",
    u.enzoB,
    40,
    "Des pendules pour tout le monde",
    "Grâce aux dons, on a maintenant huit pendules en état de marche. Si vous en avez une qui retarde mais qui marche, venez avec.",
  ),

  // Verger
  announcement(
    "verger-conservatoire",
    u.camillePetit,
    10,
    "Plantation du 17 octobre",
    "Quarante porte-greffes arrivent de la pépinière. On plantera de 9 h à 15 h, un greffeur du coin nous accompagne toute la journée.",
    true,
  ),
  announcement(
    "verger-conservatoire",
    u.paulMercier,
    58,
    "Les greffes de printemps ont pris",
    "Vingt-neuf greffes sur trente-cinq ont repris. C'est bien plus que prévu. On en refera dès février prochain, avec des variétés qu'on ne connaissait pas.",
  ),

  // Couture
  announcement(
    "atelier-couture-solidaire",
    u.annickR,
    6,
    "Atelier mercredi 16, de 14 h à 18 h",
    "On traite d'abord les retouches urgentes, puis on ouvre pour des projets plus longs. Pensez à apporter vos boutons orphelins.",
    true,
  ),
  announcement(
    "atelier-couture-solidaire",
    u.annickR,
    30,
    "Merci aux donateurs de machines",
    "Trois machines nous ont été données ce mois-ci. On les révise avant de les prêter.",
  ),

  // Fresques sonores (terminé)
  announcement(
    "fresques-sonores",
    u.marcLeroy,
    50,
    "Les six balades sont en ligne",
    "Le projet est terminé. Les cartes papier sont à la médiathèque et au café du coin. Merci à tous pour les sons, les voix, les silences.",
    true,
  ),

  // Berges
  announcement(
    "nettoyage-des-berges",
    u.alexRivera,
    4,
    "Prochaine sortie le samedi 3 octobre",
    "On part du pont Neuf à 9 h, on remonte jusqu'à l'écluse. Gants et sacs fournis, bottes conseillées. Les enfants sont les bienvenus.",
    true,
  ),
  announcement(
    "nettoyage-des-berges",
    u.alexRivera,
    9,
    "Bilan de la première sortie",
    "Quatorze kilos de plastique, trois vélos, un caddie et un frigo. On a pesé, trié et photographié. Résultats dans les fichiers.",
  ),

  // Code pour aînés
  announcement(
    "cours-de-code-pour-aines",
    u.nadiaK,
    5,
    "Prochaine séance mercredi 16 à la médiathèque",
    "Une heure, quatre ordinateurs, des questions réelles. La première séance a réuni sept personnes. Apportez le vôtre si vous en avez un. Si vous n'en avez pas, c'est aussi très bien.",
    true,
  ),
];
