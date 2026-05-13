# HighFive! — Frontend

## Prérequis

- Node >= 24
- pnpm (`npm install -g pnpm`)

## Démarrage rapide (après un clone)

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Installer les dépendances
pnpm install

# 3. Lancer en mode mock (aucun backend requis)
pnpm dev
```

L'application est accessible sur `http://localhost:5173`.

### Variables d'environnement

| Variable         | Valeur par défaut       | Description                             |
| ---------------- | ----------------------- | --------------------------------------- |
| `VITE_API_MODE`  | `mock`                  | Mode API : `mock` ou `http`             |
| `VITE_API_URL`   | `http://localhost:3000` | URL du backend (mode `http` uniquement) |
| `VITE_TENANT_ID` | `default-tenant`        | Tenant ID pour le multi-tenancy         |

## Docker

### Avec Docker Compose (recommandé)

```bash
docker compose up --build
```

L'application est servie par nginx sur `http://localhost:8080`.

### Image seule

```bash
# Build
docker build -t highfive-frontend .

# Run
docker run -p 8080:8080 highfive-frontend
```

Le Dockerfile utilise un build multi-stage : Node 22 pour compiler, nginx:alpine pour servir le `dist/`.

> Problème connu - build Docker échoue
>
> Le package `@plic-mti-highfive/shared-types` est hébergé sur le GitHub Package Registry et nécessite un token GitHub pour être installé. En local, `pnpm install` fonctionne si vous êtes authentifié (`~/.npmrc` global). Dans Docker, ce token n'est pas disponible au moment du `RUN pnpm install`, ce qui provoque une erreur 401.
>
> Contournement temporaire : passer le token en argument de build :
>
> ```bash
> docker build --build-arg NPM_TOKEN=ghp_xxxx -t highfive-frontend .
> ```
>
> Le Dockerfile doit être mis à jour pour accepter cet `ARG` et l'injecter dans `.npmrc` pendant le stage builder (à faire).

## Commandes disponibles

| Commande             | Description                                |
| -------------------- | ------------------------------------------ |
| `pnpm dev`           | Serveur de développement (Vite HMR)        |
| `pnpm build`         | Vérification TypeScript + build production |
| `pnpm preview`       | Prévisualiser le build de production       |
| `pnpm lint`          | ESLint sur tout le projet                  |
| `pnpm format`        | Prettier sur tout le projet                |
| `pnpm test`          | Tests unitaires (Vitest)                   |
| `pnpm test:ui`       | Interface Vitest dans le navigateur        |
| `pnpm test:coverage` | Rapport de couverture                      |

Un hook pre-commit (Husky + lint-staged) lance `prettier --write .` automatiquement avant chaque commit.

## Architecture

L'application suit une architecture feature-based hermétique : chaque feature est autonome et communique uniquement via son `index.ts`. Les imports cross-features sont interdits - seul `@shared` est accessible depuis n'importe où.

```
src/
├── features/                 # Domaines fonctionnels
│   ├── auth/                 # Authentification & inscription
│   │   ├── pages/            # LoginPage, RegisterPage
│   │   ├── components/       # AuthLayout
│   │   └── index.ts
│   │
│   ├── home/                 # Page d'accueil
│   │   ├── pages/            # HomePage
│   │   ├── components/       # FeaturedLayout, ProjectCarouselSection, TagNavBar…
│   │   ├── hooks/            # useCarousel
│   │   └── index.ts
│   │
│   ├── lab/                  # Outils créatifs (Kanban, Moodboard)
│   │   ├── pages/            # LabPage, MoodboardPage
│   │   ├── components/       # KanbanBoard, MoodboardCanvas…
│   │   ├── hooks/            # useKanban, useMoodboard
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── layout/               # Éléments de mise en page globaux
│   │   ├── components/       # Header, Footer, Logo
│   │   └── index.ts
│   │
│   ├── messages/             # Messagerie
│   │   ├── pages/            # MessagesPage
│   │   ├── components/       # ConversationList, ConversationDetail…
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── projects/             # Gestion des projets
│   │   ├── pages/            # CreateProjectPage, ProjectDetailPage
│   │   ├── components/       # ProjectHero, TicketList, ProjectFiltersBar…
│   │   ├── hooks/            # useProjectDetail, useStepTransition
│   │   └── index.ts
│   │
│   ├── search/               # Recherche globale
│   │   ├── pages/            # SearchPage
│   │   ├── components/       # SearchBar
│   │   ├── hooks/            # useSearch
│   │   └── index.ts
│   │
│   └── user/                 # Profils utilisateur
│       ├── pages/            # UserProfilePage
│       ├── components/       # EditProfileModal, ProfileTabs…
│       ├── hooks/            # useUserProfile
│       ├── utils/
│       └── index.ts
│
├── shared/                   # Modules transverses (accessibles par tous)
│   ├── components/
│   │   ├── ui/               # Primitives shadcn/ui (Button, Input, Skeleton…)
│   │   ├── projects/         # Composants projets réutilisables (SmallCard, HeroCard, Section…)
│   │   ├── ErrorBoundary.tsx
│   │   ├── ScrollToTop.tsx
│   │   └── ScrollToTopButton.tsx
│   ├── contexts/             # AuthContext, ThemeContext
│   ├── utils/                # cn, tagColors
│   └── types/                # Types TypeScript partagés (Project, User…)
│
├── api/                      # Couche d'accès aux données
│   ├── services/
│   │   ├── http/             # Implémentations HTTP réelles
│   │   ├── mock/             # Implémentations mock (données statiques)
│   │   └── interfaces/       # Contrats de service (IAuthService…)
│   ├── types/                # DTOs (AuthResponse, ProjectDto, ConversationDto…)
│   ├── config.ts             # Mode HTTP / Mock (`VITE_API_MODE`)
│   ├── http-client.ts        # Client HTTP avec gestion des tokens
│   └── index.ts
│
├── pages/                    # Pages hors-feature (NotFoundPage, Debug)
├── App.tsx                   # Routeur principal (React Router v7)
└── main.tsx
```

### Règles d'import

- `@features/<feature>` - toujours via le barrel `index.ts`, jamais dans les sous-dossiers
- `@shared/*` - accessible depuis n'importe quelle feature
- `@/api` - couche de données, ne dépend pas des features
- Pas d'import croisé entre features

### Aliases de chemin (Vite + TypeScript)

| Alias         | Résolution       |
| ------------- | ---------------- |
| `@/*`         | `src/*`          |
| `@shared/*`   | `src/shared/*`   |
| `@features/*` | `src/features/*` |

## Couche API

Les services suivent une interface commune (`IAuthService`, `IProjectService`, `IUserService`). Le mode est contrôlé par la variable d'environnement `VITE_API_MODE` :

- `mock` (défaut) - données statiques locales, aucun backend requis
- `http` - appels réels vers le backend

```bash
# Utiliser le backend réel
VITE_API_MODE=http pnpm dev
```

## Stack technique

| Catégorie              | Outil                                |
| ---------------------- | ------------------------------------ |
| UI                     | React 19, TypeScript 6               |
| Build                  | Vite 8                               |
| Routing                | React Router 7                       |
| Styling                | Tailwind CSS 4, tw-animate-css       |
| Composants headless    | base-ui                              |
| Composants shadcn      | shadcn/ui (Button, Input, Skeleton…) |
| Canvas / Whiteboard    | tldraw 5                             |
| Icônes                 | lucide-react                         |
| Tests                  | Vitest + @vitest/coverage-v8         |
| Qualité                | ESLint, Prettier, Husky, lint-staged |
| Types partagés backend | `@plic-mti-highfive/shared-types`    |
