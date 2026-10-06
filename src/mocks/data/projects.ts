import {
  projectSchema,
  type Need,
  type Participation,
  type Project,
  type ProjectState,
  type Visibility,
} from "@/domain";
import { CUSTOMIZATIONS } from "./customizationFixtures";
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
      "On repeint le mur du gymnase avec les habitants du quartier, un samedi par mois.",
    description:
      "Le mur nord du gymnase est gris depuis quarante ans. On le repeint, **un samedi par mois**, avec celles et ceux du quartier qui ont envie de tenir un pinceau, ou juste de passer boire un café.\n\nLe dessin d'ensemble est né d'un atelier avec les enfants de l'école voisine : trois grands panneaux, une rue qui devient une forêt, des visages qui regardent par les fenêtres. À chaque samedi son panneau. Pas besoin de savoir dessiner : on trace les contours à la craie, tu remplis.\n\n**Comment ça se passe.** Rendez-vous à 9 h devant le gymnase, on s'arrête vers 16 h. Viens avec de vieux vêtements, la peinture et les pinceaux sont fournis. La mairie nous prête le mur et une nacelle jusqu'à l'été prochain.\n\nOn cherche quelqu'un pour **photographier chaque étape** : une trace pour nous, et de quoi monter une petite exposition à la fin.",
    tags: ["dessin", "quartier"],
    needs: [
      need("quelqu'un pour la photo", "photo"),
      need("un coup de main le samedi"),
      need("une nacelle pour le haut du mur", undefined, true),
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
    description:
      "Derrière l'école, il y avait un terrain vague où l'on jetait les vieux pneus. Il y a maintenant **six bacs, une cabane à outils et un composteur** que tout le monde finit par comprendre.\n\nVingt familles s'y croisent : certaines viennent tous les jours, d'autres une fois par mois pour récolter. Chaque bac a son équipe et son carnet, et l'arrosage tourne selon un planning qu'on révise chaque printemps.\n\nOn y fait pousser des tomates, des courges, beaucoup trop de menthe, et quelques fleurs pour les abeilles. Les récoltes se partagent, les semis aussi.\n\n*Tu n'as jamais jardiné ?* Parfait. Demande à rejoindre le projet, on te trouve un coin et quelqu'un pour te montrer.",
    tags: ["jardinage", "quartier"],
    needs: [
      need("quelqu'un qui s'y connaît en arrosage", "jardinage"),
      need("du terreau pour l'automne"),
    ],
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
    description:
      "**Marée basse** est un petit jeu d'exploration sous-marine : tu pilotes un minuscule sous-marin à travers des épaves, des algues et des créatures qui ne sont pas toutes hostiles. Il n'y a pas de combat, seulement de la curiosité et un peu de lumière.\n\nOn est quatre, sans budget, à le fabriquer le soir et le week-end. Nadia code, Enzo dessine, Marc et Lisa s'occupent du son et de l'écriture. Le prototype tourne à 60 images par seconde, le niveau 1 est jouable, le niveau 2 est en chantier.\n\nLe moteur est [Godot](https://godotengine.org), tout le code est ouvert. On publiera le jeu gratuitement quand il sera fini, pas avant.\n\nIl nous manque **quelqu'un pour la musique** (l'ambiance est la moitié du jeu) et des **testeurs** qui nous diront honnêtement où ils s'ennuient.",
    tags: ["jeu-video", "dessin", "musique"],
    needs: [
      need("quelqu'un pour la musique", "musique"),
      need("un dev Godot", "code"),
      need("des testeurs pour le niveau 2", "jeu-video"),
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
    description:
      "Le premier samedi du mois, la salle des associations devient un atelier. Apporte ton grille-pain, ta lampe, ton vélo ou ton pull troué : on regarde ensemble, et on répare si on peut.\n\n**Ce n'est pas un service**, c'est un coup de main. On ne répare pas à ta place, on t'explique, tu tiens la pince. Et si l'objet est perdu, tu repars quand même avec une idée de pourquoi.\n\nC'est gratuit, il y a du café, et une caisse pour les pièces détachées que l'on récupère. On accueille une trentaine d'objets par session.\n\nLes bénévoles sont des bricoleurs, des couturières, un ancien menuisier, un électricien qui n'ose pas le dire. Nous cherchons toujours quelqu'un pour **tenir l'accueil** et un **fer à souder de plus**.",
    tags: ["reparation", "solidarite"],
    needs: [
      need("un fer à souder de plus", "reparation"),
      need("quelqu'un pour tenir l'accueil"),
    ],
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
    description:
      "De novembre à mars, trois soirs par semaine (mardi, jeudi, dimanche), on sert **une soupe chaude, du pain et du thé** devant la gare. Environ 60 repas par soir.\n\nLes soupes sont cuisinées la veille dans la cuisine de la salle paroissiale, par des bénévoles qui se relaient. Les légumes viennent du marché, des invendus et du jardin partagé du quartier.\n\nLe plus important n'est pas la soupe : c'est de **s'asseoir cinq minutes** avec quelqu'un. On cherche surtout des personnes disponibles le mardi soir, et une camionnette le jeudi.\n\n*La reprise est prévue début novembre.* Le projet reste ouvert tout l'été pour préparer la saison.",
    tags: ["solidarite"],
    needs: [need("des bras le mardi"), need("une camionnette le jeudi soir")],
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
    description:
      "Un film par mois, dans la salle des fêtes, **choisi par ceux qui viennent**. Chaque séance se termine par un vote pour la suivante : tu proposes, tu défends, la salle tranche.\n\nOn passe de tout : un classique en noir et blanc, un documentaire local, un film d'animation pour les enfants le dimanche. Les séances sont gratuites, un chapeau circule pour couvrir les droits de projection.\n\nLa salle prête son vidéoprojecteur, on apporte les chaises et les gâteaux. Les débats après le film durent parfois plus longtemps que le film lui-même.\n\nOn aimerait **sous-titrer** les prochaines séances pour qu'elles soient accessibles à tout le monde : si tu sais faire, viens nous voir.",
    tags: ["spectacle", "quartier"],
    needs: [need("quelqu'un pour les sous-titres", "video")],
    visibility: "public",
    participation: "open",
    state: "active",
    ownerId: u.annickR.id,
    highfiveCount: 35,
    createdDaysAgo: 150,
    lastActivityHoursAgo: 72,
  },
  {
    title: "Podcast des métiers oubliés",
    slug: "podcast-des-metiers-oublies",
    tagline: "On enregistre ceux qui font des métiers qui disparaissent.",
    description:
      "Fabricant de sabots, rémouleur, allumeur de réverbères, cordier : des métiers qui disparaissent, **racontés par ceux qui les ont faits**.\n\nLe principe est simple : un enregistrement long avec une personne, un épisode de vingt minutes monté à partir de ses mots. Pas de narration surplombante, pas de musique envahissante. On laisse les silences.\n\nSix épisodes sont déjà publiés, trois sont en cours de montage. On enregistre chez les gens, avec un micro cravate et beaucoup de thé.\n\nIl nous faut **quelqu'un pour le montage son** et des **anciens à interviewer** : si tu connais quelqu'un dont le métier n'existe plus, dis-le-nous.",
    tags: ["ecriture", "histoire"],
    needs: [
      need("quelqu'un pour le montage son", "musique"),
      need("des anciens à interviewer", "histoire"),
    ],
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
    description:
      "Une heure de français contre une heure d'arabe, d'espagnol, d'ukrainien ou de portugais. **Personne n'est prof, tout le monde est élève.**\n\nOn forme des binômes selon les langues et les horaires, puis chacun s'organise : un café, une balade, un appel vidéo. Une fois par mois, on se retrouve tous pour un repas où l'on a le droit de parler n'importe quelle langue sauf la sienne.\n\nUne quarantaine de personnes participent déjà. Pour l'instant il y a plus de demandes d'arabe et de portugais que de personnes pour les enseigner.\n\nAucun niveau requis, aucune inscription payante. Une seule règle : **venir à l'heure et prévenir quand on ne peut pas**.",
    tags: ["langues", "entraide-scolaire"],
    needs: [
      need("quelqu'un qui parle portugais", "langues"),
      need("un local calme le samedi"),
    ],
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
    description:
      "Une borne d'arcade construite *de zéro*, dans le garage des parents d'Enzo, avec ce qu'on trouve : planches de récupération, vieux écran, boutons commandés au compte-gouttes.\n\nElle est pensée pour les gens qui n'ont jamais joué : deux joysticks, quatre boutons chacun, un menu qui s'allume en un clic. On y installe des jeux libres et des petits jeux faits par des amis.\n\nL'objectif : **l'inaugurer à la salle des jeunes** avant les vacances de Noël, et laisser les plans ouverts pour que d'autres puissent en fabriquer une.\n\nLe soudage est fait (merci Julien). Reste à finir l'ébénisterie et à trouver des boutons d'arcade qui ne coûtent pas un bras.",
    tags: ["bricolage", "jeu-video"],
    needs: [
      need("quelqu'un qui sait souder", "bricolage", true),
      need("des boutons d'arcade", "bricolage"),
    ],
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
    description:
      "Huit morceaux que l'on joue depuis des années sans jamais les avoir enregistrés. On les met en boîte **dans le local de répétition**, avant l'été, avec un matériel qu'on a rafistolé nous-mêmes.\n\nLe projet est privé : on le montre quand il est prêt. L'équipe est petite et choisie, on s'organise au fil des répétitions du jeudi soir.\n\nMarc s'occupe de la prise de son et du mixage, Baptiste des arrangements, Nadia des voix. Il nous manque un **batteur** pour les trois derniers titres, et une personne pour jouer le rôle de public tout court.",
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
    description:
      "Le bowl du skatepark a **onze fissures** que la municipalité a notées il y a trois ans sans jamais intervenir. On a décidé de s'en occuper nous-mêmes : reboucher, poncer, repeindre les bords.\n\nPas de bricolage sauvage : on a demandé l'autorisation, on travaille avec un technicien de la ville pour le choix du béton, et on balise le chantier chaque samedi.\n\nLe plus dur sera de trouver quelqu'un qui **sait poser du béton** correctement. Pour le reste, on apprend en le faisant.\n\nViens avec de vieilles chaussures et des gants. Si tu patines, tu connais déjà les endroits qui comptent.",
    tags: ["sport", "bricolage"],
    needs: [
      need("du béton et quelqu'un qui sait le poser", "bricolage"),
      need("des bénévoles le week-end"),
    ],
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
    description:
      "Combien y a-t-il de bancs dans la ville ? Dans quel état ? Lesquels sont à l'ombre, lesquels sont tournés vers un mur ? Personne ne le sait, alors **on les recense**.\n\nChaque banc reçoit une photo, une position, un état (bon, abîmé, cassé) et une note sur l'endroit : calme, bruyant, avec vue, sans raison d'être là. Le tout finira sur une **carte en ligne ouverte**.\n\nOn avance rue par rue, par groupes de deux, avec un téléphone et un carnet. Soixante-douze bancs sont déjà relevés, il en reste sans doute trois fois plus.\n\nPourquoi ? Pour montrer aux élus où il en manque, et où il y en a trop. Et parce que c'est une excellente excuse pour se balader.",
    tags: ["quartier", "sciences"],
    needs: [need("quelqu'un pour la carte en ligne", "code")],
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
    description:
      "Pas d'audition, pas de partition, pas de chef de chœur : **juste le mardi à 19 h**, salle Jean-Moulin.\n\nOn chante ce qui nous vient : des chansons que tout le monde connaît à moitié, des canons, des chants du monde appris à l'oreille. Une personne lance, les autres suivent. Parfois ça sonne très bien. Parfois non, et c'est très bien aussi.\n\nUne dizaine de personnes viennent chaque semaine, entre 14 et 78 ans. Les nouveaux sont accueillis avec un gobelet de tisane et une chanson facile.\n\nOn cherche **un pianiste ou une guitare** pour l'accompagnement, et rien d'autre : **ni niveau requis, ni cotisation**.",
    tags: ["musique", "evenement"],
    needs: [need("un pianiste ou une guitare", "musique")],
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
    description:
      "Les hérissons disparaissent de nos jardins : routes, tontes, pesticides, clôtures trop propres. On a construit **vingt abris en bois** et on les a posés chez des voisins volontaires pour leur offrir un refuge sûr.\n\nChaque abri est numéroté et suivi : on note les passages, les nids, les signes de présence. À la fin de l'hiver, onze avaient été visités, quatre habités.\n\nLe projet est **terminé** : tous les abris sont posés, le suivi se poursuit avec les propriétaires. Les plans sont disponibles dans les fichiers du projet, pour que d'autres puissent en construire.\n\nMerci à toutes celles et ceux qui ont scié, assemblé, déplacé ou simplement laissé un coin de jardin en friche.",
    tags: ["animaux", "jardinage"],
    needs: [need("des planches de récupération", "bricolage", true)],
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
    description:
      "Trois boîtes à livres fabriquées en bois de palette, **installées près des arrêts de bus** : prends, laisse, échange.\n\nLe projet a duré un an. Les boîtes ont été conçues avec un menuisier du quartier, peintes par des élèves du collège, et inscrites au registre des boîtes à livres de la ville.\n\nIl est désormais **archivé** : les boîtes existent, elles vivent leur vie sans nous. On passe de temps en temps vérifier qu'elles n'ont pas été remplies uniquement de manuels de comptabilité.\n\nSi tu veux en installer une dans ton quartier, les plans et la liste de matériel sont dans les fichiers du projet.",
    tags: ["ecriture", "quartier"],
    visibility: "public",
    participation: "open",
    state: "archived",
    ownerId: u.annickR.id,
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
    description:
      "On n'apprend pas à pédaler à 40 ans comme à six : on a peur, on a honte, on n'a plus le même centre de gravité. **Ici, personne ne rit.**\n\nLes séances ont lieu le samedi matin sur le parking du stade, un moniteur pour deux apprenants. On commence sans pédales, on apprend à glisser, puis à tenir l'équilibre, puis on pédale. La plupart des gens roulent seuls au bout de quatre séances.\n\nOn prête des vélos adaptés, des casques et des gants. Plusieurs de nos anciens élèves reviennent aujourd'hui comme moniteurs.\n\nIl nous manque des **vélos à prêter** (idéalement de petite taille) et des **moniteurs bénévoles** pour le samedi.",
    tags: ["sport", "solidarite"],
    needs: [
      need("des vélos à prêter"),
      need("des moniteurs bénévoles", "sport"),
    ],
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
    description:
      "Vingt pages par trimestre, **écrites, dessinées et imprimées par les élèves** du lycée : nouvelles, bandes dessinées, critiques de jeux, reportages sur la cantine, poèmes mal assumés.\n\nLe comité de rédaction se réunit le jeudi midi dans la salle de permanence. Chaque numéro a un thème, voté en début de trimestre. L'impression se fait sur la photocopieuse du CDI, à 200 exemplaires.\n\nLes anciens élèves peuvent aider (mise en page, conseils d'écriture) mais **ce sont les élèves qui décident**, y compris de ce qu'on ne publie pas.\n\n*Prochain numéro : « Ce qu'on a perdu cet été ».* Les textes sont attendus pour la fin du mois.",
    tags: ["ecriture", "dessin"],
    needs: [need("quelqu'un pour la mise en page", "dessin")],
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
    description:
      "Beaucoup de vélos dorment dans les caves, les garages, les cours d'immeubles. Une crevaison, un frein qui coince, et ils ne sortent plus.\n\nOn construit **une remorque à outils** qu'on traîne jusqu'à eux : pompe, démonte-pneus, graisse, clés plates, pièces de récupération. Sur place, on répare ensemble ou on explique comment faire.\n\nLa première tournée est prévue en octobre dans trois résidences du quartier. Le prototype de la remorque est monté, il manque encore le coffre à outils étanche et un bon marquage pour qu'on nous repère de loin.\n\nLe projet est jeune : toutes les idées sont bonnes.",
    tags: ["bricolage", "solidarite"],
    needs: [
      need("une remorque en bon état", "bricolage"),
      need("des clés plates"),
    ],
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
    description:
      "Le mercredi de 18 h à 21 h, des tables pliantes, des pendules qui retardent, et **personne ne s'en plaint**. On joue entre nous, on apprend aux débutants, on commente les parties des autres à voix basse.\n\nPas de niveau minimum : on a des joueurs classés et des gens qui ne connaissent pas encore le roque. Les parties se jouent à cadence libre, et un petit tournoi interne a lieu chaque trimestre.\n\nOn rejoue aussi des parties célèbres de l'histoire des échecs, avec les commentaires des spectateurs qui n'étaient pas là.\n\nSi tu as un jeu et une pendule en bon état dont tu ne te sers plus, **on les adopte volontiers**.",
    tags: ["jeux", "evenement"],
    needs: [need("des pendules en bon état", "jeux")],
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
    description:
      "Il existe en France des milliers de variétés de pommes anciennes, dont la plupart n'ont plus que quelques arbres. On en plante **quarante variétés** dans un champ prêté par un agriculteur, pour les garder vivantes.\n\nChaque arbre est étiqueté, cartographié et suivi. On greffe en février, on plante à l'automne, on récolte trois ans plus tard. Cela demande de la patience. Les premières pommes arriveront en 2028.\n\nLes journées de greffe sont ouvertes à tous, avec un greffeur du coin pour nous montrer les gestes. On apprend à **faire des greffes en fente**, en couronne ou en écusson.\n\n*On cherche quelqu'un qui connaît la greffe depuis longtemps* et saurait corriger nos erreurs.",
    tags: ["jardinage", "environnement"],
    needs: [
      need("quelqu'un qui connaît la greffe", "jardinage"),
      need("des porte-greffes de pommier", "jardinage"),
    ],
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
    description:
      "Un ourlet défait, une fermeture éclair coincée, un manteau trop grand : **on retouche gratuitement**, un mercredi sur deux, dans l'arrière-salle de la médiathèque.\n\nCinq machines, une table de coupe, des boîtes de boutons et de fils donnés par des voisins. On apprend aux gens à faire par eux-mêmes plutôt que de faire à leur place, mais on fait volontiers quand il y a urgence.\n\nOn participe aussi à la **collecte de vêtements** de l'association de quartier, en réparant ce qui peut l'être avant la redistribution.\n\nIl nous manque surtout des **machines à coudre à prêter** pour les ateliers du samedi, plus longs.",
    tags: ["bricolage", "solidarite"],
    needs: [need("des machines à coudre à prêter", "bricolage")],
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
    description:
      "Six balades enregistrées dans le quartier, **à écouter en marchant**. Chaque balade suit un trajet d'une vingtaine de minutes, entrecoupé de sons enregistrés sur place, de témoignages d'habitants et de silences qu'on a laissés exprès.\n\nLe projet est **terminé** : toutes les balades sont publiées, accompagnées d'une carte papier distribuée à la médiathèque et au café du coin.\n\nOn a enregistré une cloche d'église, un marché, une cour d'école vide, la nuit dans le parc. Il y a aussi, à la fin de la quatrième balade, une chorale qui chante sous un pont.\n\nMerci à tous ceux qui ont prêté leur voix, leur micro ou leurs oreilles.",
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
    description:
      "Deux samedis par saison, **gants, sacs et pinces** : on nettoie les berges du canal sur deux kilomètres. On trie, on pèse, on note ce qu'on trouve.\n\nÀ la première sortie : trois vélos, un caddie, un réfrigérateur, quatorze kilos de plastique et une quantité de mégots qu'on préfère ne plus compter. Les chiffres sont publiés après chaque sortie.\n\nCe n'est pas un projet *contre* quelqu'un : c'est un moyen de se retrouver dehors, et de montrer que ces berges nous importent.\n\n**Prochaine sortie** à l'automne, avec l'association de pêche. Les enfants sont les bienvenus.",
    tags: ["environnement", "quartier"],
    needs: [
      need("des gants et des pinces", "environnement"),
      need("quelqu'un pour peser les déchets", "sciences"),
    ],
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
    description:
      "Un ordinateur qui bloque, un mot de passe oublié, un mail qui ressemble à une arnaque : **une heure par semaine pour s'en sortir**, sans jargon ni condescendance.\n\nLes séances ont lieu le mercredi après-midi à la médiathèque. On travaille sur l'ordinateur des participants quand ils en ont un, sur ceux de la médiathèque sinon. On traite les questions réelles : comment envoyer une photo, comment faire un virement, comment reconnaître une arnaque.\n\nL'objectif n'est pas d'apprendre à programmer (même si certains y viennent) mais de **reprendre la main** sur des outils qui paraissent faits pour d'autres.\n\nOn cherche des **volontaires patients** et quelques portables d'occasion à reconditionner.",
    tags: ["code", "entraide-scolaire"],
    needs: [
      need("des ordinateurs portables", "code"),
      need("des volontaires patients"),
    ],
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
    customization: CUSTOMIZATIONS[seed.slug],
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
