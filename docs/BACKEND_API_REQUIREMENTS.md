# Endpoints Backend Requis pour Migration Complète

Ce document liste les endpoints backend nécessaires pour compléter la migration du frontend vers la couche API.

## État actuel

✅ **Endpoints déjà implémentés** (selon exploration backend) :
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `POST /auth/logout` - Se déconnecter
- `POST /auth/refresh` - Rafraîchir le token
- `GET /auth/me` - Utilisateur connecté
- `POST /projects` - Créer un projet
- `GET /projects` - Liste des projets (avec filtres status, visibility, pagination)
- `GET /projects/:id` - Détails d'un projet
- `PATCH /projects/:id` - Modifier un projet
- `DELETE /projects/:id` - Supprimer un projet
- `GET /projects/:projectId/members` - Membres d'un projet
- `POST /projects/:projectId/members` - Ajouter un membre
- `PATCH /projects/:projectId/members/:userId` - Modifier le rôle
- `DELETE /projects/:projectId/members/:userId` - Retirer un membre
- `POST /projects/:projectId/tickets` - Créer un ticket
- `GET /projects/:projectId/tickets` - Liste des tickets
- `GET /projects/:projectId/tickets/:ticketId` - Détails d'un ticket
- `PATCH /projects/:projectId/tickets/:ticketId` - Modifier un ticket
- `GET /users/:id/profile` - Profil utilisateur
- `PATCH /users/:id/profile` - Modifier son profil

---

## 🚧 Endpoints à implémenter

### 1. Recherche d'utilisateur par username

**Frontend use case** : `UserProfilePage` - L'URL utilise le username (`/profile/:username`) mais l'API backend nécessite un userId (UUID).

**Endpoint** :
```
GET /users/by-username/:username
```

**Paramètres** :
- `username` (path) - Le username de l'utilisateur

**Réponse** : `200 OK`
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "bio": "...",
  "avatarPath": "...",
  "themePreference": "light",
  "emailNotifications": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Erreurs** :
- `404 Not Found` - Utilisateur non trouvé

---

### 2. Projets d'un utilisateur

**Frontend use case** : `UserProfilePage` - Afficher les projets créés, collaborations et projets likés d'un utilisateur.

#### 2.1 Projets créés par un utilisateur

```
GET /users/:userId/projects/created
```

**Query parameters** :
- `page` (optional) - Numéro de page (défaut: 1)
- `limit` (optional) - Nombre par page (défaut: 20)
- `status` (optional) - Filtrer par status (DRAFT, ACTIVE, ARCHIVED)

**Réponse** : `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "...",
      "status": "ACTIVE",
      "visibility": "PUBLIC",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

#### 2.2 Projets où l'utilisateur contribue

```
GET /users/:userId/projects/contributions
```

Mêmes paramètres et réponse que 2.1.

**Note** : Retourne les projets où l'utilisateur est membre mais pas OWNER.

#### 2.3 Projets likés/suivis par l'utilisateur

```
GET /users/:userId/projects/liked
```

Mêmes paramètres et réponse que 2.1.

**Note** : Nécessite d'implémenter un système de "likes" ou "follows" sur les projets (nouvelle table `project_followers` probablement déjà existante selon schema).

---

### 3. Réseau social (Followers/Following)

**Frontend use case** : `UserProfilePage` - Afficher les abonnés et abonnements d'un utilisateur.

#### 3.1 Liste des abonnés (Followers)

```
GET /users/:userId/followers
```

**Query parameters** :
- `page` (optional) - Numéro de page
- `limit` (optional) - Nombre par page

**Réponse** : `200 OK`
```json
{
  "data": [
    {
      "userId": "uuid",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatarPath": "...",
      "followedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### 3.2 Liste des abonnements (Following)

```
GET /users/:userId/following
```

Mêmes paramètres et réponse que 3.1.

#### 3.3 Suivre un utilisateur

```
POST /users/:userId/follow
```

**Réponse** : `201 Created`
```json
{
  "userId": "uuid",
  "status": "following"
}
```

#### 3.4 Ne plus suivre un utilisateur

```
DELETE /users/:userId/follow
```

**Réponse** : `204 No Content`

#### 3.5 Vérifier le statut de suivi

```
GET /users/:userId/follow-status
```

**Réponse** : `200 OK`
```json
{
  "isFollowing": true,
  "followedAt": "2024-01-01T00:00:00Z"
}
```

---

### 4. Recherche globale

**Frontend use case** : `useSearch` hook - Recherche unifiée dans projets, utilisateurs, tags et progress.

```
GET /search
```

**Query parameters** :
- `q` (required) - Terme de recherche
- `types` (optional) - Types à rechercher séparés par virgules : `projects,users,tags,progress` (défaut: tous)
- `limit` (optional) - Nombre de résultats par type (défaut: 10)

**Réponse** : `200 OK`
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "...",
      "matchScore": 0.95
    }
  ],
  "users": [
    {
      "userId": "uuid",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatarPath": "...",
      "matchScore": 0.87
    }
  ],
  "tags": [
    {
      "name": "React",
      "count": 42,
      "matchScore": 1.0
    }
  ],
  "progress": [
    {
      "id": "uuid",
      "title": "Task title",
      "projectId": "uuid",
      "projectName": "Project Name",
      "description": "...",
      "matchScore": 0.76
    }
  ]
}
```

**Notes** :
- `matchScore` est optionnel, indique la pertinence (0-1)
- Si `types` est spécifié, seuls ces types sont retournés
- Chaque type est limité à `limit` résultats

---

### 5. Catégorisation des projets

**Frontend use case** : `HomePage` - Afficher des sections de projets (Featured, Trending, Ending Soon, etc.).

#### Option A : Query parameter sur l'endpoint existant

Ajouter un paramètre `category` à `GET /projects` :

```
GET /projects?category=featured
GET /projects?category=trending
GET /projects?category=ending-soon
GET /projects?category=successful
GET /projects?category=recent
```

**Catégories suggérées** :
- `featured` - Projets mis en avant (logique backend à définir)
- `trending` - Projets populaires récents (basé sur activité récente)
- `ending-soon` - Projets avec date de fin proche (nécessite champ `endDate`)
- `successful` - Projets terminés avec succès
- `recent` - Projets créés récemment
- `recommended` - Projets recommandés pour l'utilisateur (basé sur intérêts)

#### Option B : Endpoints dédiés

```
GET /projects/featured
GET /projects/trending
GET /projects/ending-soon
GET /projects/successful
GET /projects/recent
GET /projects/recommended
```

**Recommandation** : Option A (plus flexible)

---

### 6. Statistiques utilisateur

**Frontend use case** : `UserProfilePage` - Afficher les stats (projets créés, contributions, followers, following).

```
GET /users/:userId/stats
```

**Réponse** : `200 OK`
```json
{
  "projectsCreated": 12,
  "projectsContributed": 34,
  "followers": 245,
  "following": 189,
  "totalLikes": 456,
  "joinedAt": "2024-01-01T00:00:00Z"
}
```

---

### 7. Tags système

**Frontend use case** : Recherche et filtrage par tags.

#### 7.1 Liste de tous les tags

```
GET /tags
```

**Query parameters** :
- `page` (optional)
- `limit` (optional)
- `sortBy` (optional) - `name`, `count` (défaut: `count`)
- `order` (optional) - `asc`, `desc` (défaut: `desc`)

**Réponse** : `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "React",
      "count": 42
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### 7.2 Tags d'un projet

