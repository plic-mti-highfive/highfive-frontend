/**
 * Les onglets de la fiche projet (Apercu/Annonces/Equipe) sont des routes,
 * mais changer d'onglet ne change pas de page : tous partagent la meme cle,
 * donc la position de defilement est conservee.
 */
const PROJECT_TABS = /^(\/projets\/[^/]+)\/(?:annonces|equipe)\/?$/;

export function scrollScope(pathname: string): string {
  return PROJECT_TABS.exec(pathname)?.[1] ?? pathname.replace(/(.)\/$/, "$1");
}
