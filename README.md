# HighFive! - Frontend

## Prérequis

- Node >=24
- pnpm (pour l'obtenir, lancer la commande `npm install -g pnpm`)

## Lancer l'application

```bash
pnpm install
pnpm dev
```

## Architecture

L'application utilise une architecture feature-based avec une séparation claire entre les features et les modules partagés.

```
src/
├── features/                # Modules domaine (features indépendants)
│   ├── auth/                # Authentification & inscription
│   │   ├── pages/           # Pages (LoginPage, RegisterPage)
│   │   ├── components/      # Composants (AuthLayout)
│   │   ├── hooks/           # Hooks (useAuth)
│   │   └── index.ts         # Exports publics
│   │
│   ├── home/                # Page d'accueil
│   │   ├── pages/           # HomePage
│   │   ├── components/      # Composants carousel
│   │   ├── hooks/           # useCarousel
│   │   ├── data/            # Données mock
│   │   └── index.ts
│   │
│   ├── user/                # Profils utilisateur
│   │   ├── pages/           # UserProfilePage
│   │   ├── components/      # Composants profil
│   │   ├── utils/           # Utilitaires
│   │   └── index.ts
│   │
│   ├── projects/            # Gestion des projets
│   │   ├── pages/           # CreateProjectPage
│   │   ├── components/      # Composants projets
│   │   └── index.ts
│   │
│   ├── search/              # Recherche globale
│   │   ├── components/      # SearchBar, SearchResultsDropdown
│   │   ├── hooks/           # useSearch
│   │   └── index.ts
│   │
│   └── layout/              # Layout global
│       ├── components/      # Header, Footer, Logo
│       └── index.ts
│
├── shared/                  # Modules partagés
│   ├── components/
│   │   └── ui/              # Composants primitifs (Button, Input, etc.)
│   ├── hooks/               # Hooks réutilisables
│   ├── utils/               # Utilitaires (cn, tagColors)
│   ├── types/               # Types TypeScript partagés
│   └── data/                # Données partagées (mockUsers)
│
├── pages/                    # Pages racine (ex: Debug.tsx)
├── App.tsx                   # Routeur principal
└── main.tsx
```

### Principes architecturaux

- **Features indépendants**: Chaque feature peut importer de `@shared` mais PAS d'autres features
- **Séparation des responsabilités**: Logique métier isolée par domaine
- **Path aliases**: `@features/*` et `@shared/*` pour imports lisibles
- **Barrel exports**: Chaque module exporte via `index.ts`

### Stack technologique

- **React 18** + TypeScript
- **Vite** - Build tool rapide
- **Tailwind CSS** - Styling utilitaire
- **base-ui** - Composants headless
- **React Router** - Navigation
- **Lucide Icons** - Icônes
