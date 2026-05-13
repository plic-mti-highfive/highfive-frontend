# HighFive! — Frontend

## Prérequis

- Node >= 24
- pnpm (`npm install -g pnpm`)

## Installation & démarrage

```bash
pnpm install
pnpm dev
```

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

L'application suit une architecture **feature-based hermétique** : chaque feature est autonome et communique uniquement via son `index.ts`. Les imports cross-features sont interdits — seul `@shared` est accessible depuis n'importe où.

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

- `@features/<feature>` — toujours via le barrel `index.ts`, jamais dans les sous-dossiers
- `@shared/*` — accessible depuis n'importe quelle feature
- `@/api` — couche de données, ne dépend pas des features
- Pas d'import croisé entre features

### Aliases de chemin (Vite + TypeScript)

| Alias         | Résolution       |
| ------------- | ---------------- |
| `@/*`         | `src/*`          |
| `@shared/*`   | `src/shared/*`   |
| `@features/*` | `src/features/*` |

## Couche API

Les services suivent une interface commune (`IAuthService`, `IProjectService`, `IUserService`). Le mode est contrôlé par la variable d'environnement `VITE_API_MODE` :

- `mock` (défaut) — données statiques locales, aucun backend requis
- `http` — appels réels vers le backend

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
