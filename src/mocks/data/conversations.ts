import {
  conversationSchema,
  messageSchema,
  type Conversation,
  type Message,
  type MessageAttachment,
} from "@/domain";
import type { DbUser } from "../db";
import { fileOf } from "./files";
import { daysAgo, hoursAgo, nextId } from "./ids";
import { MEMBERSHIPS } from "./memberships";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

const fresque = PROJECT_BY_SLUG.get("fresque-murale-collaborative")!;
const maree = PROJECT_BY_SLUG.get("maree-basse-jeu-video")!;
const album = PROJECT_BY_SLUG.get("album-de-reprises-au-local")!;

/** R-MSG3 : un canal miroite l'équipe du projet (tous les rôles). */
function teamIds(projectId: string): string[] {
  return MEMBERSHIPS.filter((m) => m.projectId === projectId).map(
    (m) => m.userId,
  );
}

export const CONVERSATIONS: Conversation[] = [];
export const MESSAGES: Message[] = [];

function create(input: Omit<Conversation, "id">): Conversation {
  const conversation = conversationSchema.parse({ id: nextId(), ...input });
  CONVERSATIONS.push(conversation);
  return conversation;
}

function direct(a: DbUser, b: DbUser, createdAt: string): Conversation {
  return create({ type: "direct", participantIds: [a.id, b.id], createdAt });
}

interface LineOptions {
  attachment?: MessageAttachment;
  edited?: boolean;
  deleted?: boolean;
  /** Force la liste de lecture (une demande de message jamais ouverte, par exemple). */
  readBy?: string[];
}

/** [auteur, il y a N heures, texte, options]. */
type Line = [author: DbUser, ago: number, body: string, options?: LineOptions];

const ALL_READ_AFTER_HOURS = 36;

/**
 * Chaque message est lu par son auteur, par ceux qui ont répondu depuis, et
 * par toute la conversation au bout d'un jour et demi. Seuls les derniers
 * messages restent non lus (badges de la liste, séparateur « non lus »).
 */
function talk(conversation: Conversation, lines: Line[]): void {
  lines.forEach(([author, ago, body, options], index) => {
    if (!conversation.participantIds.includes(author.id))
      throw new Error(
        `${author.username} ne participe pas à cette conversation`,
      );
    const laterAuthors = lines
      .slice(index + 1)
      .filter(([, laterAgo]) => laterAgo < ago)
      .map(([laterAuthor]) => laterAuthor.id);
    const readBy =
      options?.readBy ??
      (ago >= ALL_READ_AFTER_HOURS
        ? conversation.participantIds
        : [author.id, ...laterAuthors]);
    const sentAt = hoursAgo(ago);
    MESSAGES.push(
      messageSchema.parse({
        id: nextId(),
        conversationId: conversation.id,
        authorId: author.id,
        body: options?.deleted ? "" : body,
        attachment: options?.attachment,
        readBy: [...new Set(readBy)],
        sentAt,
        editedAt: options?.edited
          ? new Date(new Date(sentAt).getTime() + 4 * 60 * 1000).toISOString()
          : undefined,
        deleted: options?.deleted ?? false,
      }),
    );
  });
}

const sharedFile = (slug: string, name: string): MessageAttachment => ({
  kind: "file",
  fileId: fileOf(slug, name).id,
});

const sharedProject = (projectId: string): MessageAttachment => ({
  kind: "project",
  projectId,
});

// --- Conversations d'alex.rivera --------------------------------------------

