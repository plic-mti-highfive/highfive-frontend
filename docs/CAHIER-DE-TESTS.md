# Cahier de tests — highfive-frontend

Ce cahier recense les 443 tests automatisés du front (dont 76 ajoutés par la tâche T10) et la couverture par module.

## Introduction

### Types de tests

- **Unitaire** : fonction ou schéma pur, sans rendu ni réseau (schémas zod du domaine, utilitaires `shared/lib`, logique Yjs du Mur, jeu de démo).
- **Composant** : rendu avec Testing Library (jsdom) ; les hooks de données sont simulés ou les appels réseau interceptés.
- **Intégration MSW** : composant ou hook réel, exécuté contre les handlers MSW de `src/mocks` (client `apiFetch`, hooks TanStack Query, pages, gardes de routes). Le réseau est donc réel côté code applicatif (`fetch`, en-têtes, parsing), mais simulé côté serveur.

### Outils

Vitest (environnement `jsdom` déclaré par fichier), Testing Library (`@testing-library/react`, `user-event`), MSW (`msw/node`) et zod. Pas de snapshots : on vérifie le comportement observable (texte affiché, requêtes émises, état du store).

### Lancer les tests

```bash
pnpm test                 # mode watch
pnpm exec vitest run      # une passe
pnpm test:coverage        # avec couverture (v8)
pnpm check                # tsc -b + eslint + tokens + tests
```

(Si `pnpm <script>` échoue avec `ERR_PNPM_IGNORED_BUILDS`, appeler directement `./node_modules/.bin/vitest run`.)

### MSW : ni backend ni base de données

Aucun test ne contacte le core, le canvas ou une base. `src/test/msw.ts` monte un serveur MSW Node avec les mêmes handlers que le mode mock du navigateur (`src/mocks/handlers`) et réamorce le store en mémoire avec le jeu de démo avant chaque test (`seedDb(demoDataset)`). Les requêtes non gérées font échouer le test (`onUnhandledRequest: "error"`). Un test peut surcharger une route avec `server.use(...)` pour simuler une panne (500, erreur réseau). `loginAs(email)` connecte une personne du jeu de démo et stocke le jeton, comme l'application. `src/test/render.tsx` fournit un `QueryClient` neuf (sans retry) et un routeur mémoire avec une sonde de localisation pour vérifier les redirections.

### Statuts

✅ existant avant T10 · 🆕 ajouté par T10 · 🐞 bug connu (test `it.fails`/`it.skip` marqué `// BUG:`). Aucun bug n'a été marqué 🐞 par T10 (voir « Observations »).

## Couverture par module (lignes, v8)

Mesure : `vitest run --coverage --coverage.include='src/**/*.{ts,tsx}'`. Avant : branche `dev` (367 tests). Après : T10 (443 tests).

| Module                                         | Avant  | Après                     |
| ---------------------------------------------- | ------ | ------------------------- |
| `api`                                          | 8%     | 38%                       |
| `app`                                          | 5%     | 23%                       |
| `domain`                                       | 97%    | 97%                       |
| `features/admin`                               | 25%    | 25%                       |
| `features/auth`                                | 0%     | 100%                      |
| `features/home`                                | 0%     | 0%                        |
| `features/lab`                                 | 18%    | 33%                       |
| `features/messages`                            | 0%     | 2%                        |
| `features/notifications`                       | 5%     | 83%                       |
| `features/projects`                            | 57%    | 70%                       |
| `features/search`                              | 0%     | 29%                       |
| `features/user`                                | 0%     | 38%                       |
| `mocks`                                        | 30%    | 49%                       |
| `shared/components`                            | 72%    | 78%                       |
| `shared/contexts`                              | 2%     | 12%                       |
| `shared/lib`                                   | 98%    | 98%                       |
| `shared/ui`                                    | 67%    | 80%                       |
| **Total `src/`** (hors utilitaires `src/test`) | 31.24% | 49.11% (incl. `src/test`) |

`api` regroupe le client, les modules `src/api/*.ts` et les hooks `src/api/queries`.

## Domaine (schémas zod du contrat)

