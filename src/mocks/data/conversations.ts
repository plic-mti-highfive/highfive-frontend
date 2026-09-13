import {
  conversationSchema,
  messageSchema,
  type Conversation,
  type Message,
} from "@/domain";
import { daysAgo, hoursAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

const fresque = PROJECT_BY_SLUG.get("fresque-murale-collaborative")!;
const maree = PROJECT_BY_SLUG.get("maree-basse-jeu-video")!;

export const directSophie = conversationSchema.parse({
  id: nextId(),
  type: "direct",
  participantIds: [u.alexRivera.id, u.sophieMartin.id],
  createdAt: daysAgo(20),
});

export const canalFresque = conversationSchema.parse({
  id: nextId(),
  type: "channel",
  participantIds: [
    u.alexRivera.id,
    u.sophieMartin.id,
    u.camillePetit.id,
    u.marcLeroy.id,
    u.thomasDupont.id,
    u.claraMartinez.id,
  ],
  projectId: fresque.id,
  createdAt: fresque.createdAt,
});

export const directThomas = conversationSchema.parse({
  id: nextId(),
  type: "direct",
  participantIds: [u.alexRivera.id, u.thomasDupont.id],
  createdAt: daysAgo(15),
});

export const canalMaree = conversationSchema.parse({
  id: nextId(),
  type: "channel",
  participantIds: [
    u.nadiaK.id,
    u.enzoB.id,
    u.marcLeroy.id,
    u.lisaMoreau.id,
    u.alexRivera.id,
  ],
  projectId: maree.id,
  createdAt: maree.createdAt,
});

export const groupeChorale = conversationSchema.parse({
  id: nextId(),
  type: "group",
  title: "Chorale du mardi",
  participantIds: [u.claraMartinez.id, u.alexRivera.id, u.lisaMoreau.id],
  createdAt: daysAgo(60),
});

/** R-MSG7 : demande de message de yanis.f, sans reponse d'alex pour l'instant. */
const messageRequestYanis = conversationSchema.parse({
  id: nextId(),
  type: "direct",
  participantIds: [u.yanisF.id, u.alexRivera.id],
  createdAt: hoursAgo(20),
});

const messageRequestNadia = conversationSchema.parse({
  id: nextId(),
  type: "direct",
  participantIds: [u.nadiaK.id, u.alexRivera.id],
  createdAt: hoursAgo(30),
});

export const CONVERSATIONS: Conversation[] = [
  directSophie,
  canalFresque,
  directThomas,
  canalMaree,
  groupeChorale,
  messageRequestYanis,
  messageRequestNadia,
];

function message(input: {
  conversationId: string;
  authorId: string;
  body: string;
  sentAt: string;
  readBy?: string[];
}): Message {
  return messageSchema.parse({
    id: nextId(),
    conversationId: input.conversationId,
    authorId: input.authorId,
    body: input.body,
    readBy: input.readBy ?? [input.authorId],
    sentAt: input.sentAt,
    deleted: false,
  });
}

/** Doc 23 §9 : contenu et horaires des dernieres conversations. */
export const MESSAGES: Message[] = [
  message({
    conversationId: directSophie.id,
    authorId: u.sophieMartin.id,
    body: "On se voit samedi pour le mur ?",
    sentAt: hoursAgo(6),
  }),
  message({
    conversationId: directSophie.id,
    authorId: u.alexRivera.id,
    body: "Oui, à samedi 9 h alors.",
    sentAt: hoursAgo(3),
  }),
  message({
    conversationId: canalFresque.id,
    authorId: u.camillePetit.id,
    body: "la peinture est commandée",
    sentAt: hoursAgo(4),
  }),
  message({
    conversationId: directThomas.id,
    authorId: u.thomasDupont.id,
    body: "Tu as les dimensions du mur ?",
    sentAt: daysAgo(1),
  }),
  message({
    conversationId: canalMaree.id,
    authorId: u.nadiaK.id,
    body: "le prototype tourne à 60 fps",
    sentAt: daysAgo(1),
  }),
  message({
    conversationId: groupeChorale.id,
    authorId: u.claraMartinez.id,
    body: "on décale à 19 h 30 cette semaine",
    sentAt: daysAgo(18),
  }),
  message({
    conversationId: messageRequestYanis.id,
    authorId: u.yanisF.id,
    body: "Salut, je peux filer un coup de main sur la fresque, tu gères l'équipe ?",
    sentAt: hoursAgo(20),
    readBy: [],
  }),
  message({
    conversationId: messageRequestNadia.id,
    authorId: u.nadiaK.id,
    body: "Dis, tu highfiverais Marée basse si tu testes le prototype ?",
    sentAt: hoursAgo(30),
    readBy: [],
  }),
];
