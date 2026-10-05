# SPEC backend — HighFive! v2

Ce document precise le contrat pour l'equipe backend (TypeScript). Il ne
redecrit pas le detail champ par champ des schemas : ceux-ci sont generes
depuis `src/domain/index.ts` (source unique, zod 4) dans `docs/v2/backend/schemas/*.json`
par `pnpm export:schemas`, et exposes comme composants dans
`docs/v2/backend/openapi.yaml` (toutes les routes appelees par `src/api/*.ts`).

Sources qui font foi, dans cet ordre : `src/domain/**` (forme des donnees) >
`src/api/*.ts` (routes reellement appelees, signatures) > `src/mocks/handlers/**`
(regles metier deja codees cote mock, a reproduire cote backend) >
`docs/v2/API-ROUTES.md` (table de synthese). Les documents produit
(`04-MODELE-DOMAINE.md`, `05-ROLES-PERMISSIONS.md`, `18-IA-PRODUIT.md`,
`22-PLAN-DE-BASCULE.md`) donnent l'intention et les regles non encore codees.
En cas de divergence entre le mock et un document produit, ce document le
signale explicitement (section 8).

---

## 1. Conventions

### 1.1 Prefixe, transport

Toutes les routes sont prefixees `/api` (voir `src/api/client.ts`,
`buildUrl`). Corps et reponses en JSON (`Content-Type: application/json`),
sauf upload de fichier (`multipart/form-data`, `POST /projects/{slug}/files`
et `POST /me/avatar`). Pas de sous-domaine ni de versionnement d'URL prevu
pour l'instant (`VITE_API_URL` fixe l'origine cote client).

### 1.2 Authentification

Jeton porteur (`Authorization: Bearer <token>`). Le mock utilise un jeton
opaque (`nextId()`) associe a une personne en memoire, sans expiration — **a
corriger cote backend** : jeton avec expiration (JWT signe ou opaque +
session en base avec `expires_at`), plus `POST /auth/refresh` si un jeton de
rafraichissement est ajoute (non present dans le contrat front actuel, donc
non ajoute ici sans besoin exprime — voir section 8 si le produit en a
besoin plus tard).

