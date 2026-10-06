# API-ROUTES — contrat v2

> Spec backend (V2-6) : [`backend/SPEC.md`](./backend/SPEC.md) (conventions,
> modele de persistance, regles metier par domaine, IA, ecarts connus) et
> [`backend/openapi.yaml`](./backend/openapi.yaml) (OpenAPI 3.1, toutes les
> routes ci-dessous avec schemas `$ref` vers `backend/schemas/*.json`, generes
> depuis `src/domain/` par `pnpm export:schemas`).

Tableau de reference des routes servies par `src/mocks/handlers/*.ts` et appelees par
`src/api/*.ts`. Prefixe commun `/api` (voir `src/api/client.ts`). Base pour la future
spec backend (V2-6) : chaque handler MSW valide entree/sortie avec les schemas de
`src/domain/` et applique les regles metier listees ici.

Legende auth/role : `public` = aucune connexion requise ; `connecte` = compte actif ou
suspendu ; `porteur+` = porteur ou co-porteur ; `membre+` = porteur, co-porteur ou
membre ; `admin` = role plateforme `admin`.

## Auth (`src/api/auth.ts`, `src/mocks/handlers/auth.ts`)

| Methode | Route                          | Entree                      | Sortie        | Auth/role | Regles appliquees                                 |
| ------- | ------------------------------ | --------------------------- | ------------- | --------- | ------------------------------------------------- |
| POST    | `/auth/login`                  | `LoginInput`                | `Session`     | public    | 401 si identifiants invalides ou compte `deleted` |
| POST    | `/auth/register`               | `RegisterInput`             | `Session`     | public    | 400 si email/pseudo deja pris                     |
| POST    | `/auth/logout`                 | —                           | 204           | connecte  | invalide le jeton en memoire                      |
| GET     | `/me`                          | —                           | `CurrentUser` | connecte  | 401 si non connecte                               |
| POST    | `/auth/password-reset-request` | `PasswordResetRequestInput` | 204           | public    | ne revele jamais si l'email existe                |
| POST    | `/auth/password-reset`         | `PasswordResetInput`        | 204           | public    | —                                                 |

## Tags (`tags.ts`)

| Methode | Route   | Entree | Sortie  | Auth/role | Regles                   |
| ------- | ------- | ------ | ------- | --------- | ------------------------ |
| GET     | `/tags` | —      | `Tag[]` | public    | R-T1/R-T2 : liste fermee |

## Personnes (`users.ts`)

| Methode | Route                       | Entree                   | Sortie                                            | Auth/role | Regles                                         |
| ------- | --------------------------- | ------------------------ | ------------------------------------------------- | --------- | ---------------------------------------------- |
| GET     | `/users/:username`          | —                        | `User`                                            | public    | 404 si compte `deleted`                        |
| PATCH   | `/me`                       | `UserProfileUpdateInput` | `CurrentUser`                                     | connecte  | 403 si `suspended` (bio/avatar verrouilles)    |
| GET     | `/users/:username/projects` | —                        | `{created, collaborations, privateProjectsCount}` | public    | R-V4 : projets prives comptes sans etre nommes |
| GET     | `/feed/people`              | —                        | `UserSummary[]`                                   | public    | colonne d'appui "Des gens a rencontrer"        |

## Projets (`projects.ts`)

| Methode | Route                                           | Entree                      | Sortie                      | Auth/role      | Regles                                                                                                                   |
| ------- | ----------------------------------------------- | --------------------------- | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| GET     | `/projects`                                     | query `q,tags,cursor,limit` | `Paginated<ProjectSummary>` | public         | R-V1 : public + actif seulement                                                                                          |
| GET     | `/projects/:slug`                               | —                           | `Project`                   | public/membre+ | R-PR2 (brouillon = porteur seul), R-V3 (prive = equipe)                                                                  |
| POST    | `/projects`                                     | `ProjectCreateInput`        | `Project` (201)             | connecte       | R-PR1 (refine zod), etat initial `draft`                                                                                 |
| PATCH   | `/projects/:slug`                               | `ProjectUpdateInput`        | `Project`                   | porteur+       | R-PR1                                                                                                                    |
| POST    | `/projects/:slug/transition`                    | `{transition}`              | `Project`                   | porteur+       | R-PR3..R-PR6, matrice publier/terminer/rouvrir/archiver/reactiver                                                        |
| DELETE  | `/projects/:slug`                               | `{confirmTitle}`            | 204                         | porteur/admin  | R-PR7 : titre saisi = confirmation                                                                                       |
| POST    | `/projects/:slug/transfer`                      | `{newOwnerId}`              | `Project`                   | porteur        | R-M2 : ancien porteur -> co-porteur                                                                                      |
| GET     | `/me/projects`                                  | —                           | `ProjectSummary[]`          | connecte       | "Mes projets"                                                                                                            |
| PATCH   | `/projects/:slug/customization`                 | `ProjectCustomization`      | `Project`                   | porteur seul   | remplace tout ; chaque image doit avoir ete televersee pour ce projet (400 sinon)                                        |
| POST    | `/projects/:slug/customization/images`          | multipart `file`            | `{id, url}` (201)           | porteur seul   | JPEG/PNG/WebP/AVIF, 2 Mo max ; referencee au prochain PATCH                                                              |
| DELETE  | `/projects/:slug/customization/images/:imageId` | `{reason?}` (admin)         | 204                         | porteur/admin  | retire aussi l'image de la banniere/galerie ; admin sur le projet d'un autre : journalise `remove_project_media` + motif |

