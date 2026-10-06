import { commentSchema, type Comment } from "@/domain";
import type { DbUser } from "../db";
import { hoursAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

/** [auteur, il y a N heures, texte]. Une réponse à une réponse commence par `@pseudo` (R-C4). */
type Reply = [author: DbUser, ago: number, body: string];

const COMMENTS_LIST: Comment[] = [];

function comment(input: {
  slug: string;
  author: DbUser;
  ago: number;
  body: string;
  parentId?: string;
  hidden?: boolean;
}): Comment {
  const project = PROJECT_BY_SLUG.get(input.slug);
  if (!project)
    throw new Error(`Projet inconnu dans le jeu de demo : ${input.slug}`);
  const created = commentSchema.parse({
    id: nextId(),
    projectId: project.id,
    authorId: input.author.id,
    body: input.body,
    parentId: input.parentId,
    publishedAt: hoursAgo(input.ago),
    hidden: input.hidden ?? false,
  });
  COMMENTS_LIST.push(created);
  return created;
}

/** R-C4 : un seul niveau de réponse, toutes les réponses pointent la racine. */
function thread(
  slug: string,
  author: DbUser,
  ago: number,
  body: string,
  replies: Reply[] = [],
  hidden = false,
): Comment {
  const root = comment({ slug, author, ago, body, hidden });
  for (const [replyAuthor, replyAgo, replyBody] of replies) {
    comment({
      slug,
      author: replyAuthor,
      ago: replyAgo,
      body: replyBody,
      parentId: root.id,
    });
  }
  return root;
}

const fresque = "fresque-murale-collaborative";

// --- Fresque murale collaborative -------------------------------------------
// L'ordre des quatre premiers fils est relu par `notifications.ts` et par les
// tests (premier commentaire de Sophie, premier commentaire de Thomas).
thread(
  fresque,
  u.sophieMartin,
  48,
  "Je peux venir samedi avec mon appareil. Je ne suis pas pro mais je me débrouille.",
  [[u.alexRivera, 46, "Parfait, viens à 9 h, on te montrera le mur nord."]],
);
thread(
  fresque,
  u.thomasDupont,
  120,
  "Est-ce qu'il faut apporter ses propres pinceaux ?",
  [
    [
      u.alexRivera,
      116,
      "Non, tout est fourni ! Viens juste avec de vieux vêtements.",
    ],
    [
      u.thomasDupont,
      100,
      "@alex.rivera Parfait, merci. Je viendrai avec mon neveu, il a 9 ans et un goût très sûr pour le rouge.",
    ],
    [
      u.alexRivera,
      98,
      "@thomas.dupont Bienvenue à tous les deux. Les enfants sont les rois du rouleau, il y en aura plusieurs.",
    ],
  ],
);
thread(
  fresque,
  u.lisaMoreau,
  168,
  "Beau projet. Je ne peux pas aider mais je passerai voir.",
);
thread(
  fresque,
  u.karimHaddad,
  330,
  "Vous avez prévu quelque chose pour les enfants ? Je pourrais animer un petit atelier d'histoire du quartier à côté du mur, pour raconter ce qu'il y avait là avant.",
  [
    [
      u.alexRivera,
      326,
      "Oui, on y pense. Écris-nous en message, on cale une date pour le prochain samedi.",
    ],
  ],
);
thread(
  fresque,
  u.annickR,
  500,
  "Le service technique m'a confirmé que le dossier était passé. Bonne nouvelle, bravo à tous !",
  [[u.alexRivera, 498, "Merci Annick, ton coup de fil a tout débloqué."]],
);
thread(
  fresque,
  u.compteSupprime,
  720,
  "J'habite en face. Le mur était triste depuis toujours, ça va faire du bien.",
  [
    [
      u.camillePetit,
      715,
      "On compte sur vous pour apporter du café le premier samedi !",
    ],
  ],
);
/** Cible des trois signalements en attente (voir `reports.ts`). */
export const spamComment = comment({
  slug: fresque,
  author: u.cedricP,
  ago: 5,
  body: "Gagnez 500 € par jour depuis chez vous, sans aucune compétence ! Écrivez-moi en message privé pour recevoir la méthode.",
});

// --- Jardin partagé -----------------------------------------------------------
thread(
  "jardin-partage-derriere-lecole",
  u.oceaneL,
  26,
  "Est-ce qu'on peut venir juste regarder, sans rien planter ? J'habite à côté et je suis curieuse.",
  [
    [
      u.camillePetit,
      24,
      "Bien sûr ! On est là le dimanche matin, passe boire un thé. Il y a souvent des tomates à goûter.",
    ],
    [
      u.oceaneL,
      22,
      "@camille.petit Super, je viens dimanche. Je ramène des graines de capucines.",
    ],
  ],
);
thread(
  "jardin-partage-derriere-lecole",
  u.mathildeD,
  96,
  "Petite remarque : les chats du quartier adorent le bac des carottes. On pourrait mettre un grillage fin, ça marche très bien.",
  [
    [
      u.paulMercier,
      90,
      "J'ai du grillage de poulailler à la cave. Je l'apporte samedi.",
    ],
  ],
);
thread(
  "jardin-partage-derriere-lecole",
  u.sophieMartin,
  300,
  "Merci pour la récolte de courges, mes enfants ont adoré le potimarron en soupe.",
);
/** Masqué par la modération (voir `reports.ts`) : ne sort pas dans les listes. */
export const hiddenSpamComment = thread(
  "jardin-partage-derriere-lecole",
  u.fabriceV,
  700,
  "Revendez vos récoltes au prix fort grâce à ma plateforme, inscription gratuite : www.exemple-spam.invalid",
  [],
  true,
);
thread(
  "jardin-partage-derriere-lecole",
  u.paulMercier,
  620,
  "Pour ceux que ça intéresse : j'ai tenu un cahier de culture depuis avril, avec les dates de semis et les rendements. Je le mets dans les fichiers.",
);

// --- Marée basse --------------------------------------------------------------
thread(
  "maree-basse-jeu-video",
  u.hugoLemaire,
  8,
  "Quel moteur utilisez-vous ? Je regarde le dépôt et j'aimerais savoir comment vous gérez les collisions des algues.",
  [
    [
      u.nadiaK,
      7,
      "C'est Godot 4. Les algues sont des polygones de collision simples, on triche pour la fluidité.",
    ],
    [
      u.hugoLemaire,
      6,
      "@nadia.k Intéressant. Vous avez essayé de faire ça avec des shaders plutôt ?",
    ],
    [
      u.nadiaK,
      6,
      "@hugo.lemaire Oui, mais ça demandait trop de GPU sur les vieux portables. On vise du matériel modeste.",
    ],
    [
      u.enzoB,
      5,
      "@hugo.lemaire On peut regarder ensemble samedi si tu veux, je te montre où ça pose problème.",
    ],
    [u.hugoLemaire, 5, "@enzo.b Avec plaisir."],
    [
      u.marcLeroy,
      4,
      "Pendant ce temps je continue le thème des profondeurs. Je vous envoie un extrait ce soir.",
    ],
  ],
);
thread(
  "maree-basse-jeu-video",
  u.yanisF,
  30,
  "J'ai testé le prototype sur un vieux PC : ça tourne, et l'ambiance est incroyable. Seul truc, le sous-marin est un peu lent à tourner.",
  [
    [
      u.nadiaK,
      28,
      "Merci pour le retour ! On ajuste la vitesse de rotation ce soir.",
    ],
  ],
);
thread(
  "maree-basse-jeu-video",
  u.sophieMartin,
  72,
  "Est-ce qu'il y aura une version téléchargeable gratuite ? J'aimerais l'offrir à mon neveu.",
  [
    [
      u.nadiaK,
      70,
      "Oui, gratuite et sans pub, quand le jeu sera fini. On vise le printemps.",
    ],
  ],
);
thread(
  "maree-basse-jeu-video",
  u.baptisteN,
  50,
  "Je viens de demander à rejoindre l'équipe : je fais de la musique d'ambiance. Je peux vous envoyer deux ou trois pistes pour juger du ton.",
);
/** Critique franche mais légitime, signalée à tort puis rejetée (voir `reports.ts`). */
export const criticalComment = thread(
  "maree-basse-jeu-video",
  u.hugoLemaire,
  400,
  "Honnêtement, après vingt minutes je me suis ennuyé. Les graphismes sont superbes, mais il ne se passe pas grand-chose et on ne sait pas où aller.",
  [
    [
      u.nadiaK,
      398,
      "Merci, c'est un retour utile. Le niveau 2 est justement pensé pour guider un peu plus.",
    ],
  ],
);
thread(
  "maree-basse-jeu-video",
  u.annickR,
  500,
  "Super initiative, la ville vous prête volontiers la salle du premier étage si vous voulez organiser une session de tests publique.",
);

// --- Repair café --------------------------------------------------------------
thread(
  "repair-cafe-du-mois",
  u.amelieVasseur,
  100,
  "Vous prenez les appareils médicaux ? J'ai un tensiomètre qui affiche n'importe quoi.",
  [
    [
      u.thomasDupont,
      98,
      "Pas les appareils médicaux, pour des raisons de sécurité. Mais on regarde l'alimentation si tu veux.",
    ],
    [
      u.amelieVasseur,
      96,
      "@thomas.dupont Logique. Je le rapporte au fabricant, merci.",
    ],
  ],
);
thread(
  "repair-cafe-du-mois",
  u.lisaMoreau,
  220,
  "Merci à l'équipe : ma lampe de chevet de ma grand-mère fonctionne à nouveau. Je l'ai remise dans ma chambre, ça fait quelque chose.",
  [
    [
      u.julienGarnier,
      218,
      "C'était un plaisir. Les modèles de ce type sont solides, il suffisait de changer un interrupteur.",
    ],
  ],
);
thread(
  "repair-cafe-du-mois",
  u.paulMercier,
  500,
  "Quelqu'un sait si vous avez déjà réparé un tourne-disque ? Le mien tourne, mais trop vite.",
  [
    [
      u.julienGarnier,
      498,
      "On en a vu passer deux. C'est souvent la courroie. Apporte-le, on regarde.",
    ],
    [
      u.thomasDupont,
      496,
      "@julien.garnier Je ramène le cutter et de la courroie neuve ce mois-ci.",
    ],
    [
      u.paulMercier,
      490,
      "@thomas.dupont Merci à vous deux, je viens avec le disque 'Kind of Blue' pour tester.",
    ],
    [u.alexRivera, 480, "Tu m'invites à l'écoute ?"],
    [u.paulMercier, 478, "@alex.rivera Évidemment."],
  ],
);

// --- Distribution de soupe ----------------------------------------------------
thread(
  "distribution-de-soupe-lhiver",
  u.karimHaddad,
  60,
  "J'ai fait la distribution du jeudi l'hiver dernier, c'est ce que j'ai fait de plus utile de l'année. Si vous cherchez du monde, je suis partant dès novembre.",
  [[u.annickR, 58, "Merci Karim ! On te garde une place sur le jeudi soir."]],
);
thread(
  "distribution-de-soupe-lhiver",
  u.camillePetit,
  200,
  "Je peux apporter des courges et du potiron du jardin partagé. Combien en faut-il ?",
  [
    [
      u.amelieVasseur,
      198,
      "Autant que tu peux ! Dix kilos pour une grande marmite, c'est idéal.",
    ],
  ],
);
thread(
  "distribution-de-soupe-lhiver",
  u.compteSupprime,
  900,
  "Merci pour ce que vous faites. Cet hiver, j'ai pris une soupe tous les mardis. Je ne l'oublierai pas.",
);

// --- Ciné-club ---------------------------------------------------------------
thread(
  "cine-club-de-quartier",
  u.yasmineT,
  40,
  "Je dessine les affiches des séances, si vous voulez. Je peux en faire une pour octobre.",
  [
    [
      u.annickR,
      38,
      "Oui avec plaisir ! Envoie-nous une première idée ici et on vote.",
    ],
  ],
);
thread(
  "cine-club-de-quartier",
  u.thomasDupont,
  260,
  "Y a-t-il un parking à proximité de la salle des fêtes ?",
  [
    [
      u.annickR,
      258,
      "Oui, derrière la mairie, gratuit le dimanche. Dix minutes à pied.",
    ],
  ],
);
thread(
  "cine-club-de-quartier",
  u.baptisteN,
  500,
  "La séance en plein air était magnifique. Mention spéciale au moustique qui a regardé le film avec nous.",
);

// --- Podcast ----------------------------------------------------------------
thread(
  "podcast-des-metiers-oublies",
  u.paulMercier,
  150,
  "Mon grand-père était sabotier dans le Morvan. Il vit encore à 94 ans. Vous voulez l'enregistrer ?",
  [
    [
      u.lisaMoreau,
      148,
      "Oh oui, mille fois oui. Je vous écris pour caler une date.",
    ],
  ],
);
thread(
  "podcast-des-metiers-oublies",
  u.claraMartinez,
  200,
  "Je viens de découvrir le podcast avec l'épisode 4 sur le rémouleur. J'ai pleuré à la fin, merci.",
);
thread(
  "podcast-des-metiers-oublies",
  u.marcLeroy,
  300,
  "Si besoin, je peux aider pour le nettoyage des enregistrements : il y a un petit souffle dans l'épisode 2.",
  [
    [
      u.lisaMoreau,
      296,
      "@marc.leroy Avec plaisir, je t'envoie les fichiers sources.",
    ],
  ],
);

// --- Cours de langue par échange ---------------------------------------------
thread(
  "cours-de-langue-par-echange",
  u.hugoLemaire,
  70,
  "Je cherche quelqu'un pour pratiquer l'espagnol. Je peux aider en français, ou en anglais, ou en Python, à la limite.",
  [
    [
      u.claraMartinez,
      68,
      "Le Python, c'est une langue après tout. On cherche un binôme pour toi.",
    ],
  ],
);
thread(
  "cours-de-langue-par-echange",
  u.karimHaddad,
  250,
  "Mon binôme d'arabe me corrige mon accent avec une patience d'ange. Ce projet est une très bonne idée.",
);
thread(
  "cours-de-langue-par-echange",
  u.oceaneL,
  600,
  "Y a-t-il des binômes pour le portugais ? Je pars au Portugal dans quelques mois.",
  [
    [
      u.claraMartinez,
      598,
      "Pas encore, mais on cherche ! Une voisine en parle, je lui dis de passer.",
    ],
  ],
);

// --- Console rétro ------------------------------------------------------------
thread(
  "console-retro-en-bois",
  u.julienGarnier,
  80,
  "Pour l'ébénisterie, je suggère du MDF de 18 mm plutôt que du contreplaqué : plus stable, plus simple à ponceler.",
  [
    [
      u.enzoB,
      78,
      "Merci Julien, je regarde ça. Tu as une adresse pour en acheter pas trop cher ?",
    ],
    [u.julienGarnier, 76, "@enzo.b Je t'envoie ça en message."],
  ],
);
thread(
  "console-retro-en-bois",
  u.nadiaK,
  300,
  "Si besoin d'un jeu de test, j'ai un petit shoot'em up fait en trois jours. Il est moche mais jouable.",
  [[u.enzoB, 296, "@nadia.k Oh oui, envoie !"]],
);
thread(
  "console-retro-en-bois",
  u.yanisF,
  600,
  "Je viens d'imprimer les poignées en 3D, elles sont plus ergonomiques que les originales. Je vous montre samedi.",
);

// --- Album de reprises ----------------------------------------------------------
thread(
  "album-de-reprises-au-local",
  u.nadiaK,
  60,
  "Je mettrai les voix sur le titre 5 dimanche. Si vous avez un ordre de passage, dites-le-moi.",
  [
    [
      u.marcLeroy,
      58,
      "@nadia.k On fait l'ordre jeudi. Prépare ton verre d'eau.",
    ],
  ],
);
thread(
  "album-de-reprises-au-local",
  u.baptisteN,
  200,
  "Je viens de poster l'arrangement du morceau 3. Dites-moi si la basse tient la route.",
);

// --- Remise en état du bowl -----------------------------------------------------
thread(
  "remise-en-etat-du-bowl",
  u.julienGarnier,
  44,
  "Attention, il faut laisser sécher le mortier de réparation au moins 24 h avant de poncer. Je l'ai appris à mes dépens.",
  [[u.yanisF, 42, "Merci Julien, on décale le ponçage au samedi suivant."]],
);
thread(
  "remise-en-etat-du-bowl",
  u.thomasDupont,
  200,
  "Je peux apporter mon aspirateur de chantier pour la poussière. Il est lourd mais très efficace.",
);
thread(
  "remise-en-etat-du-bowl",
  u.compteSupprime,
  500,
  "Je patine ici depuis dix ans, ça fait plaisir de voir quelqu'un s'en occuper enfin.",
  [[u.yanisF, 498, "On fait ça pour nous tous. Viens quand tu veux."]],
);

// --- Carte des bancs publics --------------------------------------------------
thread(
  "carte-des-bancs-publics",
  u.paulMercier,
  30,
  "Le banc devant l'ancienne poste est cassé depuis deux ans. Je l'ai noté « cassé, souvent occupé », ça m'a paru honnête.",
  [[u.alexRivera, 28, "C'est exactement le bon niveau de détail. Merci Paul."]],
);
thread(
  "carte-des-bancs-publics",
  u.oceaneL,
  100,
  "Il y a un coin avec trois bancs face à un mur aveugle, rue des Tanneurs. Je ne sais pas si c'est une blague d'urbaniste.",
  [
    [
      u.sophieMartin,
      96,
      "@oceane.l Je l'ai photographié, c'est étrange. Je le mets dans la carte comme « vue discutable ».",
    ],
  ],
);
thread(
  "carte-des-bancs-publics",
  u.annickR,
  400,
  "Je transmets vos relevés au service voirie dès que la carte est publiée : ça les aidera à prioriser.",
);

// --- Chorale improvisée ----------------------------------------------------------
thread(
  "chorale-improvisee-du-mardi",
  u.oceaneL,
  60,
  "Première fois mardi dernier, je chante faux et personne n'a bronché. Merci pour l'accueil et la tisane.",
  [
    [
      u.claraMartinez,
      58,
      "Tu chantais juste, on a juste le mauvais piano. À mardi !",
    ],
  ],
);
thread(
  "chorale-improvisee-du-mardi",
  u.yasmineT,
  200,
  "Quelqu'un a les paroles du canon de la semaine dernière ? Je n'arrête pas de le fredonner sans les mots.",
  [
    [
      u.baptisteN,
      198,
      "C'était « Dona nobis pacem » en trois voix. Je poste la feuille ici demain.",
    ],
    [u.lisaMoreau, 196, "@baptiste.n Je l'ai déjà, je la scanne."],
  ],
);
thread(
  "chorale-improvisee-du-mardi",
  u.camillePetit,
  500,
  "Je viens avec mes enfants si ça ne dérange pas. Ils chantent plus fort que moi.",
  [[u.claraMartinez, 498, "Évidemment que non. Le plus fort, c'est parfait."]],
);

// --- Refuge à hérissons ---------------------------------------------------------
thread(
  "refuge-a-herissons",
  u.oceaneL,
  800,
  "J'ai vu un hérisson passer dans mon jardin hier soir, juste à côté de l'abri n° 12. Merci à tous.",
  [
    [
      u.mathildeD,
      798,
      "Super nouvelle ! Pensez à lui laisser un petit bol d'eau, pas de lait.",
    ],
  ],
);
thread(
  "refuge-a-herissons",
  u.thomasDupont,
  1200,
  "Les plans des abris sont très bien faits. J'en construis un pour ma grand-mère, merci pour le partage.",
);
thread(
  "refuge-a-herissons",
  u.karimHaddad,
  1500,
  "Un projet fini, bien documenté, avec des résultats concrets. On devrait en faire plus comme ça.",
);

// --- Bibliothèque de rue --------------------------------------------------------
thread(
  "bibliotheque-de-rue",
  u.yasmineT,
  3000,
  "J'y ai trouvé un recueil de poèmes que je cherchais depuis des années. Merci à celui ou celle qui l'a laissé.",
);
thread(
  "bibliotheque-de-rue",
  u.claraMartinez,
  4000,
  "Les boîtes tiennent bien, même après l'hiver. Les enfants du collège les adorent.",
  [[u.annickR, 3990, "Elles ont été construites pour ça. Merci Clara !"]],
);

// --- Vélo-école ----------------------------------------------------------------
thread(
  "velo-ecole-pour-adultes",
  u.oceaneL,
  40,
  "Quelqu'un apprend à pédaler à 38 ans, ça vous rassure ? Je n'ose pas me lancer, on m'a toujours dit que c'était « pour les enfants ».",
  [
    [
      u.yanisF,
      38,
      "Viens samedi. Il y a deux autres adultes de ton âge, et tout le monde a les genoux qui tremblent.",
    ],
    [
      u.amelieVasseur,
      36,
      "@oceane.l Je confirme : moi aussi j'avais peur. J'ai roulé seule en quatre séances.",
    ],
    [u.oceaneL, 30, "@amelie.vasseur @yanis.f D'accord, j'essaie samedi."],
  ],
);
thread(
  "velo-ecole-pour-adultes",
  u.thomasDupont,
  300,
  "J'ai deux vélos qui ne servent plus dans ma cave. Je peux les remettre en état et vous les prêter.",
  [[u.yanisF, 298, "On les prend avec joie. Apporte-les samedi au stade."]],
);
thread(
  "velo-ecole-pour-adultes",
  u.sophieMartin,
  500,
  "Je fais des photos le samedi si vous voulez un souvenir de la première pédalée. Sans visage, juste les roues.",
);
thread(
  "velo-ecole-pour-adultes",
  u.alexRivera,
  800,
  "Mireille a pédalé seule ! Bravo à tous.",
);

// --- Fanzine du lycée ------------------------------------------------------------
thread(
  "fanzine-du-lycee",
  u.karimHaddad,
  100,
  "Je suis en fac d'histoire, j'ai fait un fanzine il y a cinq ans. Je peux vous faire un retour sur la mise en page si ça vous aide.",
  [
    [
      u.lisaMoreau,
      98,
      "Volontiers, on prend tous les conseils. Écris-nous en message.",
    ],
  ],
);
thread(
  "fanzine-du-lycee",
  u.yasmineT,
  250,
  "Les bandes dessinées du numéro 3 sont magnifiques. Je suis jalouse.",
);
thread(
  "fanzine-du-lycee",
  u.sophieMartin,
  500,
  "Mon fils a écrit un article sur les distributeurs de la cantine, on l'a lu à voix haute à la maison. Bravo à toute l'équipe.",
);

// --- Repair vélo mobile -----------------------------------------------------------
thread(
  "repair-velo-mobile",
  u.hugoLemaire,
  70,
  "J'ai un porte-bagages de remorque qui traîne. Il peut servir de base pour le coffre à outils ?",
  [[u.thomasDupont, 68, "Oui, apporte-le. On regarde la fixation samedi."]],
);
/** Commentaire d'un compte supprimé depuis : contenu conservé, auteur détaché (R-P2). */
thread(
  "repair-velo-mobile",
  u.compteSupprime,
  190,
  "Franchement, une remorque pour réparer des vélos abandonnés, qui va payer ça ? Encore un projet qui ne servira à rien.",
  [
    [
      u.thomasDupont,
      186,
      "Personne ne paie : tout est fait avec des pièces de récupération. Tu es le bienvenu pour voir.",
    ],
  ],
);

// --- Club d'échecs ----------------------------------------------------------------
thread(
  "club-dechecs-du-mercredi",
  u.thomasDupont,
  40,
  "Je ne joue pas très bien mais je suis très motivé. Y a-t-il un niveau minimum ?",
  [
    [
      u.enzoB,
      38,
      "Aucun ! Viens, on t'installe face à quelqu'un de ton niveau (ou presque).",
    ],
    [
      u.hugoLemaire,
      36,
      "@thomas.dupont Je joue mal aussi, on peut perdre ensemble.",
    ],
  ],
);
thread(
  "club-dechecs-du-mercredi",
  u.paulMercier,
  300,
  "J'ai rejoué la partie de Kasparov-Topalov 1999 avec un débutant. Il a tout compris à l'attaque en dix minutes.",
);
thread(
  "club-dechecs-du-mercredi",
  u.baptisteN,
  600,
  "J'aime beaucoup l'ambiance : on parle peu, mais on s'entend très bien.",
);

// --- Verger conservatoire ---------------------------------------------------------
thread(
  "verger-conservatoire",
  u.alexRivera,
  60,
  "Le 17, je viens avec mon appareil et mon sécateur. Je peux aussi aider à étiqueter.",
  [
    [
      u.camillePetit,
      58,
      "Parfait. On a justement besoin de quelqu'un pour les étiquettes, bravo pour l'initiative.",
    ],
  ],
);
thread(
  "verger-conservatoire",
  u.mathildeD,
  240,
  "J'ai croisé une variété qui s'appelle « Reinette étoilée » dans un verger voisin. Vous la connaissez ? Elle est presque disparue.",
  [
    [
      u.paulMercier,
      236,
      "On la cherche depuis le début ! Tu peux me donner l'adresse ? Je prends des greffons en février.",
    ],
  ],
);
thread(
  "verger-conservatoire",
  u.julienGarnier,
  600,
  "Pour les tuteurs, du châtaignier. Ça dure dix ans sans traitement. J'en ai plusieurs mètres à donner.",
);

// --- Atelier couture solidaire ---------------------------------------------------
thread(
  "atelier-couture-solidaire",
  u.oceaneL,
  60,
  "J'ai fait mon premier ourlet avec vous mercredi dernier. C'est tout droit, c'est incroyable.",
  [
    [
      u.annickR,
      58,
      "Bravo ! La prochaine fois, on attaque une fermeture éclair.",
    ],
  ],
);
thread(
  "atelier-couture-solidaire",
  u.claraMartinez,
  300,
  "Je donne ma vieille machine à coudre Singer, elle fonctionne. Qui la veut ?",
  [[u.annickR, 298, "On la prend avec joie, merci Clara."]],
);
thread(
  "atelier-couture-solidaire",
  u.yasmineT,
  500,
  "Je dessine une affiche pour l'atelier si ça vous dit. Des aiguilles, du fil, un peu d'humour.",
);

// --- Fresques sonores ------------------------------------------------------------
thread(
  "fresques-sonores",
  u.karimHaddad,
  1400,
  "J'ai fait la balade 4 sur le chemin du retour de la fac. La chorale sous le pont, j'ai failli rater mon bus.",
  [[u.marcLeroy, 1398, "C'est exactement l'effet qu'on voulait. Merci Karim."]],
);
thread(
  "fresques-sonores",
  u.paulMercier,
  1800,
  "Une idée géniale. Mon petit-fils de huit ans a écouté la balade 2 en entier sans bouger.",
);

// --- Nettoyage des berges --------------------------------------------------------
thread(
  "nettoyage-des-berges",
  u.mathildeD,
  70,
  "J'ai trouvé un nid de canards sous le pont. Je propose qu'on évite cette zone pour les prochaines sorties.",
  [
    [
      u.alexRivera,
      68,
      "Bonne idée. On la contourne et on la marque sur la carte.",
    ],
    [
      u.paulMercier,
      66,
      "@mathilde.d Je peux passer observer la ponte ce week-end, avec jumelles.",
    ],
  ],
);
thread(
  "nettoyage-des-berges",
  u.enzoB,
  150,
  "Pour la prochaine sortie, j'apporte des gants de soudeur : ils sont indestructibles, même contre les ronces.",
);
thread(
  "nettoyage-des-berges",
  u.camillePetit,
  200,
  "Les enfants du jardin sont venus avec nous. Ils ont trouvé le frigo avant tout le monde, ils se sont sentis très utiles.",
);

// --- Cours de code pour aînés ---------------------------------------------------
thread(
  "cours-de-code-pour-aines",
  u.claraMartinez,
  100,
  "Ma mère de 74 ans est venue à la première séance. Elle a réussi à envoyer une photo de sa chatte à ses petits-enfants. Je n'avais pas vu ça depuis longtemps.",
  [[u.nadiaK, 98, "On l'a vue ! Elle a posé beaucoup de bonnes questions."]],
);
thread(
  "cours-de-code-pour-aines",
  u.karimHaddad,
  60,
  "Je peux être volontaire le mercredi. J'ai de la patience et je connais Windows 10 à peu près.",
  [[u.nadiaK, 58, "Avec joie ! Viens mercredi, on te présente au groupe."]],
);
thread(
  "cours-de-code-pour-aines",
  u.hugoLemaire,
  30,
  "Je recherche des portables à reconditionner. Si vous en avez qui dorment dans un placard, signalez-vous.",
);

export const COMMENTS: Comment[] = COMMENTS_LIST;