| ID              | Scénario                                                                                              | Type     | Fichier                            | Statut      |
| --------------- | ----------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | ----------- |
| FRONT-DOMAIN-01 | messageCreateInputSchema (R-MSG8) : accepte un texte seul                                             | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-02 | messageCreateInputSchema (R-MSG8) : accepte une piece jointe sans texte                               | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-03 | messageCreateInputSchema (R-MSG8) : refuse un message sans texte ni piece jointe                      | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-04 | messageBodyUpdateInputSchema (R-MSG5) : refuse de vider un message en le modifiant                    | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-05 | conversationSchema : plafond de participants : R-MSG2 : un groupe plafonne a 50                       | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-06 | conversationSchema : plafond de participants : R-MSG3 : un canal suit son equipe, sans plafond        | unitaire | `src/domain/conversation.test.ts`  | ✅ existant |
| FRONT-DOMAIN-07 | projectCustomizationSchema : accepte une personnalisation minimale (sections par defaut, pas d'image) | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-08 | projectCustomizationSchema : exige toujours un texte alternatif, sans exception                       | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-09 | projectCustomizationSchema : applique la meme regle d'alt a la banniere                               | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-10 | projectCustomizationSchema : borne le point focal de la banniere a 0-100                              | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-11 | projectCustomizationSchema : limite la galerie a 8 images                                             | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-12 | projectCustomizationSchema : refuse deux images de galerie avec le meme id                            | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-13 | projectCustomizationSchema : exige chaque section exactement une fois                                 | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-14 | projectCustomizationSchema : accepte l'ancienne liste de quatre sections, sans `needs`                | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-15 | projectCustomizationSchema : refuse `needs` en double ou une liste sans les quatre sections d'origine | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-16 | projectCustomizationSchema : accepte un theme complet de quatre couleurs #rrggbb, et refuse le reste  | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-17 | projectCustomizationSchema : refuse une url d'image qui n'est pas http(s) ou data:image               | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-18 | champs additifs (V2-4) : `Project.customization` est optionnel et conserve la personnalisation        | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-19 | champs additifs (V2-4) : `ProjectSummary.accent` est optionnel                                        | unitaire | `src/domain/customization.test.ts` | ✅ existant |
| FRONT-DOMAIN-20 | wallSessionSchema : accepte une session complète                                                      | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-21 | wallSessionSchema : refuse un rôle inconnu ou un jeton vide                                           | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-22 | proposedTaskSchema : complète description et sourceHints absents                                      | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-23 | proposedTaskSchema : borne le titre (1..120) et la description (<= 1000)                              | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-24 | wallSuggestionsSchema : accepte un Mur vide                                                           | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-25 | wallSuggestionsSchema : exige le drapeau empty                                                        | unitaire | `src/domain/wall.test.ts`          | ✅ existant |
| FRONT-DOMAIN-26 | acceptSuggestedTasksInputSchema : exige entre 1 et 50 tâches                                          | unitaire | `src/domain/wall.test.ts`          | ✅ existant |

## Client API (`src/api`)

| ID           | Scénario                                                                                                     | Type            | Fichier                         | Statut        |
| ------------ | ------------------------------------------------------------------------------------------------------------ | --------------- | ------------------------------- | ------------- |
| FRONT-API-01 | apiFetch — requetes (MSW) : envoie l'en-tete Authorization quand un jeton est stocke                         | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-02 | apiFetch — requetes (MSW) : n'envoie pas d'en-tete Authorization sans jeton                                  | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-03 | apiFetch — requetes (MSW) : serialise les parametres de requete : tableaux joints, undefined ignore          | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-04 | apiFetch — requetes (MSW) : envoie un corps JSON avec Content-Type                                           | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-05 | apiFetch — requetes (MSW) : retourne undefined sur une reponse 204                                           | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-06 | apiFetch — requetes (MSW) : retourne le corps JSON avec un schema valide                                     | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-07 | apiFetch — requetes (MSW) : une reponse qui derive du schema logge un warning sans jeter (DEV)               | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-08 | apiFetch — requetes (MSW) : transforme une erreur reseau en ApiError(0, network_error) en francais           | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-09 | apiFetch — requetes (MSW) : transforme un 401 du contrat en ApiError avec message francais                   | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-10 | apiFetch — requetes (MSW) : conserve les details d'une erreur de validation                                  | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-11 | api/auth (MSW) : login retourne une session valide puis /me authentifie avec le jeton                        | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-12 | api/auth (MSW) : /me sans jeton : ApiError 401                                                               | intégration MSW | `src/api/client.msw.test.ts`    | 🆕 ajouté T10 |
| FRONT-API-13 | apiFetch — message d'erreur : reprend le message du corps d'erreur du contrat                                | unitaire        | `src/api/client.test.ts`        | ✅ existant   |
| FRONT-API-14 | apiFetch — message d'erreur : retombe sur le statusText sans corps JSON                                      | unitaire        | `src/api/client.test.ts`        | ✅ existant   |
| FRONT-API-15 | apiFetch — message d'erreur : n'est jamais vide : statusText vide (HTTP/2) et corps non JSON                 | unitaire        | `src/api/client.test.ts`        | ✅ existant   |
| FRONT-API-16 | routes de personnalisation absentes du serveur : 404 devient un message clair, jamais vide                   | unitaire        | `src/api/customization.test.ts` | ✅ existant   |
| FRONT-API-17 | routes de personnalisation absentes du serveur : 405 devient un message clair, jamais vide                   | unitaire        | `src/api/customization.test.ts` | ✅ existant   |
| FRONT-API-18 | routes de personnalisation absentes du serveur : 501 devient un message clair, jamais vide                   | unitaire        | `src/api/customization.test.ts` | ✅ existant   |
| FRONT-API-19 | routes de personnalisation absentes du serveur : s'applique aussi a l'upload et a la suppression d'image     | unitaire        | `src/api/customization.test.ts` | ✅ existant   |
| FRONT-API-20 | routes de personnalisation absentes du serveur : laisse passer une vraie 404 du contrat (projet introuvable) | unitaire        | `src/api/customization.test.ts` | ✅ existant   |
| FRONT-API-21 | routes de personnalisation absentes du serveur : laisse passer les autres erreurs (403, 400)                 | unitaire        | `src/api/customization.test.ts` | ✅ existant   |

## Hooks TanStack Query (`src/api/queries`)

| ID               | Scénario                                                                                                                                                   | Type            | Fichier                            | Statut        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------- | ------------- |
| FRONT-QUERIES-01 | queries/auth : useLogin : stocke le jeton, alimente le cache de session                                                                                    | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-02 | queries/auth : useLogin : identifiants faux -> ApiError 401, aucun jeton                                                                                   | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-03 | queries/auth : useSession : 401 -> session null et jeton efface (pas d'erreur)                                                                             | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-04 | queries/auth : useSession : une erreur serveur (500) reste une erreur et garde le jeton                                                                    | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-05 | queries/auth : useLogout : efface le jeton et vide le cache                                                                                                | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-06 | queries/projects : useProjects : transmet q et tags dans l'URL                                                                                             | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-07 | queries/projects : useProject : retourne le projet par slug                                                                                                | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-08 | queries/projects : useProject : slug inconnu -> erreur 404 en francais                                                                                     | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-09 | queries/projects : useProject : slug vide -> aucune requete                                                                                                | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-10 | queries/memberships — candidature et acceptation : useCreateJoinRequest (projet sur demande) : POST avec message, demande en attente creee, cache invalide | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-11 | queries/memberships — candidature et acceptation : useCreateJoinRequest : visiteur non connecte -> ApiError 401                                            | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-12 | queries/memberships — candidature et acceptation : useCreateJoinRequest : projet sur invitation -> 403 avec message francais                               | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-13 | queries/memberships — candidature et acceptation : useAcceptJoinRequest : le demandeur devient membre et les listes sont rafraichies                       | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-14 | queries/memberships — candidature et acceptation : useAcceptJoinRequest : un simple membre n'a pas le droit (403)                                          | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-15 | queries/tasks : useCreateTask : POST /tasks puis la liste contient la nouvelle tache                                                                       | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-16 | queries/tasks : useCreateTask : titre vide -> erreur 400 de validation                                                                                     | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-17 | queries/tasks : useUpdateTask : PATCH puis la liste reflete le nouveau titre                                                                               | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-18 | queries/tasks : useMoveTask : mise a jour optimiste immediate                                                                                              | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-19 | queries/tasks : useMoveTask : en cas d'erreur serveur, la liste revient a l'etat precedent                                                                 | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-20 | queries/tasks : useCreateTask : un visiteur n'est pas autorise (403)                                                                                       | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-21 | queries/notifications : useNotifications : 401 sans session                                                                                                | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-22 | queries/notifications : useNotifications : liste de la personne connectee, compteur de non-lues coherent                                                   | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-23 | queries/notifications : useMarkNotificationRead : la notification passe a lue et le compteur baisse                                                        | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |
| FRONT-QUERIES-24 | queries/notifications : useMarkAllNotificationsRead : compteur a zero                                                                                      | intégration MSW | `src/api/queries/queries.test.tsx` | 🆕 ajouté T10 |

## Authentification (`features/auth`, contexte d'auth)

| ID            | Scénario                                                                                                 | Type            | Fichier                           | Statut        |
| ------------- | -------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------- | ------------- |
| FRONT-AUTH-01 | LoginPage : connexion reussie : stocke le jeton et redirige vers l'accueil                               | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-02 | LoginPage : connexion reussie avec ?suite= : revient sur la route demandee                               | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-03 | LoginPage : ?suite= externe est ignore (pas de redirection ouverte)                                      | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-04 | LoginPage : mauvais mot de passe : affiche le message d'erreur francais, reste sur la page, pas de jeton | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-05 | LoginPage : adresse mal formee : message de validation sans appel reseau                                 | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-06 | LoginPage : erreur serveur 500 : affiche le message de l'API                                             | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-07 | RegisterPage : inscription valide : cree le compte, stocke le jeton, redirige                            | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-08 | RegisterPage : pseudo invalide : affiche l'erreur et ne cree rien                                        | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-09 | RegisterPage : e-mail invalide : affiche l'erreur et ne cree rien                                        | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-10 | RegisterPage : mot de passe trop court : affiche l'erreur et ne cree rien                                | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-11 | RegisterPage : confirmation differente : affiche l'erreur et ne cree rien                                | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-12 | RegisterPage : adresse deja utilisee : affiche le message de l'API                                       | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-13 | useAuth — session : sans jeton : anonyme, aucun appel /me                                                | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-14 | useAuth — session : restaure la session depuis le jeton stocke                                           | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-15 | useAuth — session : jeton perime (401 sur /me) : jeton efface, visiteur anonyme                          | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-AUTH-16 | useAuth — session : deconnexion : efface le jeton et repasse en anonyme                                  | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |

## Application : gardes de routes (`app/guards`)

| ID           | Scénario                                                                                  | Type            | Fichier                           | Statut        |
| ------------ | ----------------------------------------------------------------------------------------- | --------------- | --------------------------------- | ------------- |
| FRONT-APP-01 | gardes de routes : ProtectedRoute : un visiteur est renvoye vers /connexion?suite=<route> | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-APP-02 | gardes de routes : ProtectedRoute : une personne connectee voit le contenu                | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-APP-03 | gardes de routes : AdminRoute : un visiteur est renvoye vers la connexion                 | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-APP-04 | gardes de routes : AdminRoute : un membre est renvoye sur l'accueil                       | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |
| FRONT-APP-05 | gardes de routes : AdminRoute : un admin accede a la page                                 | intégration MSW | `src/features/auth/auth.test.tsx` | 🆕 ajouté T10 |

## Projets (`features/projects`)

| ID             | Scénario                                                                                                                                  | Type            | Fichier                                                                | Statut        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- | ------------- |
| FRONT-PROJ-01  | candidater a un projet (JoinAction) : visiteur : propose de se connecter et redirige avec ?suite=                                         | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-02  | candidater a un projet (JoinAction) : membre : bouton 'Aller au Lab'                                                                      | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-03  | candidater a un projet (JoinAction) : projet sur invitation : bouton desactive                                                            | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-04  | candidater a un projet (JoinAction) : projet sur demande : envoie le message, passe a 'Demande envoyee'                                   | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-05  | candidater a un projet (JoinAction) : projet ouvert : 'Rejoindre le projet' cree directement l'appartenance                               | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-06  | onglet Equipe : accepter / refuser un membre : le porteur accepte une demande : elle disparait et le membre rejoint l'equipe              | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-07  | onglet Equipe : accepter / refuser un membre : le porteur refuse une demande : aucun membre ajoute                                        | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-08  | onglet Equipe : accepter / refuser un membre : un simple membre ne voit pas la file des demandes                                          | intégration MSW | `src/features/projects/parcours.test.tsx`                              | 🆕 ajouté T10 |
| FRONT-PROJ-09  | ProjectCustomizePage : refuse l'acces a un simple membre                                                                                  | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-10  | ProjectCustomizePage : ne propose au co-porteur que l'onglet Infos                                                                        | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-11  | ProjectCustomizePage : affiche l'editeur au porteur, avec l'apercu et aucune modification                                                 | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-12  | ProjectCustomizePage : Annuler sans modification retourne directement a la fiche                                                          | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-13  | ProjectCustomizePage : met a jour l'apercu et signale les modifications non enregistrees                                                  | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-14  | ProjectCustomizePage : demande confirmation avant de quitter avec des modifications                                                       | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-15  | ProjectCustomizePage : garde aussi le lien de retour quand il y a des modifications                                                       | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-16  | ProjectCustomizePage : refuse d'enregistrer une image sans texte alternatif, nomme l'image et y emmene, puis enregistre une fois complete | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-17  | ProjectCustomizePage : amene au champ de l'image choisie dans le resume, galerie comprise                                                 | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-18  | ProjectCustomizePage : envoie le brouillon complet puis retourne a la fiche apres l'enregistrement                                        | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-19  | ProjectCustomizePage : enregistre les infos puis retourne a la fiche, sans toucher a la personnalisation                                  | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-20  | ProjectCustomizePage : refuse d'enregistrer des infos invalides et amene au champ                                                         | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-21  | ProjectCustomizePage : enregistre les infos avant la personnalisation quand les deux changent                                             | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-22  | ProjectCustomizePage : nettoie sur le serveur les images televersees puis abandonnees                                                     | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-23  | ProjectCustomizePage : retirer une image juste televersee la supprime sur le serveur                                                      | composant       | `src/features/projects/pages/ProjectCustomizePage.test.tsx`            | ✅ existant   |
| FRONT-PROJ-24  | CommentItem — menu d'actions : ne propose que « Copier le lien » sans droit particulier                                                   | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-25  | CommentItem — menu d'actions : propose « Signaler » a une personne connectee qui n'en est pas l'auteur                                    | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-26  | CommentItem — menu d'actions : masque apres confirmation, jamais directement                                                              | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-27  | CommentItem — menu d'actions : copie le lien du commentaire et le confirme                                                                | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-28  | CommentItem — reponses : rend une mention en tete de message comme un lien vers le profil                                                 | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-29  | CommentItem — reponses : pre-remplit la mention en repondant a une reponse, pas a un commentaire racine                                   | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-30  | CommentItem — reponses : n'ajoute pas de mention en repondant a un commentaire racine                                                     | composant       | `src/features/projects/components/CommentItem.test.tsx`                | ✅ existant   |
| FRONT-PROJ-31  | CommentThread : replie les reponses derriere un compteur, et les deplie au clic                                                           | composant       | `src/features/projects/components/CommentThread.test.tsx`              | ✅ existant   |
| FRONT-PROJ-32  | CommentThread : accorde le compteur au singulier et n'affiche rien sans reponse                                                           | composant       | `src/features/projects/components/CommentThread.test.tsx`              | ✅ existant   |
| FRONT-PROJ-33  | CommentThread : ouvre d'emblee le fil dont une reponse est la cible du lien                                                               | composant       | `src/features/projects/components/CommentThread.test.tsx`              | ✅ existant   |
| FRONT-PROJ-34  | CommentThread : rattache une reponse a une reponse au commentaire racine et deplie le fil                                                 | composant       | `src/features/projects/components/CommentThread.test.tsx`              | ✅ existant   |
| FRONT-PROJ-35  | CommentThread : n'offre « Masquer » qu'avec le droit de moderation, et « Signaler » pas sur ses propres commentaires                      | composant       | `src/features/projects/components/CommentThread.test.tsx`              | ✅ existant   |
| FRONT-PROJ-36  | ProjectBanner : ne rend rien sans banniere (pas de bloc vide)                                                                             | composant       | `src/features/projects/components/ProjectBanner.test.tsx`              | ✅ existant   |
| FRONT-PROJ-37  | ProjectBanner : expose le texte alternatif de l'image                                                                                     | composant       | `src/features/projects/components/ProjectBanner.test.tsx`              | ✅ existant   |
| FRONT-PROJ-38  | ProjectBanner : transmet le point focal par une variable CSS                                                                              | composant       | `src/features/projects/components/ProjectBanner.test.tsx`              | ✅ existant   |
| FRONT-PROJ-39  | ProjectBanner : s'ouvre en grand dans la visionneuse au clic, avec le nom de la banniere                                                  | composant       | `src/features/projects/components/ProjectBanner.test.tsx`              | ✅ existant   |
| FRONT-PROJ-40  | ProjectBanner : l'agrandit aussi au clavier (Entree)                                                                                      | composant       | `src/features/projects/components/ProjectBanner.test.tsx`              | ✅ existant   |
| FRONT-PROJ-41  | ProjectGallery : ne rend rien si la galerie est vide                                                                                      | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-42  | ProjectGallery : rend une vignette-bouton par image avec un nom accessible                                                                | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-43  | ProjectGallery : ouvre la visionneuse sur l'image cliquee avec un compteur                                                                | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-44  | ProjectGallery : navigue aux fleches et boucle aux extremites                                                                             | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-45  | ProjectGallery : navigue avec les boutons precedent/suivant                                                                               | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-46  | ProjectGallery : ferme avec Echap et restitue le focus a la vignette                                                                      | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-47  | ProjectGallery : ferme avec le bouton Fermer (un seul, celui du dialogue)                                                                 | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-48  | ProjectGallery : centre les boutons de navigation sans translate (le style bouton en applique un au clic)                                 | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-49  | ProjectGallery : n'anime pas l'ouverture de la visionneuse                                                                                | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-50  | ProjectGallery : n'affiche pas de navigation pour une image unique                                                                        | composant       | `src/features/projects/components/ProjectGallery.test.tsx`             | ✅ existant   |
| FRONT-PROJ-51  | ProjectOverview : sans personnalisation : ordre d'origine, pas de galerie, pas d'accent                                                   | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-52  | ProjectOverview : applique l'ordre choisi et masque les sections cachees                                                                  | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-53  | ProjectOverview : rend la galerie a sa place quand elle contient des images                                                               | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-54  | ProjectOverview : n'affiche pas la section galerie si elle est vide, meme visible                                                         | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-55  | ProjectOverview : transmet le theme a l'annonce epinglee                                                                                  | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-56  | ProjectOverview : place les besoins apres l'annonce epinglee par defaut                                                                   | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-57  | ProjectOverview : place les besoins en tete sans annonce epinglee, et rien sans besoin                                                    | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-58  | ProjectOverview : suit l'ordre et la visibilite choisis pour les besoins                                                                  | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-59  | ProjectOverview : en apercu, remplace les commentaires par un bloc leger                                                                  | composant       | `src/features/projects/components/ProjectOverview.test.tsx`            | ✅ existant   |
| FRONT-PROJ-60  | ReportDialog : exige un motif avant d'envoyer                                                                                             | composant       | `src/features/projects/components/ReportDialog.test.tsx`               | ✅ existant   |
| FRONT-PROJ-61  | ReportDialog : envoie la cible, le motif et la precision, puis ferme et prévient                                                          | composant       | `src/features/projects/components/ReportDialog.test.tsx`               | ✅ existant   |
| FRONT-PROJ-62  | ReportDialog : affiche le message du serveur quand le signalement est refusé                                                              | composant       | `src/features/projects/components/ReportDialog.test.tsx`               | ✅ existant   |
| FRONT-PROJ-63  | resolveSections : renvoie l'ordre par defaut sans personnalisation                                                                        | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-64  | resolveSections : respecte l'ordre et la visibilite choisis                                                                               | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-65  | resolveSections : complete les sections manquantes a la fin, dans l'ordre par defaut                                                      | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-66  | resolveSections : ignore les doublons (la premiere occurrence gagne)                                                                      | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-67  | resolveSections : ne mute pas les sections par defaut                                                                                     | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-68  | moveItem : echange avec le voisin du dessus ou du dessous                                                                                 | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-69  | moveItem : ne bouge pas aux extremites ni hors bornes, et ne mute pas l'entree                                                            | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-70  | toDraft et isDraftDirty : part de la personnalisation par defaut sans personnalisation enregistree                                        | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-71  | toDraft et isDraftDirty : un brouillon intact n'est pas modifie, avec ou sans personnalisation                                            | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-72  | toDraft et isDraftDirty : ignore l'ordre des cles dans la comparaison                                                                     | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-73  | toDraft et isDraftDirty : detecte un changement de theme, d'ordre, de visibilite ou d'image                                               | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-74  | toDraft et isDraftDirty : revenir a l'etat enregistre annule le statut modifie                                                            | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-75  | getDraftIssues : ne signale rien quand tout est decrit                                                                                    | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-76  | getDraftIssues : signale la banniere et les images de galerie sans texte alternatif                                                       | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-77  | getDraftIssues : nomme les images a corriger dans l'ordre de la page, avec l'id de leur champ                                             | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-78  | altInputId : est stable et distinct entre la banniere et chaque image                                                                     | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-79  | toCardPreview : reprend l'accent du theme et la banniere du brouillon, pas ceux du projet enregistre                                      | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-80  | toCardPreview : met le porteur en tete de l'equipe (6 au plus) et compte tous les membres                                                 | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-81  | toCardPreview : copie les champs de la carte depuis le projet                                                                             | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-82  | toCardPreview : pas d'apercu tant que le porteur n'est pas dans l'equipe                                                                  | unitaire        | `src/features/projects/lib/customization.test.ts`                      | ✅ existant   |
| FRONT-PROJ-83  | computeTargetSize : reduit en conservant le ratio quand l'image est plus large que le maximum                                             | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-84  | computeTargetSize : n'agrandit jamais une image plus petite que le maximum                                                                | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-85  | computeTargetSize : arrondit a des entiers d'au moins 1 pixel                                                                             | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-86  | validateImageFile : accepte JPEG, PNG, WebP et AVIF                                                                                       | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-87  | validateImageFile : refuse les autres formats, GIF et SVG compris                                                                         | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-88  | validateImageFile : refuse un fichier de plus de 10 Mo, accepte exactement 10 Mo                                                          | unitaire        | `src/features/projects/lib/imageCompression.test.ts`                   | ✅ existant   |
| FRONT-PROJ-89  | projectInfo : part du projet sans modification                                                                                            | unitaire        | `src/features/projects/lib/projectInfo.test.ts`                        | ✅ existant   |
| FRONT-PROJ-90  | projectInfo : liste les champs a corriger dans l'ordre de la page                                                                         | unitaire        | `src/features/projects/lib/projectInfo.test.ts`                        | ✅ existant   |
| FRONT-PROJ-91  | projectInfo : nettoie les textes et retire une description vide                                                                           | unitaire        | `src/features/projects/lib/projectInfo.test.ts`                        | ✅ existant   |
| FRONT-PROJ-92  | useUnsavedChangesGuard : n'intervient pas tant qu'il n'y a pas de changement                                                              | composant       | `src/features/projects/lib/useUnsavedChangesGuard.test.tsx`            | ✅ existant   |
| FRONT-PROJ-93  | useUnsavedChangesGuard : demande confirmation avant de quitter quand il y a des changements                                               | composant       | `src/features/projects/lib/useUnsavedChangesGuard.test.tsx`            | ✅ existant   |
| FRONT-PROJ-94  | useUnsavedChangesGuard : se desactive quand les changements sont enregistres ou au demontage                                              | composant       | `src/features/projects/lib/useUnsavedChangesGuard.test.tsx`            | ✅ existant   |
| FRONT-PROJ-95  | BannerEditor : sans banniere : propose d'en ajouter une, sans champs                                                                      | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-96  | BannerEditor : ajoute une banniere : point focal au centre, alt vide a completer                                                          | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-97  | BannerEditor : remplace l'image en gardant le point focal et en liberant l'ancienne                                                       | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-98  | BannerEditor : regle le point focal avec les curseurs (clavier)                                                                           | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-99  | BannerEditor : regle le point focal au clic sur l'image, borne a 0-100                                                                    | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-100 | BannerEditor : modifie l'alt                                                                                                              | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-101 | BannerEditor : affiche l'erreur d'alt et marque le champ invalide                                                                         | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-102 | BannerEditor : retire la banniere et previent le parent                                                                                   | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-103 | BannerEditor : affiche l'erreur d'une image refusee et garde la banniere actuelle                                                         | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-104 | BannerEditor : agrandit l'image dans la visionneuse sans deplacer le point focal                                                          | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-105 | BannerEditor : marque le texte alternatif comme obligatoire, sans case pour s'en dispenser                                                | composant       | `src/features/projects/components/customize/BannerEditor.test.tsx`     | ✅ existant   |
| FRONT-PROJ-106 | CustomizePreview — carte du projet : montre la carte du projet avec la bannière du brouillon et son point focal                           | composant       | `src/features/projects/components/customize/CustomizePreview.test.tsx` | ✅ existant   |
| FRONT-PROJ-107 | CustomizePreview — carte du projet : suit le brouillon : le point focal change, la bannière retirée disparaît                             | composant       | `src/features/projects/components/customize/CustomizePreview.test.tsx` | ✅ existant   |
| FRONT-PROJ-108 | CustomizePreview — carte du projet : pas de section carte tant que l'équipe n'est pas chargée                                             | composant       | `src/features/projects/components/customize/CustomizePreview.test.tsx` | ✅ existant   |
| FRONT-PROJ-109 | GalleryEditor : affiche le compteur et les champs de chaque image                                                                         | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-110 | GalleryEditor : reordonne avec les boutons et annonce le deplacement                                                                      | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-111 | GalleryEditor : ne deplace pas les images aux extremites                                                                                  | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-112 | GalleryEditor : ajoute des images televersees avec un alt vide a completer                                                                | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-113 | GalleryEditor : limite la galerie a 8 images : ajout desactive et message                                                                 | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-114 | GalleryEditor : ignore les images en trop et le signale                                                                                   | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-115 | GalleryEditor : affiche l'erreur d'une image refusee sans bloquer les autres                                                              | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-116 | GalleryEditor : affiche l'erreur de texte alternatif d'une image et marque le champ invalide                                              | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-117 | GalleryEditor : supprime une image et previent le parent pour nettoyage                                                                   | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-118 | GalleryEditor : modifie l'alt et la legende                                                                                               | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-119 | GalleryEditor : agrandit une vignette dans la visionneuse, a la bonne image, et permet de parcourir la galerie                            | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-120 | GalleryEditor : marque le texte alternatif de chaque image comme obligatoire, sans case pour s'en dispenser                               | composant       | `src/features/projects/components/customize/GalleryEditor.test.tsx`    | ✅ existant   |
| FRONT-PROJ-121 | InfoEditor — profils recherches : retire un profil                                                                                        | composant       | `src/features/projects/components/customize/InfoEditor.test.tsx`       | ✅ existant   |
| FRONT-PROJ-122 | InfoEditor — profils recherches : ajoute un profil avec Entree, et seulement a partir de 3 caracteres                                     | composant       | `src/features/projects/components/customize/InfoEditor.test.tsx`       | ✅ existant   |
| FRONT-PROJ-123 | SectionsEditor : liste les sections dans l'ordre avec leur visibilite                                                                     | composant       | `src/features/projects/components/customize/SectionsEditor.test.tsx`   | ✅ existant   |
| FRONT-PROJ-124 | SectionsEditor : descend et monte une section avec les boutons, et l'annonce                                                              | composant       | `src/features/projects/components/customize/SectionsEditor.test.tsx`   | ✅ existant   |
| FRONT-PROJ-125 | SectionsEditor : laisse les boutons des extremites focusables mais sans effet                                                             | composant       | `src/features/projects/components/customize/SectionsEditor.test.tsx`   | ✅ existant   |
| FRONT-PROJ-126 | SectionsEditor : garde le focus sur le bouton apres un deplacement                                                                        | composant       | `src/features/projects/components/customize/SectionsEditor.test.tsx`   | ✅ existant   |
| FRONT-PROJ-127 | SectionsEditor : masque et reaffiche une section avec sa case                                                                             | composant       | `src/features/projects/components/customize/SectionsEditor.test.tsx`   | ✅ existant   |
| FRONT-PROJ-128 | SortableList : rend une poignee nommee par element, dans l'ordre                                                                          | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-129 | SortableList : deplace l'element depose a la position de celui qui est dessous                                                            | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-130 | SortableList : ne fait rien si on depose sur place ou hors de la liste                                                                    | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-131 | SortableList : donne des annonces et une consigne en francais                                                                             | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-132 | SortableList : n'applique aucune transition aux elements (pas d'animation)                                                                | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-133 | SortableList : n'expose le glisser que sur la poignee (touch-none, curseur grab)                                                          | composant       | `src/features/projects/components/customize/SortableList.test.tsx`     | ✅ existant   |
| FRONT-PROJ-134 | ThemeEditor : part sur « Par défaut » sans theme, sans champs de couleur                                                                  | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-135 | ThemeEditor : propose six palettes nommees en texte et les applique en entier                                                             | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-136 | ThemeEditor : affiche les quatre couleurs avec leur role en clair                                                                         | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-137 | ThemeEditor : modifier une couleur garde les trois autres et sort du preset                                                               | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-138 | ThemeEditor : accepte une couleur du selecteur natif                                                                                      | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-139 | ThemeEditor : n'ecrase pas la saisie en cours : le raccourci a 3 chiffres s'applique a la sortie du champ                                 | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-140 | ThemeEditor : signale un code invalide sans changer la couleur                                                                            | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-141 | ThemeEditor : previent quand le texte est corrige automatiquement                                                                         | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-142 | ThemeEditor : ne dit rien quand la palette est lisible                                                                                    | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |
| FRONT-PROJ-143 | ThemeEditor : revient au theme du site, par « Par défaut » ou par le bouton dedie                                                         | composant       | `src/features/projects/components/customize/ThemeEditor.test.tsx`      | ✅ existant   |

## Lab : Mur et Étapes (`features/lab`)

| ID           | Scénario                                                                                                   | Type            | Fichier                                                   | Statut        |
| ------------ | ---------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------- | ------------- |
| FRONT-LAB-01 | Etapes du Lab : creer / editer une tache : un membre ajoute une etape dans une colonne                     | intégration MSW | `src/features/projects/parcours.test.tsx`                 | 🆕 ajouté T10 |
| FRONT-LAB-02 | Etapes du Lab : creer / editer une tache : le bouton Ajouter reste desactive tant que le titre est vide    | intégration MSW | `src/features/projects/parcours.test.tsx`                 | 🆕 ajouté T10 |
| FRONT-LAB-03 | Etapes du Lab : creer / editer une tache : un non-membre n'a pas acces a l'atelier                         | intégration MSW | `src/features/projects/parcours.test.tsx`                 | 🆕 ajouté T10 |
| FRONT-LAB-04 | SuggestTasksDialog : affiche titre, description et indices d'origine des propositions                      | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-05 | SuggestTasksDialog : envoie uniquement les propositions cochées, titres corrigés                           | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-06 | SuggestTasksDialog : n'envoie pas une proposition dont le titre est vidé et désactive la validation à zéro | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-07 | SuggestTasksDialog : affiche l'état vide du Mur                                                            | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-08 | SuggestTasksDialog : affiche le message d'erreur en français (IA non configurée)                           | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-09 | SuggestTasksDialog : affiche l'erreur de création sans perdre la liste                                     | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-10 | SuggestTasksDialog : indique l'analyse en cours                                                            | composant       | `src/features/lab/components/SuggestTasksDialog.test.tsx` | ✅ existant   |
| FRONT-LAB-11 | presencesFromAwareness : ignore sa propre présence et les états invalides                                  | unitaire        | `src/features/lab/wall/presence.test.ts`                  | ✅ existant   |
| FRONT-LAB-12 | presencesFromAwareness : accepte un curseur absent (null)                                                  | unitaire        | `src/features/lab/wall/presence.test.ts`                  | ✅ existant   |
| FRONT-LAB-13 | isSharedRecord : ne partage que les records de scope document                                              | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-14 | bindStoreToYjs : document vierge : publie l'état initial (page, document) sans instance ni caméra          | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-15 | bindStoreToYjs : lecture seule : ne publie rien sur un document vierge                                     | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-16 | bindStoreToYjs : propage une forme créée dans un store vers l'autre, puis sa suppression                   | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-17 | bindStoreToYjs : ne renvoie pas au réseau ce qui vient du réseau (pas de boucle)                           | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-18 | bindStoreToYjs : le document distant fait foi : le nouveau client reprend les formes existantes            | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-19 | bindStoreToYjs : une édition locale n'écrit pas les records de session dans le document                    | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |
| FRONT-LAB-20 | bindStoreToYjs : le nettoyage détache les écouteurs                                                        | unitaire        | `src/features/lab/wall/yjsStoreSync.test.ts`              | ✅ existant   |

## Administration (`features/admin`)

| ID             | Scénario                                                                                                           | Type      | Fichier                                                     | Statut      |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ----------------------------------------------------------- | ----------- |
| FRONT-ADMIN-01 | ProjectMediaDialog : liste la banniere puis chaque image avec son texte alternatif, sa legende et le cas decoratif | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-02 | ProjectMediaDialog : explique que l'action est journalisee                                                         | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-03 | ProjectMediaDialog : affiche un etat vide sans media                                                               | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-04 | ProjectMediaDialog : affiche une erreur avec relance                                                               | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-05 | ProjectMediaDialog : ouvre une image en grand dans la visionneuse, a la bonne position                             | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-06 | ProjectMediaDialog : retire un media avec un motif, apres confirmation                                             | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-07 | ProjectMediaDialog : le motif est facultatif : envoye absent s'il est vide                                         | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-08 | ProjectMediaDialog : n'efface rien si on annule la confirmation, et repart sans motif ensuite                      | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-09 | ProjectMediaDialog : se ferme par Echap                                                                            | composant | `src/features/admin/components/ProjectMediaDialog.test.tsx` | ✅ existant |
| FRONT-ADMIN-10 | ProjectsSection : medias : propose un bouton Medias par projet                                                     | composant | `src/features/admin/components/ProjectsSection.test.tsx`    | ✅ existant |
| FRONT-ADMIN-11 | ProjectsSection : medias : ouvre la moderation des medias du projet de la ligne, puis la ferme                     | composant | `src/features/admin/components/ProjectsSection.test.tsx`    | ✅ existant |
| FRONT-ADMIN-12 | ProjectsSection : medias : n'ouvre rien tant qu'on ne clique pas                                                   | composant | `src/features/admin/components/ProjectsSection.test.tsx`    | ✅ existant |

## Notifications (`features/notifications`)

| ID             | Scénario                                                                                 | Type            | Fichier                                                   | Statut        |
| -------------- | ---------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------- | ------------- |
| FRONT-NOTIF-01 | NotificationsPage : liste les notifications et 'Tout marquer comme lu' vide les non-lues | intégration MSW | `src/features/pages.test.tsx`                             | 🆕 ajouté T10 |
| FRONT-NOTIF-02 | NotificationsPage : erreur serveur : affiche le message de l'API                         | intégration MSW | `src/features/pages.test.tsx`                             | 🆕 ajouté T10 |
| FRONT-NOTIF-03 | actionPhrase : admin_decision se lit avec sa cible, un projet et non un compte           | unitaire        | `src/features/notifications/lib/notificationText.test.ts` | ✅ existant   |
| FRONT-NOTIF-04 | actionPhrase : s'accorde au pluriel                                                      | unitaire        | `src/features/notifications/lib/notificationText.test.ts` | ✅ existant   |

## Recherche (`features/search`)

| ID              | Scénario                                                                  | Type            | Fichier                       | Statut        |
| --------------- | ------------------------------------------------------------------------- | --------------- | ----------------------------- | ------------- |
| FRONT-SEARCH-01 | SearchPage : sans requete : titre 'Recherche' et aucun appel de recherche | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |
| FRONT-SEARCH-02 | SearchPage : requete inconnue : etat vide 'Aucun projet trouve'           | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |
| FRONT-SEARCH-03 | SearchPage : requete connue : affiche le titre du projet trouve           | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |

## Profil (`features/user`)

| ID            | Scénario                                                          | Type            | Fichier                       | Statut        |
| ------------- | ----------------------------------------------------------------- | --------------- | ----------------------------- | ------------- |
| FRONT-USER-01 | UserProfilePage : affiche le profil d'une personne existante      | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |
| FRONT-USER-02 | UserProfilePage : pseudo inconnu : etat 'Profil introuvable'      | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |
| FRONT-USER-03 | UserProfilePage : erreur serveur : message de chargement en echec | intégration MSW | `src/features/pages.test.tsx` | 🆕 ajouté T10 |

## Composants et utilitaires partagés (`shared`)

| ID               | Scénario                                                                                                                | Type      | Fichier                                               | Statut      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------- | ----------- |
| FRONT-SHARED-01  | ImageViewer : n'affiche rien tant que l'index est nul, et nomme le dialogue pour les lecteurs d'ecran                   | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-02  | ImageViewer : n'est pas anime                                                                                           | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-03  | ImageViewer : demarre a 100 % sans zoom                                                                                 | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-04  | ImageViewer > zoom : zoome et dezoome avec les boutons par pas de 50 %                                                  | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-05  | ImageViewer > zoom : plafonne a 500 % et ne descend pas sous 100 %                                                      | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-06  | ImageViewer > zoom : se pilote au clavier : + - et 0                                                                    | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-07  | ImageViewer > zoom : revient a 100 % avec le bouton Ajuster                                                             | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-08  | ImageViewer > zoom : zoome a la molette sans faire defiler la page                                                      | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-09  | ImageViewer > zoom : un clic sur l'image zoome (curseur loupe), un second dezoome                                       | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-10  | ImageViewer > zoom : garde le point clique sous le curseur en zoomant                                                   | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-11  | ImageViewer > zoom : un glisser ne declenche pas de zoom, mais un clic simple apres oui                                 | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-12  | ImageViewer > zoom : cliquer sur les boutons precedent/suivant ne zoome pas l'image                                     | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-13  | ImageViewer > deplacement de l'image zoomee : les fleches deplacent l'image quand elle est zoomee, sans changer d'image | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-14  | ImageViewer > deplacement de l'image zoomee : borne le deplacement a la moitie du surplus de l'image zoomee             | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-15  | ImageViewer > deplacement de l'image zoomee : recadre le deplacement quand on dezoome                                   | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-16  | ImageViewer > deplacement de l'image zoomee : se deplace en glissant, borne, et seulement quand l'image est zoomee      | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-17  | ImageViewer > navigation : les fleches changent d'image a 100 %, en boucle                                              | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-18  | ImageViewer > navigation : les boutons changent d'image meme quand on est zoome, et remettent le zoom a 100 %           | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-19  | ImageViewer > navigation : rouvrir la visionneuse repart a 100 %                                                        | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-20  | ImageViewer > navigation : sans navigation pour une image unique : les fleches ne font rien                             | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-21  | ImageViewer : rend l'image avec son alt et affiche la legende                                                           | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-22  | ImageViewer : annonce le niveau de zoom aux lecteurs d'ecran et decrit les raccourcis                                   | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-23  | ImageViewer > plein ecran : propose un bouton Plein ecran, desactive par defaut                                         | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-24  | ImageViewer > plein ecran : sans API Fullscreen : agrandit la popup a toute la fenetre, puis la restaure                | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-25  | ImageViewer > plein ecran : avec l'API Fullscreen : la demande sur la popup et en sort a la fermeture du mode           | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-26  | ImageViewer > plein ecran : suit le navigateur quand l'utilisateur quitte le plein ecran lui-meme (Echap)               | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-27  | ImageViewer > plein ecran : se bascule aussi avec la touche F                                                           | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-28  | ImageViewer > plein ecran : garde le plein ecran en changeant d'image, mais pas le zoom                                 | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-29  | ImageViewer > plein ecran : sort du plein ecran en fermant la visionneuse, et rouvre en mode normal                     | composant | `src/shared/components/ImageViewer.test.tsx`          | ✅ existant |
| FRONT-SHARED-30  | normalizeHex : normalise 3 ou 6 chiffres, avec ou sans #, en minuscules                                                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-31  | normalizeHex : refuse tout le reste                                                                                     | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-32  | contrastRatio : vaut 21 entre noir et blanc, et 1 entre deux couleurs identiques                                        | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-33  | contrastRatio : retrouve la valeur WCAG connue du gris #767676 sur blanc (4.54:1)                                       | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-34  | deriveAccentTokens (theme light) : #ff4d8c : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-35  | deriveAccentTokens (theme light) : #ff6b1a : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-36  | deriveAccentTokens (theme light) : #ffd600 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-37  | deriveAccentTokens (theme light) : #5ed651 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-38  | deriveAccentTokens (theme light) : #3ec6f5 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-39  | deriveAccentTokens (theme light) : #c24bff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-40  | deriveAccentTokens (theme light) : #000000 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-41  | deriveAccentTokens (theme light) : #ffffff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-42  | deriveAccentTokens (theme light) : #ffff00 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-43  | deriveAccentTokens (theme light) : #0000ff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-44  | deriveAccentTokens (theme light) : #ff0000 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-45  | deriveAccentTokens (theme light) : #808080 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-46  | deriveAccentTokens (theme light) : #123456 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-47  | deriveAccentTokens (theme light) : #fefefe : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-48  | deriveAccentTokens (theme light) : #010101 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-49  | deriveAccentTokens (theme light) : produit des couleurs #rrggbb valides                                                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-50  | deriveAccentTokens (theme light) : garde la surface teintee proche du fond (discrete)                                   | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-51  | deriveAccentTokens (theme dark) : #ff4d8c : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-52  | deriveAccentTokens (theme dark) : #ff6b1a : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-53  | deriveAccentTokens (theme dark) : #ffd600 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-54  | deriveAccentTokens (theme dark) : #5ed651 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-55  | deriveAccentTokens (theme dark) : #3ec6f5 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-56  | deriveAccentTokens (theme dark) : #c24bff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-57  | deriveAccentTokens (theme dark) : #000000 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-58  | deriveAccentTokens (theme dark) : #ffffff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-59  | deriveAccentTokens (theme dark) : #ffff00 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-60  | deriveAccentTokens (theme dark) : #0000ff : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-61  | deriveAccentTokens (theme dark) : #ff0000 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-62  | deriveAccentTokens (theme dark) : #808080 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-63  | deriveAccentTokens (theme dark) : #123456 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-64  | deriveAccentTokens (theme dark) : #fefefe : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-65  | deriveAccentTokens (theme dark) : #010101 : texte >= 4.5:1 et couleur >= 3:1 sur fond, carte et surface                 | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-66  | deriveAccentTokens (theme dark) : produit des couleurs #rrggbb valides                                                  | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-67  | deriveAccentTokens (theme dark) : garde la surface teintee proche du fond (discrete)                                    | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-68  | deriveAccentTokens : laisse intacte une couleur deja assez contrastee dans le theme                                     | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-69  | deriveAccentTokens : assombrit un jaune en theme clair et eclaircit un violet fonce en theme sombre                     | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-70  | deriveAccentTokens : donne un resultat stable et memoise pour une meme couleur                                          | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-71  | deriveAccentTokens : se replie sur un gris pour une valeur invalide au lieu de planter                                  | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-72  | accentStyle et accentAttributes : expose six variables CSS --pa-\*                                                      | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-73  | accentStyle et accentAttributes : pose data-accent-custom + style avec une couleur libre                                | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-74  | accentStyle et accentAttributes : retombe sur la teinte de la roue sans couleur, ou ne pose rien                        | unitaire  | `src/shared/lib/accentColor.test.ts`                  | ✅ existant |
| FRONT-SHARED-75  | ACCENT_PRESETS : couvre exactement les six teintes de la roue, dans l'ordre                                             | unitaire  | `src/shared/lib/accentPresets.test.ts`                | ✅ existant |
| FRONT-SHARED-76  | ACCENT_PRESETS : reprend les valeurs de --color-<teinte> de src/index.css (pas de derive)                               | unitaire  | `src/shared/lib/accentPresets.test.ts`                | ✅ existant |
| FRONT-SHARED-77  | ACCENT_PRESETS : presetColor renvoie la couleur d'une teinte                                                            | unitaire  | `src/shared/lib/accentPresets.test.ts`                | ✅ existant |
| FRONT-SHARED-78  | deriveProjectTheme : detecte le schema clair ou sombre d'apres le fond de page                                          | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-79  | deriveProjectTheme : garde un texte deja lisible tel quel                                                               | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-80  | deriveProjectTheme : corrige un texte illisible (gris clair sur blanc) et le signale                                    | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-81  | deriveProjectTheme : garantit texte, texte secondaire et lien lisibles pour toute palette extreme                       | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-82  | deriveProjectTheme : choisit le texte de bouton (noir ou blanc) au meilleur contraste sur l'accent                      | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-83  | deriveProjectTheme : derive des bordures et un fond discret visibles mais pas plus contrastes que le texte              | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-84  | deriveProjectTheme : couvre tous les presets : texte et lien lisibles sans correction du texte                          | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-85  | projectThemeAttributes : sans theme : aucun attribut, la fiche suit le site                                             | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-86  | projectThemeAttributes : avec un theme : marque le conteneur, son schema et ses variables                               | unitaire  | `src/shared/lib/projectTheme.test.ts`                 | ✅ existant |
| FRONT-SHARED-87  | PROJECT_THEME_PRESETS : propose six palettes aux identifiants et libelles uniques                                       | unitaire  | `src/shared/lib/projectThemePresets.test.ts`          | ✅ existant |
| FRONT-SHARED-88  | PROJECT_THEME_PRESETS : chaque palette est un theme valide pour le schema                                               | unitaire  | `src/shared/lib/projectThemePresets.test.ts`          | ✅ existant |
| FRONT-SHARED-89  | PROJECT_THEME_PRESETS : melange palettes claires et sombres                                                             | unitaire  | `src/shared/lib/projectThemePresets.test.ts`          | ✅ existant |
| FRONT-SHARED-90  | matchPreset / presetTheme : reconnait une palette identique, sinon rien                                                 | unitaire  | `src/shared/lib/projectThemePresets.test.ts`          | ✅ existant |
| FRONT-SHARED-91  | matchPreset / presetTheme : refuse un identifiant inconnu                                                               | unitaire  | `src/shared/lib/projectThemePresets.test.ts`          | ✅ existant |
| FRONT-SHARED-92  | scrollScope : regroupe les onglets d'une meme fiche projet                                                              | unitaire  | `src/shared/lib/scrollScope.test.ts`                  | ✅ existant |
| FRONT-SHARED-93  | scrollScope : distingue deux projets et les pages hors onglets                                                          | unitaire  | `src/shared/lib/scrollScope.test.ts`                  | ✅ existant |
| FRONT-SHARED-94  | ProjectCard — bannière : variante card : affiche la bannière, décorative, recadrée sur le point focal                   | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-95  | ProjectCard — bannière : variante card sans bannière : aucune image                                                     | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-96  | ProjectCard — bannière : variante hero : la bannière remplace le motif et se charge sans attendre                       | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-97  | ProjectCard — bannière : variante list : jamais d'image                                                                 | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-98  | ProjectCard — bannière : variante top : jamais d'image                                                                  | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-99  | ProjectCard — bannière : image en erreur : la carte retombe sur le rendu sans image                                     | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-100 | ProjectCard — bannière : une nouvelle URL retente le chargement après une erreur                                        | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |
| FRONT-SHARED-101 | ProjectCard — bannière : un seul lien, nommé par le titre du projet                                                     | composant | `src/shared/components/projects/ProjectCard.test.tsx` | ✅ existant |

## Jeu de démo et handlers MSW (`src/mocks`)

| ID             | Scénario                                                                                                                                                         | Type     | Fichier                                    | Statut      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ | ----------- |
| FRONT-MOCKS-01 | jeu de demo v2 : charge un volume conforme au doc 23 (~25 projets, 24 tags) et étoffé (comptes, équipes)                                                         | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-02 | jeu de demo v2 : chaque personne respecte le schema CurrentUser                                                                                                  | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-03 | jeu de demo v2 : chaque tag respecte le schema Tag                                                                                                               | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-04 | jeu de demo v2 : chaque projet respecte le schema Project (dont R-PR1)                                                                                           | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-05 | jeu de demo v2 : les personnalisations de demo sont valides et leurs images ont un enregistrement                                                                | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-06 | jeu de demo v2 : chaque appartenance, demande et invitation respecte son schema                                                                                  | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-07 | jeu de demo v2 : chaque highfive, annonce, commentaire respecte son schema                                                                                       | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-08 | jeu de demo v2 : chaque colonne, tache, mur et fichier respecte son schema                                                                                       | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-09 | jeu de demo v2 : chaque conversation et message respecte son schema                                                                                              | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-10 | jeu de demo v2 : chaque notification, signalement et action d'administration respecte son schema                                                                 | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-11 | jeu de demo v2 > integrite referentielle : chaque ownerId de projet existe parmi les utilisateurs                                                                | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-12 | jeu de demo v2 > integrite referentielle : chaque tagId de projet existe parmi les tags                                                                          | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-13 | jeu de demo v2 > integrite referentielle : R-M1 : exactement un owner par projet                                                                                 | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-14 | jeu de demo v2 > integrite referentielle : R-PR1 : un projet prive n'a que la participation on_invite                                                            | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-15 | jeu de demo v2 > integrite referentielle : chaque columnId de tache existe et appartient a un projet reel                                                        | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-16 | jeu de demo v2 > integrite referentielle : chaque projectId reference par les collections liees a un projet existe                                               | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-17 | jeu de demo v2 > integrite referentielle : chaque userId reference (auteurs, membres, participants) existe                                                       | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-18 | jeu de demo v2 > plateforme vivante (contenu cohérent) : tout projet hors brouillon a un À propos et une vraie équipe                                            | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-19 | jeu de demo v2 > plateforme vivante (contenu cohérent) : aucune personne n'apparaît deux fois dans une équipe, ni avant son inscription ou la création du projet | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-20 | jeu de demo v2 > plateforme vivante (contenu cohérent) : R-A1/R-A2 : annonces écrites par un porteur ou co-porteur, une seule épinglée                           | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-21 | jeu de demo v2 > plateforme vivante (contenu cohérent) : R-C4 : réponses à un seul niveau, dans le même projet, après leur parent                                | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-22 | jeu de demo v2 > plateforme vivante (contenu cohérent) : R-K2 : 1 à 6 colonnes ; tâches créées et confiées à des membres du projet                               | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-23 | jeu de demo v2 > plateforme vivante (contenu cohérent) : chaque projet hors brouillon a un canal qui miroite son équipe, et des messages de participants         | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-24 | jeu de demo v2 > plateforme vivante (contenu cohérent) : un fil de messages ne dépasse pas la première page du handler (20 messages)                             | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-25 | jeu de demo v2 > plateforme vivante (contenu cohérent) : R-F1 : les fichiers sont déposés par des membres (pas des observateurs), sous les plafonds              | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-26 | jeu de demo v2 > plateforme vivante (contenu cohérent) : demandes et invitations sont cohérentes avec les équipes                                                | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-27 | jeu de demo v2 > plateforme vivante (contenu cohérent) : R-H2/R-H3 : highfives uniques, jamais sur son propre projet, sous le compteur                           | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-28 | jeu de demo v2 > plateforme vivante (contenu cohérent) : chaque cible de notification et de signalement existe                                                   | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-29 | jeu de demo v2 > plateforme vivante (contenu cohérent) : lastActivityAt n'est jamais antérieure à une annonce ou un commentaire du projet                        | unitaire | `src/mocks/data/data.test.ts`              | ✅ existant |
| FRONT-MOCKS-30 | PATCH /projects/:slug/customization : 401 sans session                                                                                                           | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-31 | PATCH /projects/:slug/customization : 403 pour un co-porteur (porteur seul)                                                                                      | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-32 | PATCH /projects/:slug/customization : 403 pour un porteur qui vise le projet d'un autre                                                                          | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-33 | PATCH /projects/:slug/customization : 404 pour un projet inconnu                                                                                                 | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-34 | PATCH /projects/:slug/customization : 400 si le corps est invalide (alt manquant)                                                                                | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-35 | PATCH /projects/:slug/customization : 400 si une image n'a pas ete televersee pour ce projet                                                                     | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-36 | PATCH /projects/:slug/customization : le porteur remplace la personnalisation et le projet renvoye la porte                                                      | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-37 | PATCH /projects/:slug/customization : l'accent du theme se retrouve dans le resume de carte                                                                      | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-38 | PATCH /projects/:slug/customization : la banniere se retrouve dans le resume de carte, et le retrait l'en enleve                                                 | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-39 | PATCH /projects/:slug/customization : la personnalisation suit le projet au transfert (le patch ne la remet pas a zero)                                          | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-40 | POST /projects/:slug/customization/images : 401 sans session et 403 hors porteur                                                                                 | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-41 | POST /projects/:slug/customization/images : refuse un format hors liste blanche (GIF, SVG)                                                                       | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-42 | POST /projects/:slug/customization/images : refuse une image de plus de 2 Mo                                                                                     | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-43 | POST /projects/:slug/customization/images : televerse l'image : 201, data URL, puis le PATCH peut la referencer                                                  | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-44 | DELETE /projects/:slug/customization/images/:imageId : 403 pour un membre ordinaire                                                                              | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-45 | DELETE /projects/:slug/customization/images/:imageId : le porteur retire une image de galerie : table et projet nettoyes                                         | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-46 | DELETE /projects/:slug/customization/images/:imageId : un admin retire la banniere d'un projet qui n'est pas le sien                                             | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-47 | DELETE /projects/:slug/customization/images/:imageId : 404 pour une image d'un autre projet                                                                      | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-48 | moderation admin des medias : GET /admin/projects/:slug/media : reserve a l'administration                                                                       | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-49 | moderation admin des medias : renvoie la banniere et la galerie du projet                                                                                        | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-50 | moderation admin des medias : renvoie une galerie vide pour un projet sans personnalisation                                                                      | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-51 | moderation admin des medias : l'admin voit aussi les medias d'un projet prive ou en brouillon                                                                    | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-52 | moderation admin des medias : un admin qui retire un media est journalise avec son motif                                                                         | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-53 | moderation admin des medias : le motif est facultatif et borne a 1000 caracteres                                                                                 | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-54 | moderation admin des medias : le porteur qui retire son propre media n'est pas journalise                                                                        | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-55 | moderation admin des medias : un refus (membre) ni ne retire ni ne journalise                                                                                    | unitaire | `src/mocks/handlers/customization.test.ts` | ✅ existant |
| FRONT-MOCKS-56 | POST /reports : 401 sans session                                                                                                                                 | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-57 | POST /reports : 201 : cree un signalement `new` et le range dans la file                                                                                         | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-58 | POST /reports : 400 pour un motif hors liste                                                                                                                     | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-59 | POST /reports : 404 pour un contenu qui n'existe plus                                                                                                            | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-60 | POST /reports : 403 pour son propre contenu                                                                                                                      | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-61 | POST /reports : 409 si la meme personne signale deux fois la meme cible                                                                                          | unitaire | `src/mocks/handlers/reports.test.ts`       | ✅ existant |
| FRONT-MOCKS-62 | buildDiscoverSections : visiteur anonyme : uniquement les sections universelles, chacune avec 3 projets ou plus                                                  | unitaire | `src/mocks/handlers/search.test.ts`        | ✅ existant |
| FRONT-MOCKS-63 | buildDiscoverSections : alex.rivera connecte : sections personnalisees presentes, chacune avec 3 projets ou plus                                                 | unitaire | `src/mocks/handlers/search.test.ts`        | ✅ existant |
| FRONT-MOCKS-64 | buildDiscoverSections : le projet du moment n'apparait jamais dans une section                                                                                   | unitaire | `src/mocks/handlers/search.test.ts`        | ✅ existant |
| FRONT-MOCKS-65 | buildDiscoverSections : `for_you` ne retient que des projets partageant un theme suivi                                                                           | unitaire | `src/mocks/handlers/search.test.ts`        | ✅ existant |

## Observations

- Aucun bug bloquant détecté par les nouveaux tests.
- Le client `apiFetch` ne gère pas le 401 de façon centrale : seul `useSession` (`GET /me`) efface le jeton et repasse en visiteur. Un 401 sur une autre route est simplement remonté comme `ApiError` (comportement testé, pas un bug).
- À l'inscription, une adresse déjà utilisée affiche le message générique « La demande n'est pas valide. » (le détail du champ est dans `details`, non affiché). Limite d'UX, pas une régression.

## Non couvert / à faire

- `features/messages` (messagerie, développée ailleurs), `features/home` (page Découvrir), `shared/contexts/ThemeContext`.
- `app/` : le routeur complet (`router.tsx`), les layouts `SiteLayout`/`SiteHeader`/`SiteMobileTabBar` et la barre de progression de navigation ne sont testés qu'indirectement (gardes uniquement).
- `features/lab` : rendu du Mur (tldraw) et `useWallSync` (WebSocket Hocuspocus) ; seule la logique Yjs/présence est testée. Drag-and-drop des étapes, dialogue de détail d'une étape (édition inline) et suppression de colonne.
- `features/projects` : création et édition d'un projet (`ProjectNewPage`, `ProjectEditPage`), annonces, transitions d'état.
- `features/admin` : sections hors projets et médias.
- `features/search` : barre de recherche et menu déroulant ; onglets Personnes et Thèmes.
- `features/user` : édition du profil (`EditProfileDialog`).
- Hooks `api/queries` non couverts : annonces, commentaires, fichiers, highfives, rapports, tags, utilisateurs, administration, conversations, mur.
- Parcours bout en bout navigateur (Playwright) : relève de `highfive-infra`.