## Highfive (`highfives.ts`)

| Methode | Route                       | Entree | Sortie                   | Auth/role | Regles                                   |
| ------- | --------------------------- | ------ | ------------------------ | --------- | ---------------------------------------- |
| POST    | `/projects/:slug/highfive`  | —      | `{given, highfiveCount}` | connecte  | R-H1 (idempotent), R-H2 (403 si porteur) |
| DELETE  | `/projects/:slug/highfive`  | —      | `{given, highfiveCount}` | connecte  | R-H4 : pas de notification au retrait    |
| GET     | `/projects/:slug/highfives` | —      | `Paginated<UserSummary>` | public    | R-H3 : liste publique                    |

## Equipe, demandes, invitations (`memberships.ts`)

| Methode | Route                                             | Entree                   | Sortie          | Auth/role | Regles                                        |
| ------- | ------------------------------------------------- | ------------------------ | --------------- | --------- | --------------------------------------------- |
| GET     | `/projects/:slug/members`                         | —                        | membre + `user` | public    | —                                             |
| PATCH   | `/projects/:slug/members/:userId`                 | `{role}`                 | `Membership`    | porteur   | nommer/retirer co-porteur                     |
| DELETE  | `/projects/:slug/members/:userId`                 | —                        | 204             | porteur+  | exclusion (R-M4), porteur non exclu           |
| POST    | `/projects/:slug/members/:userId/block`           | —                        | 204             | porteur+  | R-M4 : bloque = true                          |
| POST    | `/projects/:slug/leave`                           | —                        | 204             | connecte  | R-M3 : porteur doit transferer/archiver avant |
| GET     | `/projects/:slug/join-requests`                   | —                        | `JoinRequest[]` | porteur+  | —                                             |
| POST    | `/projects/:slug/join-requests`                   | `JoinRequestCreateInput` | `JoinRequest`   | connecte  | `open` auto-accepte, `on_invite` refuse (403) |
| POST    | `/projects/:slug/join-requests/:requestId/accept` | —                        | 204             | porteur+  | cree l'appartenance `member`                  |
| POST    | `/projects/:slug/join-requests/:requestId/reject` | —                        | 204             | porteur+  | R-D3 : pas de motif renvoye                   |
| GET     | `/projects/:slug/invitations`                     | —                        | `Invitation[]`  | porteur+  | —                                             |
| POST    | `/projects/:slug/invitations`                     | `InvitationCreateInput`  | `Invitation`    | porteur+  | R-I3 : refuse si personne bloquee             |
| POST    | `/invitations/:invitationId/accept`               | —                        | 204             | connecte  | R-I2 : cree l'appartenance au role propose    |
| POST    | `/invitations/:invitationId/reject`               | —                        | 204             | connecte  | —                                             |

## Annonces (`announcements.ts`)

| Methode | Route                                | Entree                    | Sortie               | Auth/role | Regles                     |
| ------- | ------------------------------------ | ------------------------- | -------------------- | --------- | -------------------------- |
| GET     | `/projects/:slug/announcements`      | —                         | avec `author`        | public    | —                          |
| POST    | `/projects/:slug/announcements`      | `AnnouncementCreateInput` | `Announcement` (201) | porteur+  | R-A1                       |
| POST    | `/announcements/:announcementId/pin` | —                         | `Announcement`       | porteur+  | R-A2 : depingle les autres |
| DELETE  | `/announcements/:announcementId`     | —                         | 204                  | porteur+  | —                          |