export const directSophie = direct(u.alexRivera, u.sophieMartin, daysAgo(14));
talk(directSophie, [
  [
    u.sophieMartin,
    330,
    "Salut Alex ! Je suis nouvelle ici. J'ai vu ta fresque, elle est géniale. Je peux aider ?",
  ],
  [
    u.alexRivera,
    328,
    "Bienvenue Sophie ! Viens samedi, on cherche justement quelqu'un pour les photos.",
  ],
  [u.sophieMartin, 326, "Parfait, j'apporte mon appareil."],
  [
    u.alexRivera,
    200,
    "Au fait, j'ai vu tes photos du mur : elles sont superbes.",
  ],
  [
    u.sophieMartin,
    198,
    "Merci, c'est ma façon de participer sans salir mes vêtements 😄",
  ],
  [u.sophieMartin, 6, "On se voit samedi pour la fresque ?"],
  [u.alexRivera, 3, "Oui, à samedi 9 h alors."],
]);

export const canalFresque = create({
  type: "channel",
  participantIds: teamIds(fresque.id),
  projectId: fresque.id,
  createdAt: fresque.createdAt,
});

export const directThomas = direct(u.alexRivera, u.thomasDupont, daysAgo(15));
talk(directThomas, [
  [
    u.thomasDupont,
    340,
    "Salut Alex, tu connais quelqu'un qui a un niveau laser ?",
  ],
  [u.alexRivera, 338, "Marc en a un, je lui demande."],
  [u.alexRivera, 336, "Il peut te le prêter jeudi."],
  [u.thomasDupont, 334, "Génial, merci."],
  [u.thomasDupont, 24, "Tu as les dimensions du mur ?"],
]);

export const canalMaree = create({
  type: "channel",
  participantIds: teamIds(maree.id),
  projectId: maree.id,
  createdAt: maree.createdAt,
});

export const groupeChorale = create({
  type: "group",
  title: "Chorale du mardi",
  participantIds: [u.claraMartinez.id, u.alexRivera.id, u.lisaMoreau.id],
  createdAt: daysAgo(60),
});
talk(groupeChorale, [
  [
    u.claraMartinez,
    1400,
    "J'ai créé ce groupe pour les messages pratiques : horaires, paroles, retards.",
  ],
  [u.lisaMoreau, 1398, "Parfait, merci."],
  [
    u.alexRivera,
    1390,
    "Je suis à peu près tous les mardis, sauf quand je repeins.",
  ],
  [u.lisaMoreau, 700, "Qui a la partition du canon ?"],
  [u.claraMartinez, 698, "Je l'ai, je la scanne."],
  [u.claraMartinez, 432, "on décale à 19 h 30 cette semaine"],
  [u.alexRivera, 430, "OK pour moi."],
  [
    u.lisaMoreau,
    100,
    "Qui vient mardi ? Je dois savoir si je prépare la tisane pour 8 ou pour 14.",
  ],
  [u.claraMartinez, 98, "On sera 11, d'après les réponses."],
  [u.alexRivera, 96, "Je ramène des biscuits."],
]);

export const directCamille = direct(u.alexRivera, u.camillePetit, daysAgo(40));
talk(directCamille, [
  [
    u.camillePetit,
    200,
    "Alex, tu as un peu de temps samedi pour m'aider à retourner le compost ?",
  ],
  [u.alexRivera, 198, "Oui, 10 h, je viens avec la fourche."],
  [u.camillePetit, 60, "Merci pour le compost, il est magnifique."],
  [u.alexRivera, 58, "Plus de terre que je pensais ! À la prochaine."],
]);

export const directAnnick = direct(u.alexRivera, u.annickR, daysAgo(30));
talk(directAnnick, [
  [
    u.annickR,
    450,
    "Alex, la mairie veut une petite note sur la fresque pour le journal municipal. 800 caractères max, tu peux ?",
  ],
  [u.alexRivera, 448, "Oui, je te l'envoie demain."],
  [
    u.alexRivera,
    420,
    "Voilà : « Chaque samedi, une cinquantaine d'habitants repeignent le mur du gymnase… »",
    { edited: true },
  ],
  [u.annickR, 410, "Parfait, merci. Une photo à joindre ?"],
  [u.alexRivera, 408, "Sophie en a de très bonnes, je lui demande."],
  [u.annickR, 40, "L'article est paru ce matin. Bravo !"],
]);

