import { commentSchema, type Comment } from "@/domain";
import { daysAgo, nextId } from "./ids";
import { PROJECT_BY_SLUG } from "./projects";
import * as u from "./users";

const fresque = PROJECT_BY_SLUG.get("fresque-murale-collaborative")!;

function baseComment(
  authorId: string,
  body: string,
  publishedDaysAgo: number,
): Comment {
  return commentSchema.parse({
    id: nextId(),
    projectId: fresque.id,
    authorId,
    body,
    publishedAt: daysAgo(publishedDaysAgo),
    hidden: false,
  });
}

/** Doc 23 §7 : un seul niveau de reponse (R-C4). */
const sophieComment = baseComment(
  u.sophieMartin.id,
  "Je peux venir samedi avec mon appareil. Je ne suis pas pro mais je me débrouille.",
  2,
);
const alexReply = commentSchema.parse({
  id: nextId(),
  projectId: fresque.id,
  authorId: u.alexRivera.id,
  body: "Parfait, viens à 9 h, on te montrera le mur.",
  parentId: sophieComment.id,
  publishedAt: daysAgo(2),
  hidden: false,
});

export const COMMENTS: Comment[] = [
  sophieComment,
  alexReply,
  baseComment(
    u.thomasDupont.id,
    "Est-ce qu'il faut apporter ses propres pinceaux ?",
    5,
  ),
  baseComment(
    u.marcLeroy.id,
    "Beau projet. Je ne peux pas aider mais je passerai voir.",
    7,
  ),
];
