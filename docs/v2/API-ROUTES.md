# API-ROUTES — contrat v2

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

| Methode | Route                        | Entree                      | Sortie                      | Auth/role      | Regles                                                            |
| ------- | ---------------------------- | --------------------------- | --------------------------- | -------------- | ----------------------------------------------------------------- |
| GET     | `/projects`                  | query `q,tags,cursor,limit` | `Paginated<ProjectSummary>` | public         | R-V1 : public + actif seulement                                   |
| GET     | `/projects/:slug`            | —                           | `Project`                   | public/membre+ | R-PR2 (brouillon = porteur seul), R-V3 (prive = equipe)           |
| POST    | `/projects`                  | `ProjectCreateInput`        | `Project` (201)             | connecte       | R-PR1 (refine zod), etat initial `draft`                          |
| PATCH   | `/projects/:slug`            | `ProjectUpdateInput`        | `Project`                   | porteur+       | R-PR1                                                             |
| POST    | `/projects/:slug/transition` | `{transition}`              | `Project`                   | porteur+       | R-PR3..R-PR6, matrice publier/terminer/rouvrir/archiver/reactiver |
| DELETE  | `/projects/:slug`            | `{confirmTitle}`            | 204                         | porteur/admin  | R-PR7 : titre saisi = confirmation                                |
| POST    | `/projects/:slug/transfer`   | `{newOwnerId}`              | `Project`                   | porteur        | R-M2 : ancien porteur -> co-porteur                               |
| GET     | `/me/projects`               | —                           | `ProjectSummary[]`          | connecte       | "Mes projets"                                                     |

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

## Le Mur (`wall.ts`)

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

| Methode | Route                                     | Entree                    | Sortie                  | Auth/role            | Regles                                                               |
| ------- | ----------------------------------------- | ------------------------- | ----------------------- | -------------------- | -------------------------------------------------------------------- |
| GET     | `/conversations`                          | —                         | `ConversationSummary[]` | connecte             | R-MSG7 : `isMessageRequest` tant que le destinataire n'a pas repondu |
| GET     | `/conversations/:conversationId`          | —                         | `Conversation`          | connecte/participant | —                                                                    |
| GET     | `/conversations/:conversationId/messages` | query `cursor`            | `Paginated<Message>`    | connecte/participant | —                                                                    |
| POST    | `/conversations`                          | `ConversationCreateInput` | `Conversation` (201)    | connecte             | R-MSG1/R-MSG2 (2 = direct, 3-50 = groupe)                            |
| POST    | `/conversations/:conversationId/messages` | `MessageCreateInput`      | `Message` (201)         | connecte/participant | R-MSG4 (piece jointe)                                                |
| PATCH   | `/messages/:messageId`                    | `{body}`                  | `Message`               | auteur               | R-MSG5 : fenetre 15 min                                              |
| DELETE  | `/messages/:messageId`                    | —                         | 204                     | auteur               | R-MSG6 : laisse "Message supprime"                                   |
| POST    | `/conversations/:conversationId/read`     | —                         | 204                     | connecte/participant | marque tout comme lu                                                 |

## Notifications (`notifications.ts`)

| Methode | Route                                 | Entree                               | Sortie                     | Auth/role | Regles                                  |
| ------- | ------------------------------------- | ------------------------------------ | -------------------------- | --------- | --------------------------------------- |
| GET     | `/notifications`                      | query `cursor`                       | `Paginated<Notification>`  | connecte  | R-N1/R-N2 : deja regroupees par acteurs |
| POST    | `/notifications/:notificationId/read` | —                                    | 204                        | connecte  | —                                       |
| POST    | `/notifications/read-all`             | —                                    | 204                        | connecte  | —                                       |
| GET     | `/notifications/preferences`          | —                                    | `NotificationPreference[]` | connecte  | R-N4 : defauts app/e-mail               |
| PATCH   | `/notifications/preferences`          | `NotificationPreferencesUpdateInput` | `NotificationPreference[]` | connecte  | —                                       |

## Recherche et fil (`search.ts`)

| Methode | Route                   | Entree                                        | Sortie                                       | Auth/role       | Regles                             |
| ------- | ----------------------- | --------------------------------------------- | -------------------------------------------- | --------------- | ---------------------------------- |
| GET     | `/search`               | query `q,types,tags,sort,cursor,limit` (R-R4) | `SearchResults`                              | public          | filtre `projects`/`users`/`tags`   |
| GET     | `/feed/discover`        | query `cursor`                                | `{moment, items: Paginated<ProjectSummary>}` | public/connecte | "projet du moment" hors pagination |
| GET     | `/tags/:tagId/projects` | query `cursor`                                | `Paginated<ProjectSummary>`                  | public          | page d'un theme                    |

## Administration (`admin.ts`)

| Methode | Route                              | Entree         | Sortie                      | Auth/role | Regles                                       |
| ------- | ---------------------------------- | -------------- | --------------------------- | --------- | -------------------------------------------- |
| GET     | `/admin/reports`                   | query `cursor` | `Paginated<Report>`         | admin     | R-S2 : cibles a 3+ signalements en tete      |
| POST    | `/admin/reports/:reportId/resolve` | `{reason?}`    | `Report`                    | admin     | R-S4 : journalise dans `adminActions`        |
| POST    | `/admin/reports/:reportId/reject`  | `{reason?}`    | `Report`                    | admin     | idem                                         |
| GET     | `/admin/stats`                     | —              | `AdminStats`                | admin     | compteurs calcules en direct depuis le store |
| GET     | `/admin/users`                     | query `cursor` | `Paginated<CurrentUser>`    | admin     | mot de passe jamais renvoye                  |
| POST    | `/admin/users/:userId/suspend`     | `{reason?}`    | 204                         | admin     | journalise                                   |
| GET     | `/admin/projects`                  | query `cursor` | `Paginated<ProjectSummary>` | admin     | —                                            |
| DELETE  | `/admin/projects/:slug`            | —              | 204                         | admin     | R-PR7, journalise                            |
| GET     | `/admin/tags`                      | —              | `Tag[]`                     | admin     | —                                            |

---

## Ecarts vs le modele de domaine (doc 04) et pourquoi

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