## Commentaires (`comments.ts`)

| Methode | Route                       | Entree               | Sortie          | Auth/role      | Regles                                     |
| ------- | --------------------------- | -------------------- | --------------- | -------------- | ------------------------------------------ |
| GET     | `/projects/:slug/comments`  | —                    | avec `author`   | public         | R-C1/R-V5, masque les `hidden`             |
| POST    | `/projects/:slug/comments`  | `CommentCreateInput` | `Comment` (201) | connecte       | R-C2 (403 suspendu), R-C4 (un seul niveau) |
| POST    | `/comments/:commentId/hide` | —                    | 204             | porteur+/admin | R-C3                                       |
| DELETE  | `/comments/:commentId`      | —                    | 204             | admin          | R-C3 : suppression admin uniquement        |

## Tâches (`tasks.ts`)

| Methode | Route                     | Entree              | Sortie         | Auth/role | Regles                                               |
| ------- | ------------------------- | ------------------- | -------------- | --------- | ---------------------------------------------------- |
| GET     | `/projects/:slug/columns` | —                   | `Column[]`     | public    | —                                                    |
| POST    | `/projects/:slug/columns` | `ColumnCreateInput` | `Column` (201) | porteur+  | R-K2 : max 6                                         |
| DELETE  | `/columns/:columnId`      | query `moveTo`      | 204            | porteur+  | R-K3 : destination obligatoire, >=1 colonne restante |
| GET     | `/projects/:slug/tasks`   | —                   | `Task[]`       | public    | —                                                    |
| POST    | `/tasks`                  | `TaskCreateInput`   | `Task` (201)   | membre+   | R-K4 : titre seul obligatoire                        |
| PATCH   | `/tasks/:taskId`          | `TaskUpdateInput`   | `Task`         | membre+   | —                                                    |
| POST    | `/tasks/:taskId/move`     | `TaskMoveInput`     | `Task`         | membre+   | glisser-deposer entre colonnes                       |
| DELETE  | `/tasks/:taskId`          | —                   | 204            | membre+   | —                                                    |

## Tableau blanc (`wall.ts`)

| Methode | Route                           | Entree             | Sortie         | Auth/role           | Regles                          |
| ------- | ------------------------------- | ------------------ | -------------- | ------------------- | ------------------------------- |
| GET     | `/projects/:slug/wall`          | —                  | `Wall`         | membre+/observateur | R-W1                            |
| POST    | `/projects/:slug/wall/to-tasks` | `WallToTasksInput` | `Task[]` (201) | membre+             | R-W2 : cree dans la 1re colonne |

## Fichiers (`files.ts`)

| Methode | Route                   | Entree             | Sortie              | Auth/role         | Regles                                                      |
| ------- | ----------------------- | ------------------ | ------------------- | ----------------- | ----------------------------------------------------------- |
| GET     | `/projects/:slug/files` | —                  | `ProjectFile[]`     | public            | —                                                           |
| POST    | `/projects/:slug/files` | multipart `file`   | `ProjectFile` (201) | membre+           | R-F1 (20 Mo/fichier, 200 Mo/projet), R-F2 (types interdits) |
| DELETE  | `/files/:fileId`        | —                  | 204                 | deposant/porteur+ | R-F3                                                        |
| POST    | `/me/avatar`            | multipart `avatar` | `{avatar}`          | connecte          | genere une nouvelle URL d'avatar                            |

## Messagerie (`conversations.ts`)

| Methode | Route                                     | Entree                    | Sortie                         | Auth/role            | Regles                                                                                                        |
| ------- | ----------------------------------------- | ------------------------- | ------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| GET     | `/conversations`                          | —                         | `ConversationSummary[]`        | connecte             | R-MSG7 : `isMessageRequest` tant que le destinataire n'a pas repondu ; `participants` resolus (avatar/pseudo) |
| GET     | `/conversations/:conversationId`          | —                         | `ConversationDetail`           | connecte/participant | `participants` resolus (avatar/pseudo)                                                                        |
| GET     | `/conversations/:conversationId/messages` | query `cursor`            | `Paginated<MessageWithAuthor>` | connecte/participant | `author` resolu ; `attachmentPreview` resolu si piece jointe (R-MSG4)                                         |
| POST    | `/conversations`                          | `ConversationCreateInput` | `Conversation` (201)           | connecte             | R-MSG1/R-MSG2 (2 = direct, 3-50 = groupe)                                                                     |
| POST    | `/conversations/:conversationId/messages` | `MessageCreateInput`      | `MessageWithAuthor` (201)      | connecte/participant | R-MSG4 (piece jointe, `attachmentPreview` resolu)                                                             |
| PATCH   | `/messages/:messageId`                    | `{body}`                  | `MessageWithAuthor`            | auteur               | R-MSG5 : fenetre 15 min                                                                                       |
| DELETE  | `/messages/:messageId`                    | —                         | 204                            | auteur               | R-MSG6 : laisse "Message supprime"                                                                            |
| POST    | `/conversations/:conversationId/read`     | —                         | 204                            | connecte/participant | marque tout comme lu                                                                                          |