export const directMarc = direct(u.alexRivera, u.marcLeroy, daysAgo(60));
talk(directMarc, [
  [
    u.marcLeroy,
    150,
    "Je pars en studio mercredi, je serai peu joignable. Tu me dis ce que tu as pensé de la musique du niveau 1 ?",
  ],
  [u.alexRivera, 148, "Superbe. Surtout la boucle des profondeurs."],
  [u.marcLeroy, 146, "Merci ! J'en fais une variante plus lente."],
  [
    u.marcLeroy,
    12,
    "Tu as vu mon invitation pour l'album ? On a vraiment besoin d'un batteur.",
    { attachment: sharedProject(album.id) },
  ],
]);

/** R-MSG7 : demandes de message, sans réponse d'alex pour l'instant. */
export const messageRequestYanis = direct(u.yanisF, u.alexRivera, hoursAgo(20));
talk(messageRequestYanis, [
  [
    u.yanisF,
    20,
    "Salut, je peux filer un coup de main sur la fresque, tu gères l'équipe ?",
    { readBy: [] },
  ],
]);

export const messageRequestNadia = direct(u.nadiaK, u.alexRivera, hoursAgo(30));
talk(messageRequestNadia, [
  [
    u.nadiaK,
    30,
    "Dis, tu highfiverais Marée basse si tu testes le prototype ?",
    { readBy: [] },
  ],
]);

export const messageRequestHugo = direct(
  u.hugoLemaire,
  u.alexRivera,
  hoursAgo(9),
);
talk(messageRequestHugo, [
  [
    u.hugoLemaire,
    9,
    "Salut, j'ai vu ta carte des bancs. Je fais du web, je peux proposer un coup de main pour la carte en ligne, si tu es d'accord.",
    { readBy: [] },
  ],
]);

// --- Un canal par projet (R-MSG3 : il miroite l'équipe) ----------------------