```
GET /projects/:projectId/tags
```

**Réponse** : `200 OK`
```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "React"
    }
  ]
}
```

#### 7.3 Ajouter des tags à un projet

```
POST /projects/:projectId/tags
```

**Body** :
```json
{
  "tagIds": ["uuid1", "uuid2"]
}
```

**Réponse** : `200 OK`

#### 7.4 Retirer un tag d'un projet

```
DELETE /projects/:projectId/tags/:tagId
```

**Réponse** : `204 No Content`

---

### 8. Système de likes/follows de projets

**Frontend use case** : Permettre aux utilisateurs de "liker" ou "suivre" des projets.

#### 8.1 Liker un projet

```
POST /projects/:projectId/like
```

**Réponse** : `201 Created`
```json
{
  "projectId": "uuid",
  "liked": true,
  "likedAt": "2024-01-01T00:00:00Z"
}
```

#### 8.2 Retirer le like

```
DELETE /projects/:projectId/like
```

**Réponse** : `204 No Content`

#### 8.3 Vérifier le statut de like

```
GET /projects/:projectId/like-status
```

**Réponse** : `200 OK`
```json
{
  "isLiked": true,
  "likedAt": "2024-01-01T00:00:00Z",
  "totalLikes": 142
}
```

---

## 📋 Modifications de schéma nécessaires

### Tables à ajouter/vérifier :

1. **project_followers** (probablement existe déjà selon exploration)
   - Relation many-to-many entre users et projects pour les likes

2. **project_tags** (relation many-to-many)
   - `project_id` (FK projects)
   - `tag_id` (FK skills qui sert de tags)

3. **user_connections** (existe déjà selon exploration)
   - Vérifier que le système followers/following fonctionne

### Champs à ajouter :

1. **projects table** :
   - `end_date` (Date, nullable) - Pour catégorie "ending soon"
   - `featured` (Boolean, default false) - Marquer comme featured

2. **users table** (via profile) :
   - `username` (String, unique, nullable initialement) - Pour l'URL `/profile/:username`
   - Note : Actuellement seul `email` existe

---

## 🎯 Priorités d'implémentation

### Priority 1 (Bloquant pour migration complète) :
1. `GET /users/by-username/:username` - Essentiel pour UserProfilePage
2. `GET /users/:userId/stats` - Stats basiques
3. `GET /projects?category=...` - Catégorisation HomePage

### Priority 2 (Important) :
4. `GET /users/:userId/projects/created`
5. `GET /users/:userId/projects/contributions`
6. `GET /search` - Recherche unifiée

### Priority 3 (Nice to have) :
7. `GET /users/:userId/followers`
8. `GET /users/:userId/following`
9. Système de likes/follows de projets
10. Système de tags complet

---

## 📝 Notes pour l'équipe backend

1. **Multi-tenancy** : Tous les endpoints doivent respecter le header `X-Tenant-ID`

2. **Authentification** : La plupart des endpoints nécessitent JWT sauf :
   - `GET /search` (peut être public ou authentifié)
   - `GET /users/:userId/profile` (peut être public pour profils publics)
   - `GET /projects` avec visibility=PUBLIC (peut être public)

3. **Pagination** : Format standard déjà utilisé :
   ```json
   {
     "data": [...],
     "total": 100,
     "page": 1,
     "limit": 20,
     "totalPages": 5
   }
   ```

4. **Erreurs** : Format standard NestJS avec :
   - `statusCode` (number)
   - `message` (string ou array)
   - `error` (string)

5. **Username unique** : Ajouter contrainte unique sur username dans la table user_profiles avec migration pour générer usernames depuis emails existants.

6. **Performance** :
   - Indexer `username` pour les recherches rapides
   - Utiliser pagination sur tous les endpoints de liste
   - Considérer mise en cache pour catégories de projets

7. **Documentation** : Mettre à jour le Swagger après implémentation
