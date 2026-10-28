# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Personnalisation de la fiche projet (porteur seul) : banniere avec point
  focal, palette de couleurs optionnelle (fond, blocs, texte, accent ; imposee a la fiche, contraste garanti), sections de l'Apercu
  ordonnables et masquables, galerie de 8 images au plus. Contrat additif
  (`Project.customization`, `ProjectSummary.accent`, trois routes) documente
  dans `docs/v2/customization-scope.md`, `API-ROUTES.md`, `openapi.yaml` et
  `SPEC.md`. Rendu de la fiche : banniere, palette plein cadre, sections ordonnees,
  galerie et visionneuse accessible, accent sur les cartes. Editeur du
  porteur sur `/projets/:slug/personnaliser` avec apercu live : banniere
  (point focal, texte alternatif obligatoire), sections reordonnables
  par boutons ou glisser-deposer (dnd-kit), galerie, couleurs (presets et
  ajustement libre, en dernier car facultatif), compression WebP cote
  client, garde de sortie. Moderation : bouton « Medias » par projet dans
  l'administration (voir, agrandir, retirer avec motif), journalise sous
  `remove_project_media`.
- La banniere du projet s'affiche sur les cartes `card` et `hero` (fil,
  recherche, profil), recadree autour du point focal ; apercu de la carte dans
  l'editeur de personnalisation. Contrat additif : `ProjectSummary.banner`.
- Contrat de la messagerie etendu, et applique par le backend 2.1.0 :
  - **R-MSG8** — medias : `POST /conversations/:id/attachments`
    (`MessageUpload`), piece jointe `{kind: "upload", uploadId}`, apercu
    avec `mimeType` et `url` signee ; texte facultatif quand une piece
    jointe est presente ; `lastMessage.attachmentKind`.
  - **R-MSG9** — gestion des groupes : `PATCH /conversations/:id`,
    `POST /conversations/:id/participants`,
    `DELETE /conversations/:id/participants/:userId`,
    `POST /conversations/:id/leave` ; champ `adminId`.
  - `MessageBodyUpdateInput` devient un schema exporte.
  - `src/api/conversations.ts` expose les fonctions correspondantes, et le
    mock MSW sert ces routes.
- La bulle de message affiche une image, un lecteur video ou un lien de
  telechargement ; la liste annonce « Piece jointe » pour un message sans
  texte.
- Branchement de la messagerie et des notifications sur le backend :
  - Polling (pas de temps reel, SPEC §5) : fil ouvert toutes les 5 s, liste et
    detail des conversations toutes les 15 s, notifications (et cloche) toutes
    les 30 s ; suspendu quand l'onglet est cache.
  - Fil pagine (`useInfiniteQuery`) : « Messages precedents » charge les plus
    anciens sans faire sauter le defilement ; un nouveau message fait defiler
    seulement si l'on etait en bas, ou si c'est le sien.
  - Un message recu pendant qu'une conversation est ouverte la marque lue ;
    lire ou ecrire rafraichit les notifications (le serveur les eteint).
  - Piece jointe dans la zone de saisie (bouton, ou coller une image) : depot
    puis envoi (R-MSG8), plafonds verifies avant l'envoi, brouillon conserve
    et erreur du serveur affichee si l'envoi echoue.
  - Parametres d'un groupe (R-MSG9) : renommer, voir les membres et
    l'administrateur, ajouter des personnes, retirer (administrateur), quitter.
  - Page Notifications paginee (« Charger la suite »).
  - Erreurs de creation de conversation et d'action sur un message affichees.

### Changed

- Jeu de demo (MSW) beaucoup plus vivant : 23 comptes, un « A propos » sur
  chaque projet hors brouillon, des equipes de 3 a 8 membres, des annonces, des
  fils de commentaires (reponses, commentaire masque, compte supprime), des
  tableaux de taches (echeances, colonnes propres a certains projets), des
  fichiers de tous types, un canal par projet, des conversations et
  notifications pour plusieurs comptes, des signalements dans tous leurs etats.
  Le contenu est coherent (dates, roles, appartenances) et verifie par
  `src/mocks/data/data.test.ts`.
- `DESIGN.md` : exception encadree a la « Deterministic Tint Rule » pour
  l'accent de projet choisi par son porteur.
- R-MSG3 : un canal n'a plus de plafond de participants ; le plafond de 50
  devient propre aux groupes (`GROUP_MAX_PARTICIPANTS`).
- Mock MSW : la premiere page de messages porte les plus recents, comme le
  backend (le mock servait les plus anciens d'abord).
- Un compte suspendu ne voit plus « Modifier » sur ses messages (il peut
  toujours les supprimer).
- R-MSG5 : plus de fenetre de 15 minutes, l'auteur modifie son message a tout
  moment (un message supprime ne se modifie plus). Le menu « Modifier /
  Supprimer » de la bulle reste donc affiche sur ses propres messages — il
  disparaissait apres 15 minutes, suppression comprise.

## [2.0.1] - 2026-09-16

### Fixed

- Les appels API tombent sur l'origine de la page au lieu de
  `http://localhost:3000` fige au build. Dans une image Docker, le front et
  l'API sont servis par la meme gateway et l'URL publique n'est pas connue au
  moment du build : l'interface se chargeait mais aucun appel n'aboutissait.
  `VITE_API_URL` est desormais exposee en `ARG` du Dockerfile, vide par
  defaut, et une base vide signifie « meme origine ».
- Le bundle `docs/v2/backend/schemas/` n'avait pas ete regenere apres le
  passage de `wallToTasksInputSchema` de `elementIds` a `elements` :
  `WallToTasksInput.json` documentait une forme qui n'existait plus ni au
  front ni au back. Le contrat publie decrit de nouveau ce qui est reellement
  accepte.

## [2.0.0] - 2026-09-16

### Added

- Docker support with `Dockerfile` for containerized deployment
- GitHub Actions CI/CD pipeline (`.github/workflows/pipeline.yml`)
