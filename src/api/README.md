# Couche API Frontend

Cette couche permet de basculer facilement entre des données mockées et de vrais appels HTTP au backend, sans modifier le code des composants.

## Architecture

```
api/
├── config.ts              # Configuration (mock vs http), lit VITE_API_MODE
├── http-client.ts         # Client HTTP (fetch wrapper + gestion des tokens)
├── index.ts               # Point d'entrée — re-exporte tout
├── types/
│   ├── auth.types.ts          # LoginDto, RegisterDto, AuthResponse
│   ├── conversation.types.ts  # ConversationDto, MessageDto
│   ├── project.types.ts       # ProjectDto, TicketDto, CreateProjectDto…
│   ├── user.types.ts          # UserDto, UserProfileDto…
│   └── index.ts
└── services/
    ├── interfaces/        # Contrats abstraits des services
    │   ├── auth.service.interface.ts
    │   ├── project.service.interface.ts
    │   └── user.service.interface.ts
    ├── mock/              # Implémentation mock (données statiques)
    │   ├── auth.service.mock.ts
    │   ├── project.service.mock.ts
    │   ├── user.service.mock.ts
    │   └── data/          # Jeux de données mock
    ├── http/              # Implémentation HTTP réelle
    │   ├── auth.service.http.ts
    │   ├── project.service.http.ts
    │   └── user.service.http.ts
    └── index.ts           # Factory : instancie mock ou http selon config
```

> Les enums (`ProjectStatus`, `ProjectVisibility`, `ProjectRole`, `TicketStatus`, `UserStatus`, `ConnectionStatus`) viennent du package partagé `@plic-mti-highfive/shared-types`, pas de cette couche.

## Configuration

Modifier le fichier `.env` à la racine :

```bash
# Mode mock (données locales, aucun backend requis)
VITE_API_MODE=mock

# Mode http (vrai backend)
VITE_API_MODE=http
VITE_API_URL=http://localhost:3000
VITE_TENANT_ID=your-tenant-id
```

## Utilisation dans les composants

### Récupérer des projets

```typescript
import { projectService } from "@/api";

const response = await projectService.getProjects({ page: 1, limit: 20 });
const projects = response.data;
```

### Authentification

```typescript
import { authService, tokenStorage } from "@/api";

// Login — les tokens sont automatiquement stockés dans localStorage
const response = await authService.login({ email, password });

// Logout
await authService.logout();
tokenStorage.clearTokens();
```

### Créer un projet

```typescript
import { projectService } from "@/api";
import {
  ProjectStatus,
  ProjectVisibility,
} from "@plic-mti-highfive/shared-types";

const project = await projectService.createProject({
  name,
  description,
  status: ProjectStatus.DRAFT,
  visibility: ProjectVisibility.PRIVATE,
});
```

## Gestion des erreurs

```typescript
import { ApiError } from "@/api";

try {
  await projectService.getProjectById("some-id");
} catch (error) {
  if (error instanceof ApiError) {
    // error.status, error.statusText, error.data
    if (error.status === 401) {
      /* rediriger vers login */
    }
    if (error.status === 404) {
      /* afficher "non trouvé" */
    }
  }
}
```

## Services disponibles

### AuthService

| Méthode            | Description                    |
| ------------------ | ------------------------------ |
| `register(dto)`    | Créer un compte                |
| `login(dto)`       | Se connecter                   |
| `logout()`         | Se déconnecter                 |
| `refresh(dto)`     | Rafraîchir le token d'accès    |
| `getCurrentUser()` | Obtenir l'utilisateur connecté |

### ProjectService

| Méthode                                       | Description                      |
| --------------------------------------------- | -------------------------------- |
| `createProject(dto)`                          | Créer un projet                  |
| `getProjects(query?)`                         | Liste paginée des projets        |
| `getProjectById(id)`                          | Obtenir un projet                |
| `updateProject(id, dto)`                      | Mettre à jour un projet          |
| `deleteProject(id)`                           | Supprimer un projet              |
| `getProjectMembers(projectId)`                | Liste des membres                |
| `addProjectMember(projectId, dto)`            | Ajouter un membre                |
| `updateProjectMember(projectId, userId, dto)` | Modifier le rôle d'un membre     |
| `removeProjectMember(projectId, userId)`      | Retirer un membre                |
| `createTicket(projectId, dto)`                | Créer un ticket                  |
| `getProjectTickets(projectId)`                | Liste des tickets                |
| `getTicketById(projectId, ticketId)`          | Obtenir un ticket                |
| `updateTicket(projectId, ticketId, dto)`      | Mettre à jour un ticket          |
| `createMessage(projectId, dto)`               | Poster un message dans le projet |
| `getProjectMessages(projectId)`               | Liste des messages               |

### UserService

| Méthode                          | Description                   |
| -------------------------------- | ----------------------------- |
| `getUserProfile(userId)`         | Obtenir un profil utilisateur |
| `updateUserProfile(userId, dto)` | Mettre à jour son profil      |

## Types disponibles

```typescript
import type {
  // Auth
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  // Projets
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectMemberDto,
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  TicketDto,
  CreateTicketDto,
  UpdateTicketDto,
  ProjectMessageDto,
  CreateProjectMessageDto,
  ListProjectsQuery,
  PaginatedResponse,
  // Utilisateurs
  UserDto,
  UserProfileDto,
  UpdateUserProfileDto,
  UserProfileResponse,
  // Conversations
  ConversationDto,
  MessageDto,
} from "@/api";
```

## Changer de mode

Le mode est lu une seule fois au démarrage. Pour basculer dynamiquement (rare, surtout utile en dev) :

```typescript
import { setApiMode } from "@/api";

setApiMode("http"); // ou "mock"
// Les services déjà instanciés continuent d'utiliser l'ancien mode.
// Recharger la page pour que la factory recrée les instances.
```