const CHANNEL_TALK: Record<string, Line[]> = {
  "jardin-partage-derriere-lecole": [
    [u.camillePetit, 200, "Récolte des courges samedi, qui est là ?"],
    [u.paulMercier, 198, "Moi, j'apporte la brouette."],
    [u.amelieVasseur, 190, "Je viens avec le petit, il adore les courges."],
    [u.mathildeD, 120, "Rappel : grillage anti-chats samedi prochain."],
    [u.camillePetit, 96, "Merci Mathilde ! Paul, tu as le grillage ?"],
    [u.paulMercier, 94, "Oui, je l'apporte."],
    [u.alexRivera, 50, "Je peux passer arroser demain matin."],
    [u.camillePetit, 8, "Merci Alex ! J'ai mis le planning à jour."],
  ],
  "repair-cafe-du-mois": [
    [
      u.thomasDupont,
      220,
      "Session du 3 octobre : qui est dispo pour l'accueil ?",
    ],
    [u.julienGarnier, 218, "Moi."],
    [u.yanisF, 210, "Moi aussi, mais je finis à 11 h."],
    [u.thomasDupont, 150, "Hugo, tu apportes ton fer à souder ? On en manque."],
    [u.hugoLemaire, 148, "Oui, deux même."],
    [
      u.alexRivera,
      100,
      "L'affiche est prête, je l'imprime ce week-end.",
      {
        attachment: sharedFile(
          "repair-cafe-du-mois",
          "affiche-session-octobre.pdf",
        ),
      },
    ],
    [u.thomasDupont, 99, "Parfait, merci !"],
    [u.enzoB, 30, "Je dépose une caisse de pièces détachées demain."],
  ],
  "distribution-de-soupe-lhiver": [
    [
      u.annickR,
      400,
      "Réunion de préparation le 25 octobre à la salle paroissiale. Merci de confirmer.",
    ],
    [u.claraMartinez, 398, "Présente."],
    [u.lisaMoreau, 396, "Présente aussi."],
    [
      u.amelieVasseur,
      300,
      "J'ai fait la liste des allergènes, elle est dans les fichiers.",
      {
        attachment: sharedFile(
          "distribution-de-soupe-lhiver",
          "liste-allergenes.pdf",
        ),
      },
    ],
    [u.karimHaddad, 100, "Je prends le jeudi soir dès novembre."],
    [u.annickR, 98, "Merci Karim !"],
  ],
  "cine-club-de-quartier": [
    [
      u.annickR,
      200,
      "Le vote est clos : « Les Parapluies de Cherbourg » gagne, 14 voix contre 9.",
    ],
    [u.yasmineT, 198, "Je fais l'affiche, avec un parapluie évidemment."],
    [u.lisaMoreau, 190, "Je m'occupe des gâteaux."],
    [
      u.baptisteN,
      150,
      "Je peux jouer un peu de piano avant la séance, si ça vous dit.",
    ],
    [u.annickR, 148, "Excellente idée !"],
    [
      u.yasmineT,
      20,
      "Brouillon de l'affiche dans les fichiers, dites-moi ce que vous en pensez.",
      {
        attachment: sharedFile(
          "cine-club-de-quartier",
          "affiche-octobre-brouillon.png",
        ),
      },
    ],
  ],
  "podcast-des-metiers-oublies": [
    [u.lisaMoreau, 300, "Épisode 6 monté. Je vous envoie le fichier."],
    [u.marcLeroy, 298, "J'écoute ce soir."],
    [
      u.marcLeroy,
      270,
      "Très bien. Juste un petit souffle vers la douzième minute, je le nettoie.",
    ],
    [
      u.karimHaddad,
      120,
      "Transcription de l'entretien avec Gisèle terminée.",
      {
        attachment: sharedFile(
          "podcast-des-metiers-oublies",
          "transcription-gisele.txt",
        ),
      },
    ],
    [
      u.paulMercier,
      100,
      "Mon grand-père est d'accord pour être enregistré. Il demande juste qu'on vienne avant 16 h, il fait la sieste.",
    ],
    [u.lisaMoreau, 98, "Parfait, on vient à 14 h."],
  ],
  "cours-de-langue-par-echange": [
    [u.claraMartinez, 150, "Repas des langues samedi 26 : qui apporte quoi ?"],
    [u.amelieVasseur, 148, "Je fais un tajine."],
    [u.karimHaddad, 140, "Du thé et des makrouts."],
    [u.annickR, 130, "Je m'occupe des boissons."],
    [u.yasmineT, 120, "Je fais des affiches avec « bonjour » en dix langues."],
    [u.claraMartinez, 118, "Parfait."],
  ],
  "console-retro-en-bois": [
    [u.enzoB, 300, "Les joysticks sont soudés, merci Julien !"],
    [
      u.julienGarnier,
      298,
      "Ça marche. Je regarde les panneaux latéraux samedi.",
    ],
    [
      u.hugoLemaire,
      200,
      "J'ai installé RetroPie sur la carte, deux jeux de test fonctionnent.",
    ],
    [u.nadiaK, 198, "Je vous passe mon shoot'em up moche."],
    [u.enzoB, 60, "Les boutons arrivent mardi. On assemble samedi."],
    [u.yanisF, 58, "Je viens avec la peinture."],
  ],
  "album-de-reprises-au-local": [
    [u.marcLeroy, 100, "Jeudi 19 h 30, titres 5 et 6."],
    [u.nadiaK, 98, "Je viens avec mon verre d'eau."],
    [u.baptisteN, 90, "Arrangement du 6 terminé, il est dans les fichiers."],
    [
      u.marcLeroy,
      40,
      "Démo du titre 5 déposée.",
      {
        attachment: sharedFile(
          "album-de-reprises-au-local",
          "demo-titre-5.mp3",
        ),
      },
    ],
    [u.nadiaK, 38, "Ça sonne bien !"],
  ],
  "remise-en-etat-du-bowl": [
    [u.yanisF, 150, "Chantier samedi 9 h. On finit les fissures 7 à 9."],
    [u.julienGarnier, 148, "Je viens avec le mortier."],
    [u.thomasDupont, 140, "J'apporte l'aspirateur de chantier."],
    [u.enzoB, 130, "Je tiens le balisage."],
    [u.alexRivera, 60, "Je serai là à 10 h, je termine ma fresque avant."],
    [u.yanisF, 58, "OK, à 10 h."],
  ],
  "carte-des-bancs-publics": [
    [
      u.alexRivera,
      150,
      "Le centre-ville commence samedi. Rendez-vous place de la Mairie à 9 h ?",
    ],
    [u.paulMercier, 148, "Oui."],
    [u.sophieMartin, 140, "Moi aussi, je prends l'appareil."],
    [u.oceaneL, 120, "Je peux faire la rue des Tanneurs, j'habite à côté."],
    [
      u.karimHaddad,
      100,
      "Je compile les relevés dans le tableur, merci d'utiliser le modèle.",
      {
        attachment: sharedFile(
          "carte-des-bancs-publics",
          "releves-quartier-nord.xlsx",
        ),
      },
    ],
    [u.alexRivera, 98, "Merci Karim !"],
  ],
  "chorale-improvisee-du-mardi": [
    [u.claraMartinez, 160, "Mardi : chant géorgien avec Baptiste."],
    [u.baptisteN, 158, "Prévenez vos voisins."],
    [
      u.lisaMoreau,
      150,
      "Les paroles de Dona nobis pacem sont dans les fichiers.",
    ],
    [u.oceaneL, 100, "Je viens pour la première fois !"],
    [u.annickR, 98, "Bienvenue ! On a de la tisane."],
    [u.claraMartinez, 20, "Je ne peux pas mardi, Baptiste, tu animes ?"],
    [u.baptisteN, 18, "Oui, pas de souci."],
  ],
  "refuge-a-herissons": [
    [u.camillePetit, 1100, "Le projet est terminé. Merci à tous !"],
    [u.mathildeD, 1098, "On continue le suivi avec les propriétaires."],
    [u.paulMercier, 1000, "Plans en ligne, comme promis."],
    [u.alexRivera, 900, "Bravo à tous."],
  ],
  "bibliotheque-de-rue": [
    [u.annickR, 4400, "Les trois boîtes sont en place."],
    [u.julienGarnier, 4398, "Je passe vérifier les charnières dans un mois."],
  ],
  "velo-ecole-pour-adultes": [
    [u.yanisF, 100, "Samedi 9 h 30, nouveau créneau."],
    [u.amelieVasseur, 98, "J'ai imprimé quatre fiches de suivi."],
    [u.thomasDupont, 90, "Deux vélos remis en état, dont un petit gabarit."],
    [u.julienGarnier, 88, "Le troisième demande une chaîne neuve."],
    [u.alexRivera, 50, "Je peux venir donner un coup de main samedi."],
    [u.yanisF, 48, "Avec plaisir."],
  ],
  "fanzine-du-lycee": [
    [u.lisaMoreau, 200, "Numéro 4 : thème « Ce qu'on a perdu cet été »."],
    [u.claraMartinez, 198, "Les élèves ont déjà quinze idées."],
    [
      u.yasmineT,
      100,
      "Voici la maquette de la couverture.",
      { attachment: sharedFile("fanzine-du-lycee", "maquette-numero-4.pdf") },
    ],
    [u.karimHaddad, 98, "Très réussi. Le titre se lit même en petit."],
    [u.lisaMoreau, 60, "On imprime le 5 octobre."],
  ],
  "repair-velo-mobile": [
    [u.thomasDupont, 180, "Le cadre est soudé, on passe aux rails."],
    [u.julienGarnier, 178, "Je prends les rails, j'ai du profilé alu."],
    [u.yanisF, 170, "Je peux fournir les vis."],
    [u.hugoLemaire, 100, "Pour le logo : une roue ou une clé ?"],
    [u.thomasDupont, 98, "Une roue clé, pourquoi pas les deux."],
  ],
  "club-dechecs-du-mercredi": [
    [u.enzoB, 150, "Tournoi le 7 octobre : inscriptions ouvertes."],
    [u.hugoLemaire, 148, "Je m'inscris, je perdrai avec dignité."],
    [u.paulMercier, 140, "Pendules réparées : trois sur huit."],
    [u.thomasDupont, 130, "Je m'inscris aussi."],
    [u.karimHaddad, 120, "Je viens avec mon jeu en bois."],
    [u.baptisteN, 100, "Je viens pour regarder."],
  ],
  "verger-conservatoire": [
    [u.camillePetit, 200, "Plantation le 17 octobre."],
    [u.paulMercier, 198, "Porte-greffes commandés, arrivée prévue le 14."],
    [u.mathildeD, 190, "J'ai repéré des variétés rares chez un voisin."],
    [
      u.julienGarnier,
      150,
      "Tuteurs en châtaignier : j'en ai plusieurs mètres.",
    ],
    [u.alexRivera, 100, "Je fais les étiquettes, quel format ?"],
    [u.paulMercier, 98, "Étiquettes en bois de 8 cm. Je t'envoie un modèle."],
  ],
  "atelier-couture-solidaire": [
    [u.annickR, 200, "Atelier mercredi 16. Les trois machines sont révisées."],
    [u.amelieVasseur, 198, "Je viens à 14 h."],
    [u.oceaneL, 150, "Je viens aussi, avec un pantalon à raccourcir."],
    [u.claraMartinez, 100, "Je ramène des boutons."],
    [u.yasmineT, 80, "Je passe avec une idée d'affiche."],
  ],
  "fresques-sonores": [
    [u.marcLeroy, 1300, "Les six balades sont en ligne, merci à tous."],
    [u.baptisteN, 1298, "Superbe travail."],
    [u.sophieMartin, 1250, "Les cartes sont à la médiathèque."],
    [u.alexRivera, 1240, "Bravo !"],
  ],
  "nettoyage-des-berges": [
    [u.alexRivera, 200, "Prochaine sortie samedi 3 octobre, 9 h au pont Neuf."],
    [u.paulMercier, 198, "Je loue un caisson à déchets."],
    [u.mathildeD, 190, "Zone du nid exclue, je l'ai marquée sur la carte."],
    [u.oceaneL, 150, "J'apporte des sacs réutilisables."],
    [u.camillePetit, 100, "Les enfants du jardin viennent, ils adorent."],
    [u.enzoB, 98, "J'apporte mes gants de soudeur."],
  ],
  "cours-de-code-pour-aines": [
    [u.nadiaK, 100, "Séance 2 mercredi à 14 h."],
    [u.claraMartinez, 98, "J'amène ma mère."],
    [u.karimHaddad, 90, "Je viens aider."],
    [u.hugoLemaire, 60, "J'ai reconditionné un premier portable."],
    [u.nadiaK, 58, "Bravo !"],
  ],
};

