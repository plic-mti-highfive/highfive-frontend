# Couche API Frontend

Cette couche permet de basculer facilement entre des données mockées et de vrais appels HTTP au backend.

## Architecture

```
api/
  ├── config.ts              # Configuration (mock vs http)
  ├── http-client.ts         # Client HTTP (fetch wrapper)
  ├── index.ts               # Point d'entrée principal
  ├── types/                 # Types DTO alignés avec backend
  │   ├── enums.ts
  │   ├── auth.types.ts
  │   ├── project.types.ts
  │   ├── user.types.ts
  │   └── index.ts
  └── services/
      ├── interfaces/        # Contrats abstraits des services
      │   ├── auth.service.interface.ts
      │   ├── project.service.interface.ts
      │   └── user.service.interface.ts
      ├── mock/              # Implémentation mock
      │   ├── auth.service.mock.ts
      │   ├── project.service.mock.ts
      │   └── user.service.mock.ts
      ├── http/              # Implémentation HTTP
      │   ├── auth.service.http.ts
      │   ├── project.service.http.ts
      │   └── user.service.http.ts
      └── index.ts           # Factory (retourne mock ou http)
```

## Configuration

Modifier le fichier `.env` :

```bash
# Mode mock (données locales)
VITE_API_MODE=mock

# Mode http (vrai backend)
VITE_API_MODE=http
VITE_API_URL=http://localhost:3000
VITE_TENANT_ID=your-tenant-id
```

## Utilisation dans les composants

### Exemple : Liste des projets

```typescript
import { projectService } from '@/api'

function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects({
          status: ProjectStatus.ACTIVE,
          page: 1,
          limit: 20,
        })
        setProjects(response.data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // ...
}
```

### Exemple : Authentification

```typescript
import { authService, tokenStorage } from '@/api'

async function handleLogin(email: string, password: string) {
  try {
    const response = await authService.login({ email, password })
    // Les tokens sont automatiquement stockés dans localStorage
    console.log('Logged in:', response.user)
    return response.user
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

async function handleLogout() {
  try {
    await authService.logout()
    tokenStorage.clearTokens()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

### Exemple : Créer un projet

```typescript
import { projectService, ProjectStatus, ProjectVisibility } from '@/api'

async function handleCreateProject(name: string, description: string) {
  try {
    const newProject = await projectService.createProject({
      name,
      description,
      status: ProjectStatus.DRAFT,
      visibility: ProjectVisibility.PRIVATE,
    })
    console.log('Project created:', newProject)
    return newProject
  } catch (error) {
    console.error('Failed to create project:', error)
    throw error
  }
}
```

## Gestion des erreurs

```typescript
import { ApiError } from '@/api'

try {
  await projectService.getProjectById('some-id')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.statusText}`)
    console.error('Response data:', error.data)

    if (error.status === 401) {
      // Rediriger vers login
    } else if (error.status === 404) {
      // Afficher "not found"
    }
  } else {
    console.error('Unknown error:', error)
  }
}
```

## Changer de mode à runtime

```typescript
import { setApiMode, serviceFactory } from '@/api'

// Passer en mode HTTP
setApiMode('http')
serviceFactory.reset() // Réinitialiser les instances de services

// Passer en mode mock
setApiMode('mock')
serviceFactory.reset()
```

## Services disponibles

### AuthService

- `register(dto)` - Créer un compte
- `login(dto)` - Se connecter
- `logout()` - Se déconnecter
- `refresh(dto)` - Rafraîchir le token
- `getCurrentUser()` - Obtenir l'utilisateur connecté

### ProjectService

**Projects:**
- `createProject(dto)` - Créer un projet
- `getProjects(query)` - Liste paginée des projets
- `getProjectById(id)` - Obtenir un projet
- `updateProject(id, dto)` - Mettre à jour un projet
- `deleteProject(id)` - Supprimer un projet

**Members:**
- `getProjectMembers(projectId)` - Liste des membres
- `addProjectMember(projectId, dto)` - Ajouter un membre
- `updateProjectMember(projectId, userId, dto)` - Modifier le rôle
- `removeProjectMember(projectId, userId)` - Retirer un membre

**Tickets:**
- `createTicket(projectId, dto)` - Créer un ticket
- `getProjectTickets(projectId)` - Liste des tickets
- `getTicketById(projectId, ticketId)` - Obtenir un ticket
- `updateTicket(projectId, ticketId, dto)` - Mettre à jour un ticket

### UserService

- `getUserProfile(userId)` - Obtenir un profil utilisateur
- `updateUserProfile(userId, dto)` - Mettre à jour son profil

## Types disponibles

Tous les types sont exportés depuis `@/api/types` :

```typescript
import {
  // Enums
  UserStatus,
  ProjectStatus,
  ProjectVisibility,
  ProjectRole,
  TicketStatus,
  ConnectionStatus,

  // DTOs
  LoginDto,
  RegisterDto,
  AuthResponse,
  UserDto,
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  TicketDto,
  // ... etc
} from '@/api'
```

## Migration progressive

Cette architecture permet de migrer progressivement du mock vers HTTP :

1. **Phase 1 (actuelle)** : Mode mock uniquement
2. **Phase 2** : Tester avec le backend en changeant `VITE_API_MODE=http`
3. **Phase 3** : Identifier les différences et ajuster
4. **Phase 4** : Passer définitivement en mode HTTP en production

Le code des composants reste identique dans tous les cas !