## Notifications (`notifications.ts`)

| Methode | Route                                 | Entree                               | Sortie                           | Auth/role | Regles                                                                                                                                                       |
| ------- | ------------------------------------- | ------------------------------------ | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET     | `/notifications`                      | query `cursor`                       | `Paginated<NotificationSummary>` | connecte  | R-N1/R-N2 : deja regroupees par acteurs, `actors` resolus ; R-N3 : `target` resolu (slug/titre projet, titre tache ou id conversation) pour un routage exact |
| POST    | `/notifications/:notificationId/read` | —                                    | 204                              | connecte  | —                                                                                                                                                            |
| POST    | `/notifications/read-all`             | —                                    | 204                              | connecte  | —                                                                                                                                                            |
| GET     | `/notifications/preferences`          | —                                    | `NotificationPreference[]`       | connecte  | R-N4 : defauts app/e-mail                                                                                                                                    |
| PATCH   | `/notifications/preferences`          | `NotificationPreferencesUpdateInput` | `NotificationPreference[]`       | connecte  | —                                                                                                                                                            |

## Recherche et fil (`search.ts`)

| Methode | Route                   | Entree                                        | Sortie                                  | Auth/role       | Regles                                                                                                                         |
| ------- | ----------------------- | --------------------------------------------- | --------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GET     | `/search`               | query `q,types,tags,sort,cursor,limit` (R-R4) | `SearchResults`                         | public          | filtre `projects`/`users`/`tags`, `sort` trie les projets (`recent`/`popular`/`relevant`/`active`)                             |
| GET     | `/feed/discover`        | —                                             | `{moment, sections: DiscoverSection[]}` | public/connecte | "projet du moment" hors section ; `sections` = liste courte (6 max, pas de pagination) par regle de selection, voir ci-dessous |
| GET     | `/tags/:tagId/projects` | query `cursor`                                | `Paginated<ProjectSummary>`             | public          | page d'un theme                                                                                                                |
| GET     | `/feed/tags-trending`   | —                                             | `TrendingTag[]`                         | public          | colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01), 5 maximum, tags actifs sur les projets publics/actifs               |

## Administration (`admin.ts`)

| Methode | Route                              | Entree         | Sortie                      | Auth/role | Regles                                                            |
| ------- | ---------------------------------- | -------------- | --------------------------- | --------- | ----------------------------------------------------------------- |
| GET     | `/admin/reports`                   | query `cursor` | `Paginated<ReportSummary>`  | admin     | R-S2 : cibles a 3+ signalements en tete                           |
| POST    | `/admin/reports/:reportId/resolve` | `{reason?}`    | `Report`                    | admin     | R-S4 : journalise dans `adminActions`                             |
| POST    | `/admin/reports/:reportId/reject`  | `{reason?}`    | `Report`                    | admin     | idem                                                              |
| GET     | `/admin/stats`                     | —              | `AdminStats`                | admin     | compteurs calcules en direct depuis le store                      |
| GET     | `/admin/users`                     | query `cursor` | `Paginated<CurrentUser>`    | admin     | mot de passe jamais renvoye                                       |
| POST    | `/admin/users/:userId/suspend`     | `{reason?}`    | 204                         | admin     | journalise                                                        |
| POST    | `/admin/users/:userId/reactivate`  | `{reason?}`    | 204                         | admin     | leve la suspension, journalise                                    |
| GET     | `/admin/projects`                  | query `cursor` | `Paginated<ProjectSummary>` | admin     | —                                                                 |
| DELETE  | `/admin/projects/:slug`            | —              | 204                         | admin     | R-PR7, journalise ; voir note ci-dessous                          |
| GET     | `/admin/projects/:slug/media`      | —              | `AdminProjectMedia`         | admin     | banniere + galerie, meme d'un projet prive/brouillon (moderation) |
| GET     | `/admin/tags`                      | —              | `Tag[]`                     | admin     | —                                                                 |