const SPECIAL_CHANNELS: Record<
  string,
  { channel: Conversation; talk: Line[] }
> = {
  "fresque-murale-collaborative": {
    channel: canalFresque,
    talk: [
      [
        u.marcLeroy,
        480,
        "Bonjour à tous, visite technique avec la mairie jeudi à 10 h. Qui peut venir ?",
      ],
      [u.alexRivera, 479, "Moi. Camille ?"],
      [u.camillePetit, 478, "Moi aussi."],
      [
        u.thomasDupont,
        470,
        "J'arrive en retard mais je viens. J'apporte le niveau laser.",
      ],
      [
        u.alexRivera,
        380,
        "Visite faite, tout est ok. On attend leur mail pour la nacelle.",
      ],
      [
        u.sophieMartin,
        300,
        "J'ai photographié le mur avec la lumière du matin.",
        {
          attachment: sharedFile(
            "fresque-murale-collaborative",
            "mur-nord-lumiere-du-matin.jpg",
          ),
        },
      ],
      [
        u.alexRivera,
        299,
        "Magnifique, merci Sophie. Le lierre en haut à gauche, on le garde ?",
      ],
      [u.marcLeroy, 297, "Oui, on peint autour."],
      [u.enzoB, 200, "Je suis dispo samedi pour la nacelle, j'ai le permis."],
      [
        u.yasmineT,
        120,
        "Maquette en couleur déposée dans les fichiers. Deux panneaux sont encore à décider.",
        {
          attachment: sharedFile(
            "fresque-murale-collaborative",
            "maquette-trois-panneaux.pdf",
          ),
        },
      ],
      [
        u.camillePetit,
        72,
        "@alex.rivera tu peux passer à la quincaillerie avant samedi pour la peinture ?",
      ],
      [u.alexRivera, 71, "Oui, je passe demain."],
      [u.thomasDupont, 70, "Et la nacelle, c'est confirmé ?"],
      [u.alexRivera, 69, "On a l'accord de la mairie pour de bon !"],
      [u.thomasDupont, 68, "Enfin."],
      [u.camillePetit, 4, "la peinture est commandée"],
    ],
  },
  "maree-basse-jeu-video": {
    channel: canalMaree,
    talk: [
      [
        u.nadiaK,
        500,
        "Salut l'équipe, priorités de la semaine : niveau 2, rotation du sous-marin, musique.",
      ],
      [u.enzoB, 498, "Je prends les décors."],
      [
        u.lisaMoreau,
        490,
        "Je prends les textes des épaves. J'ai trois idées de narrateurs.",
      ],
      [
        u.marcLeroy,
        480,
        "Première boucle de 40 secondes pour le niveau 1, je l'envoie ce soir.",
      ],
      [
        u.alexRivera,
        478,
        "Je relis les menus, j'ai des remarques sur la lisibilité.",
      ],
      [
        u.nadiaK,
        260,
        "Bug : le sous-marin traverse les algues du fond. Hugo, tu peux regarder ?",
      ],
      [
        u.hugoLemaire,
        250,
        "Je regarde. Je pense que la couche de collision est décalée.",
      ],
      [u.hugoLemaire, 248, "Corrigé, je pousse sur une branche."],
      [u.nadiaK, 240, "Merci ! Je merge ce soir."],
      [
        u.yasmineT,
        150,
        "Croquis du crabe qui suit le sous-marin. Trop mignon ?",
        {
          attachment: sharedFile("maree-basse-jeu-video", "croquis-crabe.png"),
        },
      ],
      [u.enzoB, 148, "Trop mignon. Gardez-le."],
      [
        u.lisaMoreau,
        100,
        "Textes des deux premières épaves terminés, ils sont dans le dépôt.",
      ],
      [u.enzoB, 90, "Message envoyé par erreur.", { deleted: true }],
      [
        u.marcLeroy,
        60,
        "Nouvelle version du thème des profondeurs, dans les fichiers.",
        {
          attachment: sharedFile(
            "maree-basse-jeu-video",
            "theme-des-profondeurs-v2.mp3",
          ),
        },
      ],
      [
        u.alexRivera,
        36,
        "Très belle ambiance. La transition avec la grotte est parfaite.",
        { edited: true },
      ],
      [u.nadiaK, 24, "le prototype tourne à 60 fps"],
    ],
  },
};

for (const [slug, project] of PROJECT_BY_SLUG) {
  if (project.state === "draft") continue;
  const special = SPECIAL_CHANNELS[slug];
  if (special) {
    // Canaux exportés plus haut (notifications) : seule la conversation reste à écrire.
    talk(special.channel, special.talk);
    continue;
  }
  const channel = create({
    type: "channel",
    participantIds: teamIds(project.id),
    projectId: project.id,
    createdAt: project.createdAt,
  });
  talk(channel, CHANNEL_TALK[slug] ?? []);
}
