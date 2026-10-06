/** Identifiant DOM d'un commentaire : cible des liens `#comment-…`. */
export function commentAnchor(commentId: string): string {
  return `comment-${commentId}`;
}