**`/feed/discover` — sections (V2, retour utilisateur "Decouvrir connecte
trop pauvre") :** `DiscoverSection` (`src/domain/search.ts`) = `{ id,
items: ProjectSummary[], seeAll: SearchParams }` ; `id` est une liste fermee
(`discoverSectionIdSchema`) — le libelle affiche vit cote front
(`SECTION_LABELS` dans `src/features/home/components/DiscoverSectionBlock.tsx`),
jamais renvoye par l'API. `seeAll` porte les parametres a reappliquer sur
`/recherche` pour le lien "Voir plus" de la section. Regles de selection
(handler `src/mocks/handlers/search.ts`, fonction `buildDiscoverSections`,
bassin = `isDiscoverable` moins le projet du moment) :

| id                   | Regle                                                                                                                     | Visiteur                                               | Connecte                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `for_you`            | partage au moins un theme avec `interests`, tri par derniere activite                                                     | absente                                                | absente si `interests` vide ou 0 resultat |
| `starting`           | tri par `createdAt` decroissant (les plus recents)                                                                        | presente                                               | presente                                  |
| `trending_highfives` | tri par `highfiveCount` decroissant                                                                                       | presente                                               | presente                                  |
| `needs_help`         | au moins un besoin non pourvu, tri par derniere activite                                                                  | presente (absente si aucun projet ne cherche du monde) | idem                                      |
| `near_your_projects` | partage un theme avec les projets dont la personne est membre (porteur inclus), hors ces projets, tri par `highfiveCount` | absente                                                | absente si aucun projet possede/rejoint   |

Chaque section est plafonnee a 6 projets, pas de pagination (remplace
l'ancien fil paginé par tranches de 12). La barre de themes ne filtre plus
ce fil : `tags` a ete retire des parametres de `/feed/discover` (voir
"Sous-barre de tags" ci-dessous).

**Sous-barre de tags (`TagFilterBar`, V2) :** ne filtre plus Decouvrir. Un
clic sur un theme navigue vers `/recherche?type=projets&tags=<id>` ; une
entree finale "Tous les themes" mene a `/recherche?type=tags`. Les themes
affiches viennent de `GET /feed/tags-trending` (5 maximum, deja existant)
completes par les `interests` de la personne connectee, aucune route
supplementaire.

**Note UI (moderation, doc 15 E-35) :** l'ecran d'administration appelle
aussi des routes deja existantes hors `admin.ts`, plutot que d'en dupliquer :
`DELETE /projects/:slug` (`{confirmTitle}`, deja ouvert au role admin dans
son handler, R-PR7) pour supprimer un projet avec confirmation nominative, et
`POST /comments/:commentId/hide` / `DELETE /comments/:commentId` (admin,
R-C3) pour masquer/supprimer un commentaire signale. `DELETE
/admin/projects/:slug` reste dans le contrat (aucun export supprime) mais
n'est plus appele par l'interface, faute de confirmation nominative cote
handler. `GET /admin/reports` renvoie desormais `ReportSummary`
(`reportSchema` etendu de `reporter`, `target` — apercu au mieux depuis les
tables deja jointes cote mock — et `similarReportsCount`), pour que la file
de moderation montre le contenu signale sans nouvelle route.

---

## Ecarts vs le modele de domaine (doc 04) et pourquoi

- **`ProjectSummary.needs`/`ProjectSummary.teamPreview`** (`src/domain/project.ts`,
  lot Decouvrir/Recherche/`ProjectCard`) : ajouts additifs (aucun champ existant
  renomme/retire). `ProjectCard` doit permettre de trancher en 10 s (doc 01 §5,
  doc 11 C1) — besoins non pourvus et visages de l'equipe — sans requete
  supplementaire par carte affichee dans un fil de 12+ projets. `teamPreview`
  reprend le porteur puis jusqu'a 5 membres (`toProjectSummary`,
  `src/mocks/handlers/projectHelpers.ts`).
- **`Project.customization` / `ProjectSummary.accent`** (`src/domain/customization.ts`,
  `src/domain/project.ts`, lot Personnalisation de la fiche) : champs optionnels
  additifs (aucun champ existant renomme/retire). `customization` porte la banniere
  (avec point focal), le theme (palette de quatre couleurs `#rrggbb` : `background`, `panel`, `text`, `accent`,
  toutes obligatoires ensemble, `ProjectTheme`), l'ordre/visibilite des quatre
  sections de l'Apercu et la galerie (8 images max, `alt` obligatoire). Reserve au porteur, elle suit le projet au transfert. `theme.accent` est
  copie dans `ProjectSummary.accent` pour que `ProjectCard` prenne la meme teinte que la
  fiche sans requete supplementaire (`toProjectSummary`,
  `src/mocks/handlers/projectHelpers.ts`). `ProjectSummary.banner` (meme schema que
  `Project.customization.banner`, optionnel) en est la copie pour les cartes `card` et `hero`.
  Trois routes ajoutees (voir « Projets »), decrites dans `docs/v2/customization-scope.md`.
