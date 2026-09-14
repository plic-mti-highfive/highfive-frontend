// Composants partages "projets" (mission Decouvrir/Recherche, proprietaire
// de ce dossier). `HeroCard`, `ProjectFeedCard`, `AnimatedCard`, l'ancien
// wrapper `TagPill`/`Avatar`/`AuthorChip` et `Thumbnail` sont supprimes :
// plus aucun appelant (les features `projects`/`user` avaient construit des
// equivalents locaux le temps que ce lot publie les siens — voir rapport de
// mission — et l'ancienne home/carrousel n'existe plus).
export { ProjectCard, type ProjectCardProps } from "./ProjectCard";
export { HighfiveButton, type HighfiveButtonProps } from "./HighfiveButton";