Routes : `POST /auth/login`, `POST /auth/register` (201, cree la session),
`POST /auth/logout` (invalide le jeton cote serveur), `GET /me` (session
courante), `POST /auth/password-reset-request` (204 toujours, ne revele
jamais si l'email existe), `POST /auth/password-reset`.

`credentials: "include"` est envoye par le client (`src/api/client.ts`) sans
que rien n'en depende cote cookies aujourd'hui ; le jeton porte
l'authentification. Le backend n'a pas besoin de cookies de session.

### 1.3 Format d'erreur

Une seule forme, `ApiErrorBody` (`docs/v2/backend/schemas/ApiErrorBody.json`) :

```ts
{ code: string; message: string; details?: unknown }
```

Codes utilises par le mock aujourd'hui : `unauthorized` (401), `forbidden`
(403), `not_found` (404), `validation_error` (400, `details` = tableau
d'issues zod ou objet `{champ: message}`). **Extensions recommandees pour le
backend**, documentees route par route dans la section 5 :

- `conflict` (409) : contrainte d'unicite violee (email/pseudo deja pris a
  l'inscription — le mock repond `400 validation_error`, un vrai backend
  devrait repondre `409 conflict` ; le front ne distingue pas les codes
  aujourd'hui, `ApiError` est generique, donc ce changement est sans risque
  cote front) ; transition d'etat incoherente avec l'etat courant du projet.
- `422` reste `validation_error` mais qualifie une violation de regle
  metier sur un corps par ailleurs syntaxiquement valide (ex. R-PR1 : viole
  par le `.refine` zod, donc deja intercepte avant meme d'atteindre la
  logique metier — a documenter dans les messages d'erreur plutot que
  d'ajouter un code distinct).

`message` est toujours en francais, redige pour un affichage direct (le
front ne le retraduit pas).

### 1.4 Pagination

Curseur opaque, meme forme partout (`Paginated<T>`, `docs/v2/backend/schemas/Paginated*.json`) :

```ts
{ items: T[]; nextCursor: string | null; total: number }
```

Le mock encode le curseur en base64 d'un offset numerique
(`src/mocks/handlers/utils.ts`, `paginate`). Le backend est libre du
format reel du curseur (keyset sur `created_at`/`id` recommande pour un
vrai volume — l'offset encode ne passe pas a l'echelle et se desynchronise
si des lignes sont inserees entre deux pages) du moment que le curseur reste
opaque au client. Taille de page par defaut : 20 (`limit` optionnel, borne
`1..100` par `cursorPaginationSchema`, `docs/v2/backend/schemas/CursorPagination.json`).

`total` est le compte total non filtre par pagination : cout potentiellement
eleve sur de grandes tables (`COUNT(*)` a chaque page) — envisager un
`total` approximatif ou mis en cache si la volumetrie grossit ; aucun ecran
front n'en depend pour une exactitude stricte (affichage indicatif).

### 1.5 Dates, identifiants

Toute date est une chaine ISO 8601 UTC (`isoDateTimeSchema` = `z.iso.datetime()`,
donc suffixe `Z` obligatoire, pas d'offset). `dueDate`/`signupsLast30Days.date`
sont des dates seules (`z.iso.date()`, `AAAA-MM-JJ`). R-X1 (doc 04) : c'est
au front d'afficher relatif/absolu, le backend renvoie toujours la date
exacte.

Identifiants internes en `uuid` (v4, `idSchema`). Deux identifiants publics
distincts et stables, utilises dans les routes (R-X4 — jamais d'id
technique affiche) : `slug` pour un projet (derive du titre a la creation,
suffixe numerique si collision, stable apres publication — voir
`src/mocks/handlers/projects.ts`), `username` pour une personne (immuable
apres 7 jours selon doc 04 §2 — **non applique par le mock**, a implementer
cote backend : refuser `PATCH /me` sur `username`... en realite `username`
n'est meme pas modifiable via `UserProfileUpdateInput`, doc a jour ; la regle
des 7 jours ne s'applique donc qu'a une future route de changement de
pseudo, absente du contrat actuel).

### 1.6 Idempotence

`POST /projects/{slug}/highfive` et `DELETE .../highfive` sont idempotents
par construction (R-H1 : au plus un highfive par personne et par projet —
cle primaire composite `(project_id, user_id)`, `INSERT ... ON CONFLICT DO
NOTHING` / `DELETE` simple). Les autres `POST` d'action (transitions,
accept/reject, pin, block...) sont idempotents en effet (rejouer la meme
requete ne cree pas de doublon) mais pas au sens strict HTTP (pas de cle
d'idempotence dediee) : sans objet ici, aucun de ces appels ne manipule
d'argent ni de ressource externe couteuse. `PATCH`/`PUT` : le contrat
n'utilise que `PATCH`, jamais `PUT` (mises a jour partielles uniquement,
voir chaque `*UpdateInput`).

### 1.7 Validation des corps

Le backend doit valider chaque corps avec **les memes schemas zod** que le
front (`src/domain/*Schema`), pas une reimplementation. Concretement,
publier le contenu de `src/domain/` (moins les seuls exports non-schema :
`TAGS`, `getTagById`) comme le futur package `contracts` decrit par
`22-PLAN-DE-BASCULE.md` §2-3, et l'importer cote `api` pour valider
entree/sortie exactement comme le fait chaque handler MSW aujourd'hui
(`schema.safeParse(...)`). C'est ce qui garantit qu'`openapi.yaml`
(genere des memes schemas via `docs/v2/backend/schemas/*.json`) ne derive
jamais du code qui valide reellement les requetes.

---

## 2. Modele de persistance propose

Modele relationnel (PostgreSQL suppose, mais transposable). Les colonnes
`created_at`/`updated_at` triviales ne sont pas repetees dans les notes ; les
contraintes listees sont celles qui portent une regle metier (R-xx).

| Table                       | Colonnes cles                                                                                                                                                                                                                                                                         | Contraintes / notes                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`                     | `id` uuid PK, `username` unique, `display_name` nullable, `email` unique, `avatar_url`, `bio` nullable, `account_status` enum, `platform_role` enum, `password_hash`, `created_at`, `last_visit_at`, `deleted_at` nullable                                                            | R-P2 : `deleted_at` non null anonymise `username` en fonction (`compte-supprime-<id>` pour garder l'unicite), vide `email`/`password_hash`.                                                                                                                                                                                                                                                                        |
| `user_interests`            | `user_id` FK, `tag_id` FK, PK composite                                                                                                                                                                                                                                               | 0 a 10 lignes par personne (`interests`, borne applicative) ; jointure plutot qu'un tableau, pour l'index et l'integrite referentielle vers `tags`.                                                                                                                                                                                                                                                                |
| `tags`                      | `id` slug PK (pas d'uuid — identifiant public stable), `label`, `family` enum, `accent` enum, `active` bool default true                                                                                                                                                              | R-T1 : suppression = `active = false`, jamais de `DELETE`. Liste fermee, seed a la creation (24 lignes, doc 04 §7), pas de route de creation cote front (R-T2).                                                                                                                                                                                                                                                    |
| `projects`                  | `id` uuid PK, `slug` unique, `owner_id` FK users, `title`, `tagline`, `description` nullable, `visibility` enum, `participation` enum, `state` enum, `member_limit` nullable int, `highfive_count` int (cache), `created_at`, `updated_at`, `last_activity_at`, `deleted_at` nullable | Check `visibility='private' => participation='on_invite'` (R-PR1, en plus du `.refine` zod applicatif — defense en profondeur). `highfive_count` recalcule par trigger sur `highfives` ou recompte a la volee ; jamais ecrit par une route (R-PR8/R-X2).                                                                                                                                                           |
| `project_tags`              | `project_id` FK, `tag_id` FK, PK composite                                                                                                                                                                                                                                            | 1 a 5 lignes par projet (borne applicative, pas de check SQL portable simple).                                                                                                                                                                                                                                                                                                                                     |
| `needs`                     | `id` uuid PK, `project_id` FK, `label`, `tag_id` nullable FK tags, `fulfilled` bool default false, `fulfilled_at` nullable                                                                                                                                                            | Max 6 par projet (applicatif). Un besoin `fulfilled` reste renvoye barre 7 jours (filtre `fulfilled_at > now() - interval '7 days'` au moment de la lecture, puis exclu de la reponse — pas de job de purge necessaire).                                                                                                                                                                                           |
| `memberships`               | `project_id` FK, `user_id` FK, `role` enum, `joined_at`, `blocked` bool default false, PK composite                                                                                                                                                                                   | R-M1 : exactement un `owner` par projet — index unique partiel `WHERE role = 'owner'` sur `project_id`. Transferts (`R-M2`) et creation de projet doivent rester transactionnels avec la mise a jour de `projects.owner_id`.                                                                                                                                                                                       |
| `join_requests`             | `id` uuid PK, `project_id` FK, `user_id` FK, `message` nullable, `status` enum, `created_at`, `decided_at` nullable                                                                                                                                                                   | Index unique partiel `(project_id, user_id) WHERE status = 'pending'` pour empecher les doublons (absent du mock, a ajouter — voir section 8). R-D2 : une demande refusee peut etre renouvelee apres 30 jours — verifier `decided_at` a la creation plutot qu'un index.                                                                                                                                            |
| `invitations`               | `id` uuid PK, `project_id` FK, `sender_id` FK, `recipient_id` FK, `proposed_role` enum (sans `owner`), `message` nullable, `status` enum, `expires_at`, `created_at`                                                                                                                  | R-I1 : un job planifie (ou un calcul a la lecture, `status = 'pending' AND expires_at < now()` -> traiter comme expiree) fait passer `status` a `expired`.                                                                                                                                                                                                                                                         |
| `highfives`                 | `project_id` FK, `user_id` FK, `given_at`, PK composite                                                                                                                                                                                                                               | R-H1 : la PK composite garantit l'unicite et rend give/withdraw idempotents.                                                                                                                                                                                                                                                                                                                                       |
| `announcements`             | `id` uuid PK, `project_id` FK, `author_id` FK, `title`, `body`, `pinned` bool default false, `published_at`                                                                                                                                                                           | R-A2 : index unique partiel `project_id WHERE pinned = true` — epingler doit alors dans la meme transaction depingler l'ancienne (`UPDATE ... SET pinned = false WHERE project_id = $1` puis l'insertion/mise a jour), pas une contrainte seule.                                                                                                                                                                   |
| `comments`                  | `id` uuid PK, `project_id` FK, `author_id` FK, `body`, `parent_id` nullable FK comments, `published_at`, `hidden` bool default false                                                                                                                                                  | R-C4 : check applicatif — refuser un `parentId` dont le commentaire cible a lui-meme un `parent_id` non nul (un seul niveau).                                                                                                                                                                                                                                                                                      |
| `columns`                   | `id` uuid PK, `project_id` FK, `label`, `order` int, `color` enum nullable                                                                                                                                                                                                            | R-K1 : 3 colonnes creees avec le projet (A faire/En cours/Fait). R-K2 : 1 a 6 par projet (applicatif, verifie a l'insertion).                                                                                                                                                                                                                                                                                      |
| `tasks`                     | `id` uuid PK, `column_id` FK columns, `title`, `details` nullable, `due_date` date nullable, `order` int, `created_by` FK users, `created_at`, `wall_origin_id` nullable                                                                                                              | `wall_origin_id` : identifiant opaque cote document tldraw (pas une FK, Tableau blanc n'est pas relationnel).                                                                                                                                                                                                                                                                                                      |
| `task_assignees`            | `task_id` FK, `user_id` FK, PK composite                                                                                                                                                                                                                                              | R-K5 : plusieurs assignes possibles -> table de jointure plutot qu'un tableau.                                                                                                                                                                                                                                                                                                                                     |
| `walls`                     | `project_id` PK/FK, `snapshot_url` nullable, `updated_at`                                                                                                                                                                                                                             | Le document collaboratif (tldraw/Yjs) ne vit pas ici : voir section 6. Une ligne par projet, creee avec lui.                                                                                                                                                                                                                                                                                                       |
| `project_files`             | `id` uuid PK, `project_id` FK, `uploaded_by` FK users, `name`, `size` bigint, `mime_type`, `storage_key`, `uploaded_at`                                                                                                                                                               | R-F1 : verifier la taille avant/au moment de l'ecriture objet (20 Mo/fichier), et la somme des tailles du projet (200 Mo) dans la meme transaction que l'insertion. `storage_key` : cle vers le stockage objet (S3-like), pas le contenu en base.                                                                                                                                                                  |
| `conversations`             | `id` uuid PK, `type` enum, `project_id` nullable FK projects (unique quand `type='channel'`), `title` nullable, `created_at`                                                                                                                                                          | R-MSG3 : un canal est cree/supprime avec le projet, jamais manuellement.                                                                                                                                                                                                                                                                                                                                           |
| `conversation_participants` | `conversation_id` FK, `user_id` FK, `last_read_at` nullable, PK composite                                                                                                                                                                                                             | Remplace le tableau `participantIds` du schema domaine (forme API) par une table normalisee ; `last_read_at` remplace `message.readBy[]` cote persistance (calcule `unreadCount` par `count(messages where sent_at > last_read_at and author_id != user_id)`) — bien plus economique qu'une ligne de lecture par message. La forme `readBy[]`/`MessageWithAuthor` reste la forme **API**, recalculee a la lecture. |
| `messages`                  | `id` uuid PK, `conversation_id` FK, `author_id` FK, `body`, `attachment_kind` enum nullable, `attachment_project_id`/`attachment_file_id` nullable, `sent_at`, `edited_at` nullable, `deleted` bool default false                                                                     | R-MSG5 : fenetre de modification verifiee applicativement (`now() - sent_at < 15 min`). R-MSG6 : suppression = `deleted = true`, `body` vide, jamais un `DELETE` SQL (l'historique de conversation reste coherent).                                                                                                                                                                                                |
| `notifications`             | `id` uuid PK, `recipient_id` FK, `type` enum, `target_type` enum, `target_id` uuid, `read` bool default false, `created_at`                                                                                                                                                           | R-N2 regroupement : voir `notification_actors`.                                                                                                                                                                                                                                                                                                                                                                    |
| `notification_actors`       | `notification_id` FK, `user_id` FK, PK composite                                                                                                                                                                                                                                      | Remplace `actorIds[]` : permet d'ajouter un acteur a une notification existante (regroupement) par un simple `INSERT` plutot qu'un `UPDATE` de tableau — c'est le mecanisme qui realise R-N2 (« Sophie et 4 autres... ») : un evenement sur une cible deja notifiee ajoute une ligne ici au lieu de creer une nouvelle notification.                                                                               |
| `notification_preferences`  | `user_id` FK, `type` enum, PK composite, `channels` enum[] (ou table `notification_preference_channels`)                                                                                                                                                                              | R-N4 : lignes absentes = defauts (`EMAIL_BY_DEFAULT` du mock : `invitation_received`, `join_request_received`, `message_received` incluent `email`, le reste `app` seul) — calcules a la lecture, pas materialises pour toutes les personnes.                                                                                                                                                                      |
| `reports`                   | `id` uuid PK, `reporter_id` FK, `target_type` enum, `target_id` uuid, `reason` enum, `detail` nullable, `status` enum, `handled_by` nullable FK users, `created_at`                                                                                                                   | `target_id` n'est pas une FK typee (cible polymorphe selon `target_type`) — integrite verifiee applicativement a la creation.                                                                                                                                                                                                                                                                                      |
| `admin_actions`             | `id` uuid PK, `admin_id` FK, `type` enum, `target_type` enum, `target_id` uuid, `reason` nullable, `created_at`                                                                                                                                                                       | R-S4 : table append-only (aucune route `UPDATE`/`DELETE` ne doit exister dessus), consultable en administration (pas encore exposee par une route front — voir section 8).                                                                                                                                                                                                                                         |
| `sessions`                  | `token_hash` PK, `user_id` FK, `created_at`, `expires_at`                                                                                                                                                                                                                             | Absent du mock (`Map` en memoire). A ajouter : stocker un hash du jeton, pas le jeton en clair ; `POST /auth/logout` supprime la ligne.                                                                                                                                                                                                                                                                            |

Index recommandes au-dela des PK/FK/uniques ci-dessus : `projects (visibility, state, last_activity_at)` (fil/recherche, R-V1), `projects (owner_id)`, `memberships (user_id)`, `highfives (user_id)`, `notifications (recipient_id, created_at)`, `comments (project_id, published_at)`, `messages (conversation_id, sent_at)`.

### 2.1 Champs derives, toujours calcules serveur (R-X2)

Aucun de ces champs n'est jamais accepte en entree : `Project.highfiveCount`,
`ProjectSummary.membersCount`/`teamPreview` (porteur puis jusqu'a 5 membres,
`toProjectSummary`), `ConversationSummary.unreadCount`/`lastMessage`,
`NotificationSummary.actors`/`target`, `ReportSummary.similarReportsCount`
(nombre de signalements distincts sur la meme cible, R-S2) et `.target`
(apercu au mieux depuis les tables deja jointes), `AdminStats.*` (comptes en
direct, sauf `signupsLast30Days` qui reste une serie a definir cote backend
— le mock la synthetise, doc 23 §11).

`Project.lastActivityAt` : mis a jour a toute ecriture dans Le Lab (tache
creee/deplacee/modifiee, colonne creee/supprimee, Mur modifie, fichier
depose) et sur la fiche (annonce publiee, commentaire poste, projet modifie).
Alimente R-PR6 (archivage automatique a 180 jours d'inactivite, absent du
mock — voir section 8) et le tri `sort=active` de la recherche.

### 2.2 Suppression differee (R-X3)

Toute suppression d'un objet racine (`projects`, `users`) passe par
`deleted_at` plutot qu'un `DELETE` immediat : 30 jours restaurables, sauf
demande explicite de suppression immediate (RGPD). Le mock supprime
immediatement (`db.projects.remove(...)`) — **ecart assume** pour la duree
du chantier front (25 projets de demo, pas de vrai historique a preserver),
a corriger cote backend des la premiere version. Toute lecture (fiche,
recherche, fil, profil) filtre `deleted_at IS NULL` ; un job planifie purge
apres 30 jours.

---

## 3. Par domaine

Chaque route est documentee dans `openapi.yaml` (parametres, corps, reponses,
`$ref` vers les schemas). Cette section porte ce qu'OpenAPI ne dit pas :
qui a le droit, quelles regles metier server-side, quels effets de bord.
Legende role : voir `docs/v2/API-ROUTES.md` (public / connecte / porteur+ /
membre+ / admin), matrice complete dans `05-ROLES-PERMISSIONS.md` §3.

### Auth (6 routes)

Roles : `public` sauf `POST /auth/logout` et `GET /me` (connecte).
Regles : voir §1.2. `POST /auth/register` verifie l'unicite `email` et
`username` (409 recommande, voir §1.3) ; `password` hache (jamais stocke ni
renvoye en clair — le mock le stocke tel quel, `passwordHash: parsed.data.password`,
**a corriger imperativement** cote backend, ex. argon2/bcrypt).
`POST /auth/password-reset-request` ne doit jamais permettre de deduire si
un email existe (meme delai de reponse, toujours 204) : envoyer un email
avec jeton a usage unique si le compte existe, ne rien faire sinon, sans
que la difference soit observable cote reseau.

### Tags (1 route)

`GET /tags` public, liste fermee des tags `active = true` (R-T1/R-T2).
Aucune route de creation/modification cote front v2 (administration des tags
via `GET /admin/tags` seulement — lecture ; voir section 8 pour la gestion).

### Personnes (4 routes)

`GET /users/{username}` public, 404 si `deleted_at` non null ou
`account_status = deleted`. `PATCH /me` connecte, 403 si `suspended`
(R-P1 : bio/avatar verrouilles — le backend doit donc rejeter meme un corps
qui ne touche que `interests`, la regle porte sur l'ensemble de la route).
`GET /users/{username}/projects` public : `created` = projets dont la
personne est `owner`, `collaborations` = projets ou elle est
`co_owner`/`member`/`observer`, tous publics et `state IN (active, done)`
(R-V4) ; `privateProjectsCount` = compte des projets prives de la personne,
jamais nommes. `GET /feed/people` public, colonne d'appui — pas de regle
metier stricte cote mock (retourne un echantillon), a affiner si besoin
produit (diversite, exclusion des personnes deja suivies...).

### Projets (11 routes)

Roles detailles dans `docs/v2/API-ROUTES.md`. Regles serveur principales :

- **Creation** (`POST /projects`) : connecte + compte `active` ; etat
  initial toujours `draft`, `ownerId` = personne connectee (jamais un champ
  du corps) ; cree aussi la `membership` `owner` dans la meme transaction.
- **Modification** (`PATCH /projects/{slug}`) : porteur/co-porteur. Le
  `.refine` R-PR1 (prive => `on_invite`) s'applique au resultat final
  (fusion du corps partiel avec l'etat courant), pas seulement au corps
  recu — un `PATCH { visibility: "private" }` sur un projet
  `participation: "open"` doit etre refuse cote backend meme si le corps ne
  contient pas `participation` (le mock actuel ne fusionne pas avant de
  revalider ; **a corriger**, sinon R-PR1 est contournable en deux
  requetes).
- **Transition** (`POST /projects/{slug}/transition`) : matrice R-PR3..R-PR6
  reproduite dans `openapi.yaml`. Publier exige titre/accroche/tag (deja
  garanti par les bornes du schema, donc seule la presence d'au moins un tag
  est reverifiee — un projet ne peut pas perdre son dernier tag). Archiver
  automatique a 180 jours d'inactivite (R-PR6) : **absent du mock**, job
  planifie a ajouter cote backend (notification au porteur 14 jours avant).
- **Suppression** (`DELETE /projects/{slug}`) : porteur ou admin,
  confirmation nominative (`confirmTitle` doit egaler le titre exact,
  sensible a la casse comme le mock). Passe par `deleted_at` (§2.2), pas un
  `DELETE` SQL.
- **Transfert** (`POST /projects/{slug}/transfer`) : porteur uniquement.
  R-M2 exige "l'accord explicite" du nouveau porteur au moment du transfert
  — **le mock l'applique immediatement sans accord** (ecart, voir section 8) ; le backend devrait creer une invitation de transfert acceptee par le
  destinataire plutot qu'un transfert direct, si le produit le confirme.
- **Personnalisation de la fiche** (`PATCH /projects/{slug}/customization`,
  `POST` et `DELETE /projects/{slug}/customization/images[/{imageId}]`) :
  banniere, accent, sections et galerie, voir `docs/v2/customization-scope.md`.
  Regles serveur :
  - **Porteur seul** (`project.ownerId`, compte `active`) : un co-porteur
    n'a pas ce droit, contrairement a `PATCH /projects/{slug}`. La
    personnalisation fait partie du projet et **suit le transfert** de
    propriete sans etre remise a zero.
  - Le `PATCH` **remplace** l'objet complet (`Project.customization`) ; le
    `PATCH /projects/{slug}` generique l'ignore.
  - Regles que le JSON Schema ne represente pas (`superRefine`) : `sections`
    contient chacune des quatre sections (`pinned`, `about`, `gallery`,
    `comments`) exactement une fois ; les `id` de la galerie sont uniques ;
    la galerie compte 8 images au plus ; chaque image porte un `alt`
    non vide, sauf si `decorative` est vrai ; les URLs d'images sont en
    `https://` (ou `data:image/` dans le mock), jamais d'autre schema.
  - Chaque `id` d'image du corps doit appartenir a ce projet (televerse via
    `POST .../images`) : sinon 400. Ne jamais accepter une URL arbitraire.
  - **Images** : `multipart/form-data`, champ `file`, JPEG/PNG/WebP/AVIF
    uniquement (verifier le type MIME reel du contenu, pas le `Content-Type`
    declare), 2 Mo au plus (le client compresse en WebP avant l'envoi).
    Les images televersees mais jamais referencees par un `PATCH` doivent
    etre **nettoyees cote backend** (job planifie ou TTL).
  - **Projet prive** (R-V3) : les URLs d'images d'un projet prive ne doivent
    pas etre publiquement devinables (URL signees ou controle d'acces sur le
    stockage objet), comme pour R-F4.
  - **Moderation** : un admin peut `DELETE` une image de n'importe quel
    projet ; l'action est journalisee comme les autres actions admin
    (§3 "Administration"). Le mock ne journalise pas encore (ecart, §6).
- **Limite de membres** (R-M5, doc 04 §5) : `member_limit` (2 a 200) fixee
  par le porteur, absente du contrat actuel (`ProjectUpdateInput` ne porte
  pas ce champ) — voir section 8. L'atteindre bascule `participation` en
  `on_request` et affiche "Complet" : logique a ecrire si le champ est
  ajoute au contrat.

### Highfive (3 routes)

R-H1 (un par personne/projet, reversible, idempotent via PK composite),
R-H2 (403 si `userId === project.ownerId`), R-H3 (liste publique), R-H4
(retirer ne notifie jamais). `highfiveCount` recalcule a chaque
give/withdraw (trigger ou recompte transactionnel).

### Equipe, demandes, invitations (13 routes)

R-M1 (exactement un `owner`, garanti par l'index unique partiel §2) ; R-M3
(le porteur ne peut pas `leave` sans avoir transfere/archive — 403) ; R-M4
(exclure = `DELETE` la ligne `membership` ; bloquer = `blocked = true`, ce
qui empeche de rejoindre a nouveau et de commenter, R-V8). Demandes :
`participation = open` accepte automatiquement (cree la `membership` dans la
meme transaction que la demande, statut `accepted` d'emblee) ;
`on_invite` refuse toute demande (403) ; `on_request` cree une demande
`pending`. R-D2 (renouveler une demande refusee apres 30 jours) et l'index
unique anti-doublon `pending` : absents du mock, a ajouter (section 8).
Invitations : R-I1 (expiration 30 jours, calculee a la creation), R-I2
(acceptee => `membership` au role propose), R-I3 (403 si la personne visee
est `blocked` sur ce projet). `proposedRole` exclut `owner`
(`membershipRoleSchema.exclude(["owner"])`).

### Annonces (4 routes)

R-A1 (porteur/co-porteur seuls peuvent publier/epingler/supprimer). R-A2
(une seule epinglee — transaction depingle+epingle, §2). R-A3 (publier
notifie les membres et les personnes ayant highfive le projet — effet de
bord a implementer, absent du mock qui ne genere aucune notification
reelle sur cette route ; le jeu de donnees demo pre-remplit des notifications
statiques, voir `23-DONNEES-DEMO.md`).

### Commentaires (4 routes)

R-C1/R-V5 (visibilite suit la fiche ; la liste masque les `hidden`, sauf
peut-etre pour le porteur/l'admin qui les a masques — **a trancher cote
produit** : le mock masque pour tout le monde y compris l'auteur du
masquage, aucune route ne renvoie les commentaires masques). R-C2 (403 si
compte suspendu). R-C4 (un seul niveau : refuser un `parentId` dont le
commentaire cible a deja un `parentId`). R-C3 (masquer = porteur/co-porteur
ou admin, `hidden = true` ; supprimer = admin seul, `DELETE` reel).
R-V8 (deux personnes bloquees mutuellement ne voient plus leurs commentaires
reciproques — a filtrer a la lecture, absent du mock).

### Tâches, colonnes (8 routes)

R-K1 (3 colonnes par defaut a la creation du projet — "A faire", "En
cours", "Fait"). R-K2 (1 a 6 colonnes, verifie a l'insertion). R-K3
(supprimer une colonne exige `moveTo`, refuse si c'est la derniere colonne
du projet — deplace les taches dans la meme transaction que la suppression).
R-K4 (titre seul obligatoire). R-K5 (plusieurs assignes,
`task_assignees`). R-K6 (`dueDate` purement informative, jamais une
contrainte serveur). R-K7 (assigner quelqu'un notifie — seul evenement des
Taches qui notifie ; rien d'autre dans ce domaine ne le fait).

### Tableau blanc (2 routes)

R-W1 (edition reservee aux membres ; lecture seule pour les observateurs
selon le reglage du porteur, doc 05 §3.3 note 1 — **reglage absent du
contrat actuel**, `Project` ne porte pas de champ "Mur/Taches ouverts aux
observateurs" ; a ajouter si le produit veut vraiment ce controle fin, sinon
appliquer le defaut fixe du doc : Mur et Taches en lecture pour les
observateurs). R-W2 (conversion en taches dans la colonne "A faire", lien
vers l'origine conserve via `wallOriginId`). Le document collaboratif
lui-meme est hors REST : voir section 6.

### Fichiers (4 routes)

R-F1 (20 Mo/fichier verifie avant l'ecriture objet ; 200 Mo/projet verifie
par somme transactionnelle au moment de l'insertion — race condition
possible sur deux uploads simultanes proches de la limite, acceptable a ce
volume). R-F2 (types autorises : images, PDF, audio, archives ; executables
refuses — verifier le type MIME reel du contenu, pas seulement l'extension
ou le `Content-Type` declare par le client). R-F3 (suppression : deposant,
porteur ou co-porteur). R-F4 (fichiers d'un projet public = publics, donc
`GET /projects/{slug}/files` reste sans auth ; le stockage objet doit
refleter la meme regle de visibilite si les URLs de fichiers sont signees).

### Messagerie (8 routes)

R-MSG1 (`direct` = exactement 2 participants, cree a la volee des le
premier message, non renommable). R-MSG2 (`group` = 3 a 50, titre libre).
R-MSG3 (`channel` = miroir exact de l'equipe d'un projet — cree/supprime
avec le projet, participants synchronises automatiquement a chaque
`membership` creee/retiree ; jamais de route manuelle pour y entrer/sortir).
R-MSG4 (piece jointe projet ou fichier, apercu resolu a la lecture —
`attachmentPreview`). R-MSG5 (modification 15 min, auteur seul). R-MSG6
(suppression laisse "Message supprime", jamais un vrai `DELETE`). R-MSG7
(une conversation `direct` reste une "demande" tant que le destinataire n'a
pas repondu — calcule a la lecture : tous les messages ont le meme auteur
que le createur). Effet de bord : chaque message notifie les autres
participants (`message_received`), sauf ceux qui ont deja lu (pas de
notification a soi-meme).

### Notifications (5 routes)

R-N1 (13 types enumeres, `notificationTypeSchema`). R-N2 (regroupement
obligatoire : un evenement sur une cible deja notifiee et non lue ajoute un
acteur a la notification existante — `notification_actors` — plutot que
d'en creer une nouvelle ; la fenetre de regroupement est a definir cote
produit, ex. tant que `read = false`). R-N3 (`target` toujours resolu pour
un routage exact vers `/projets/:slug`, `/projets/:slug/lab/taches` ou
`/messages/:id`). R-N4 (preferences par type/canal, defauts : tout dans
l'app, e-mail en plus pour `invitation_received`, `join_request_received`,
`message_received` — plus "message non lu depuis 24h" selon doc 04 §14,
**absent du mock**, a implementer comme job planifie cote backend s'il
envoie vraiment des e-mails).

### Recherche et fil (4 routes)

R-R4 (parametres `q,types,tags,sort,cursor,limit`). `GET /search` : filtre
`types` (defaut `projects,users,tags` si absent), `tri` sur les projets
uniquement (`recent`/`popular`/`relevant`/`active`) — **`relevant` n'a pas
de score de pertinence texte cote mock** (trie par `createdAt` comme
`recent`) ; un backend avec recherche plein texte (ex. Postgres
`tsvector`/`ts_rank`, ou un moteur dedie) devrait vraiment classer par
pertinence. R-IA-4 (doc 18) : la recherche reste deterministe, jamais
personnalisee. `GET /feed/discover` (sans parametres — la barre de themes ne
filtre plus ce fil, elle navigue vers `/recherche`, voir
`docs/v2/API-ROUTES.md` "Sous-barre de tags") : `moment` = un projet fixe,
toujours present, jamais paginee. `sections` = 0 a 5 sections courtes (6
projets maximum chacune, sans pagination — remplace l'ancien fil pagine par
tranches de 12), regles de selection reproduites du handler mock
(`buildDiscoverSections`, `src/mocks/handlers/search.ts`) :

| `id` (`DiscoverSectionId`) | Regle de selection                                                                                                         | Visiteur                                               | Connecte sans interets/projets |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------ |
| `for_you`                  | Partage au moins un theme avec `interests`, tri `lastActivityAt` desc                                                      | absente                                                | absente                        |
| `starting`                 | Tri `createdAt` desc (les plus recents)                                                                                    | presente                                               | presente                       |
| `trending_highfives`       | Tri `highfiveCount` desc                                                                                                   | presente                                               | presente                       |
| `needs_help`               | Au moins un besoin non pourvu, tri `lastActivityAt` desc                                                                   | presente (absente si aucun projet ne cherche du monde) | idem                           |
| `near_your_projects`       | Partage un theme avec les projets dont la personne est membre (porteur inclus), hors ces projets, tri `highfiveCount` desc | absente                                                | absente                        |

`for_you` et `near_your_projects` sont **personnalisees et algorithmiques**
(U1, R-IA-1..6, doc 18) : absentes du tableau plutot que renvoyees vides.
Chaque section porte `seeAll: SearchParams`, les parametres a reappliquer
sur `GET /search` pour le lien "Voir plus" (`types: ["projects"]` plus
`tags`/`sort` selon la section) — c'est le mecanisme qui remplace la
pagination du fil : une section n'est jamais elle-meme paginee, seul `/search`
avec les memes filtres l'est. Algorithme de recommandation reel (au-dela de
ces regles de tri simples, ex. ponderation multi-signal) : voir section 5
(U1, IA algorithmique). `GET /tags/{tagId}/projects` et `GET
/feed/tags-trending` : projets/tags publics actifs uniquement (R-V1),
trending = comptage des tags sur ces projets, 5 maximum, trie par nombre de
projets. Themes affiches dans la sous-barre (front, pas une route) :
`GET /feed/tags-trending` completes par les `interests` de la personne
connectee, aucune route supplementaire.

### Administration (10 routes)

Toutes reservees `platformRole = admin` (401 si non connecte, 403 sinon).
R-S2 (file de moderation triee : cibles a 3+ signalements distincts en
tete, puis par date). R-S4 (toute decision — resolve/reject/suspend/
reactivate/delete — journalisee dans `admin_actions`, jamais modifiable).
R-S3/R-RP3 (toute decision d'administration est notifiee a la personne
concernee avec son motif — **absent du mock**, qui journalise sans notifier ;
a implementer cote backend : creer une notification `admin_decision` a
chaque action de `admin_actions`). R-RP2 (un admin n'a aucun droit
d'ecriture dans le contenu d'un projet dont il n'est pas membre — les
routes d'administration ne permettent que moderation/suspension/suppression,
jamais d'edition de contenu, ce que le contrat respecte deja par
construction : aucune route `PATCH` de contenu n'est ouverte au role
`admin` specifiquement). `DELETE /admin/projects/{slug}` : conservee au
contrat mais non appelee par l'interface actuelle (qui reutilise `DELETE
/projects/{slug}` avec confirmation nominative, deja ouverte au role admin
dans son handler) — a garder pour un usage programmatique/futur, ou a
retirer du contrat si l'equipe confirme qu'elle ne servira jamais (decision
ouverte, section 8).

---

## 4. Temps reel

Hors perimetre v2 actuelle : **aucun ecran front n'en depend aujourd'hui**.
Deux endroits en beneficieraient plus tard, a ne pas anticiper au-dela de ce
que `docs/v2/API-ROUTES.md`/`src/domain/wall.ts` decrivent deja :

- **Tableau blanc** : document collaboratif tldraw/Yjs. Le contrat REST
  (`GET /projects/{slug}/wall`) n'expose que des metadonnees —
  `snapshotUrl` (image d'apercu, regeneree au plus toutes les 10 minutes,
  doc 04 §10) et `updatedAt`. Le document lui-meme vivrait derriere un
  serveur Yjs (Hocuspocus ou equivalent), hors de ce contrat HTTP, avec sa
  propre authentification (jeton du meme systeme, verifie a la connexion
  websocket). **Ne pas construire ce serveur avant que le besoin soit
  confirme** : le front actuel (`@tldraw/editor`) fonctionne sans, en local
  au document (pas de collaboration multi-utilisateur cablee cote v2 pour
  l'instant, voir `src/features/lab/wall`). R-W3 (doc 04) : pas de mode hors
  ligne prevu, perte de connexion = lecture seule signalee sans perte de
  l'etat local.
- **Messagerie** : aucune route de temps reel (pas de websocket, pas de SSE)
  dans le contrat actuel — `listMessages`/`listConversations` sont du
  polling classique cote front (TanStack Query). Ne pas ajouter de canal
  temps reel tant qu'aucune route front ne l'attend.

En resume : le backend n'a besoin d'aucune infrastructure temps reel pour
livrer le contrat de `openapi.yaml`. Le jour ou Tableau blanc devient
multi-utilisateur en direct, un document dedie precisera le protocole
Yjs/Hocuspocus ; ce n'est pas ce document.

---

## 5. Service IA — frontiere `api -> ai`

`web` (le front) ne parle jamais directement au service IA (`22-PLAN-DE-BASCULE.md`
§4). **Aucune route front actuelle n'appelle de fonctionnalite IA** —
confirme par une recherche dans `src/api/*.ts` (aucune fonction dediee),
donc ce contrat n'expose aucune route IA aujourd'hui. Cette section decrit
la frontiere a batir quand les usages U1-U4 de `18-IA-PRODUIT.md` seront
cables cote front, pour que le backend s'y prepare sans sur-construire :

```
web -> api -> ai
api -> ai   POST /suggest/project-fields   { texte }        -> { suggestions: [...] }   (U2)
            POST /suggest/tasks            { idees: [...] } -> { taches: [...] }        (U3)
            POST /suggest/people           { projetId }     -> { personnes: [...] }     (U4)
```

Regles a appliquer **dans `api`**, jamais dans `ai` ni dans `web` :

- **Delai maximal 12 secondes, une seule tentative, aucune reprise
  automatique** (R-IA-28). Passe ce delai ou en cas d'erreur/reponse
  vide/hors format, `api` renvoie au front la forme unique :
  ```ts
  type AiResult<T> =
    | { status: "ok"; suggestions: T[] }
    | { status: "unavailable" }
    | { status: "timeout" };
  ```
  Le front ne distingue pas `unavailable` de `timeout` (meme traitement,
  R-IA-21) : `api` peut donc les fusionner cote HTTP si plus simple (ex.
  toujours `200 { status: 'unavailable' }` en cas d'echec, jamais un statut
  d'erreur HTTP pour une degradation IA — un echec IA n'est pas une erreur
  API).
- **U1 (recommandation de projets)** est **algorithmique, pas un modele de
  langage** (18, tableau des 4 usages) : c'est `GET /feed/discover` qui la
  sert directement (deja dans le contrat, section 3), pas une route `ai`
  distincte. Regles R-IA-1..6 (melange 60/25/15, jamais de projet
  termine/archive, fonctionne sans historique, jamais de personnalisation
  cachee de la recherche, desactivable dans les reglages, raison affichable)
  s'appliquent a l'implementation de `GET /feed/discover` cote backend, pas
  au service `ai` Python.
- **U2/U3/U4** (modele de langage ou algorithmique-avec-justification)
  passeraient par les trois routes `ai` ci-dessus. Garde-fous a appliquer
  dans `api` avant tout appel a `ai` : jamais de contenu de conversation
  privee ni de projet prive (R-IA-23) ; seuls le texte du panneau et les
  textes explicitement selectionnes partent vers `ai` (R-IA-24) ; rien n'est
  ecrit dans le domaine avant acceptation explicite (R-IA-1, doc 04 §16,
  table `ai_suggestions` a ajouter le jour ou ces routes existent).
- **Ne pas construire `ai` ni ces trois routes avant qu'un lot front les
  appelle reellement** : `22-PLAN-DE-BASCULE.md` place `ai` en tout dernier
  (J10, apres que `web`/`api` convergent), precisement pour ne pas
  batir une frontiere qui bouge encore.

---

## 6. Ecarts connus / decisions ouvertes

Ce que `src/**` ne modelise pas encore, ou que ce document a du trancher
sans confirmation produit. Chaque ligne est une **proposition**, marquee
non implementee cote front — rien ci-dessous n'est dans `openapi.yaml`.

1. **Etat "highfive donne par le lecteur"** : ni `Project` ni
   `ProjectSummary` ne portent de champ du type `viewerHasHighfived`. Le
   front deduit l'etat du bouton uniquement de la reponse de
   `POST`/`DELETE /projects/{slug}/highfive` (R-X2, jamais recalcule cote
   client) — ce qui est correct pour l'action, mais **ne permet pas
   d'afficher l'etat initial du bouton** sans un appel supplementaire.
   Proposition : ajouter `viewerHasHighfived: boolean` a `Project` (et
   eventuellement `ProjectSummary` si les cartes du fil doivent l'afficher),
   calcule depuis le jeton du lecteur, absent pour un visiteur anonyme.
2. **Etat de sa propre demande a rejoindre** : `GET /projects/{slug}/join-requests`
   est reserve porteur/co-porteur (liste toutes les demandes) ; aucune route
   ne permet a une personne de savoir si sa propre demande est `pending`
   sur un projet donne. Proposition : `GET /projects/{slug}/join-requests/mine`
   (connecte, 404 si aucune demande), ou un champ `viewerJoinRequestStatus`
   sur `Project`.
3. **"Depuis ta derniere visite"** (doc 04 §2, `derniere_visite`/C-N2) :
   `CurrentUser.lastVisitAt` existe deja dans le contrat (mis a jour a
   chaque connexion), mais aucune route n'expose un delta ("3 nouveaux
   commentaires depuis ta derniere visite"). Proposition : a construire
   uniquement si un ecran le demande explicitement (risque de sur-ingenierie
   sinon) — probablement un parametre `since` sur les listes concernees
   plutot qu'une route dediee.
4. **Droits admin : archiver/supprimer un compte** : la matrice §3.4 de
   `05-ROLES-PERMISSIONS.md` liste "Supprimer un compte" comme possible pour
   `admin` (et pour la personne elle-meme), mais aucune route
   `POST /admin/users/{userId}/delete` ni `DELETE /me` n'existe dans
   `src/api/`. Seules `suspend`/`reactivate` existent. Proposition :
   `DELETE /me` (connecte, demande de suppression, passe par R-X3/R-P2 —
   anonymisation) et `POST /admin/users/{userId}/delete` (admin,
   meme mecanique, journalise).
5. **Gestion des tags** : `GET /admin/tags` est en lecture seule ; R-T1
   (desactivation) n'a aucune route pour la declencher. Proposition :
   `POST /admin/tags/{tagId}/deactivate` / `.../reactivate` (admin). Pas de
   route de creation (R-T2 : jamais depuis l'interface, coherent avec
   l'absence totale de route de creation de tag, y compris en
   administration — a confirmer que c'est volontaire meme cote admin, ou si
   l'admin doit pouvoir en ajouter par script/migration uniquement).
6. **Creation de signalement** : `reportCreateInputSchema` existe dans
   `src/domain/admin.ts` et est exporte (`ReportCreateInput.json` genere),
   mais **aucune route** `POST /reports` n'est appelee par
   `src/api/*.ts` — alors que `05-ROLES-PERMISSIONS.md` §3.1/§3.4 liste
   "Signaler" comme une action ouverte a porteur/co-porteur/membre/
   observateur/visiteur connecte. Proposition : `POST /reports`
   (connecte, corps `ReportCreateInput`, 201 `Report`), a ajouter au
   contrat front avant que l'ecran de signalement existe reellement.
7. **Limite de membres par projet** (R-M5) : voir §3 "Projets" — champ
   absent de `ProjectUpdateInput`.
8. **Reglage Mur/Taches ouverts aux observateurs** (doc 05 §3.3 note 1) :
   voir §3 "Tableau blanc" — champ absent de `Project`.
9. **Accord explicite au transfert de propriete** (R-M2) : voir §3
   "Projets" — le mock transfere immediatement sans etape d'acceptation.
10. **Archivage automatique a 180 jours** (R-PR6) et **notification 24h
    apres message non lu** (doc 04 §14) : jobs planifies absents du mock
    (attendu, un mock sans backend reel ne peut pas les simuler dans la
    duree) — a ecrire cote backend des la premiere iteration si le produit
    les confirme.
11. **`DELETE /admin/projects/{slug}`** : conserve au contrat mais orphelin
    cote UI (voir §3 "Administration") — decision ouverte : garder pour un
    usage programmatique futur, ou retirer.
12. **Personnalisation de la fiche** (`Project.customization`,
    `ProjectSummary.accent`) : champs et routes additifs (V2-4), voir §3
    "Projets". Ecarts du mock a corriger cote backend : pas de nettoyage des
    images orphelines, pas de journalisation de la suppression admin, images
    servies en `data:` URL (le backend sert de vraies URLs), pas de
    controle du type MIME reel.