- **`SearchSort` = `"active"`** (`src/domain/search.ts`) ajoute au triplet
  existant `recent/popular/relevant` : le doc 12 (E-02) liste trois tris pour
  `/recherche` — "Les plus récents", "Les plus highfivés", "Les plus actifs" —
  et aucune valeur existante ne portait "le plus d'activite recente"
  (`relevant` reste la pertinence texte). Trie par `lastActivityAt` cote
  handler `/search`.
- **`GET /feed/tags-trending`** : route ajoutee (aucune supprimee/renommee) pour
  la colonne d'appui "Ce qui bouge en ce moment" (doc 12 E-01) — comptage des
  tags sur les projets publics/actifs, absent du contrat initial.
- **`ProjectFile` (`src/domain/file.ts`)** n'etait pas dans la liste de fichiers L2
  demandee explicitement ; ajoute car `src/api/files.ts` a besoin d'un contrat de
  sortie et Les Fichiers sont un objet de domaine a part entiere (doc 04 §12).
  Nomme `ProjectFile` (pas `File`) pour ne pas masquer le type DOM.
- **`highfiveCount` vs lignes `Highfive` reelles** : le jeu de demo ne cree que
  quelques lignes `Highfive` reelles (pour rendre le bouton interactif) mais garde
  les compteurs `highfiveCount` du doc 23 tels quels sur les projets. Un vrai
  backend aurait un historique complet ; le mock ne le reconstitue pas ligne a
  ligne. `R-X2` (compteur toujours serveur) reste respecte : le client ne recalcule
  jamais ce champ.
- **`AdminStats.signupsLast30Days`** est une serie synthetique (doc 23 §11 :
  "courbe irreguliere entre 2 et 14 par jour, pic a 14") independante du nombre
  reel de comptes du jeu de demo (12) — elle represente l'historique complet
  imaginaire de la plateforme. Les autres champs (`usersCount`,
  `activeProjectsCount`...) sont calcules en direct depuis le store mock.
- **Notifications (doc 23 §8)** : deux libelles du doc ("marc.leroy veut
  rejoindre...", "alex.rivera t'invite dans...") entrent en contradiction avec les
  roles fixes par le jeu de demo (marc est co-porteur de Fresque murale ; alex est
  le porteur, donc destinataire logique plutot qu'auteur d'une invitation reçue
  par lui-meme). Adaptes avec des acteurs coherents (yanis.f pour la demande,
  marc.leroy pour l'invitation) en gardant le meme type de notification et la
  meme cible.
- **Equipe complete uniquement sur 5 projets** (Fresque murale, Jardin partage,
  Maree basse, Repair cafe, Distribution de soupe) : les 20 autres projets du jeu
  de demo n'ont que la ligne d'appartenance du porteur (R-M1 est donc respectee
  partout), `membersCount` restant un champ affiche independant du nombre de
  lignes `Membership` reellement modelisees — comme n'importe quel compteur
  serveur (R-X2).
- **25 projets** : le doc 23 §2 n'en liste que 18 ; 7 ont ete ajoutes dans le
  meme ton pour atteindre la volumetrie demandee par le lot (~25).
- **Auth mock** : jeton porteur (Bearer) stocke via `tokenStorage`
  (`src/api/http-client.ts`, deja utilise par `AuthContext`) cote client, et une
  `Map` jeton -> personne en memoire cote mock (`src/mocks/db.ts`). Pas de
  sessionStorage distinct : reutiliser le stockage existant de `AuthContext`
  evite un deuxieme mecanisme de session en parallele.

## Compte de demonstration

`alex.rivera@example.com` / `demo1234` — porteur de _Fresque murale collaborative_
(voir `src/mocks/data/users.ts`, `DEMO_LOGIN`).
