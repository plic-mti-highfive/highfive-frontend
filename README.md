# HighFive! — Frontend

## Prérequis

- Node >= 24
- pnpm (`npm install -g pnpm`)

## Démarrage rapide

```bash
cp .env.example .env
pnpm install
pnpm dev
```

L'application est accessible sur `http://localhost:5173`, en mode mock par
défaut (MSW intercepte toutes les routes `/api/*`, aucun backend requis).

Compte de démonstration : `alex.rivera@example.com` / `demo1234`.

### Variables d'environnement (`.env`, voir `.env.example`)

| Variable          | Valeur par défaut       | Description                                               |
| ----------------- | ----------------------- | --------------------------------------------------------- |
| `VITE_API_MODE`   | `mock`                  | `mock` (MSW, aucun backend) ou `http` (backend réel)      |
| `VITE_API_URL`    | `http://localhost:3000` | URL du backend (mode `http` uniquement)                   |
| `VITE_MOCK_DELAY` | _(latence simulée)_     | `off` pour désactiver la latence simulée des handlers MSW |

```bash
# Utiliser un backend réel
VITE_API_MODE=http VITE_API_URL=http://localhost:3000 pnpm dev
```

## Scripts

| Commande             | Description                                         |
| -------------------- | --------------------------------------------------- |
| `pnpm dev`           | Serveur de développement (Vite HMR)                 |
| `pnpm build`         | Vérification TypeScript + build production          |
| `pnpm preview`       | Prévisualiser le build de production                |
| `pnpm lint`          | ESLint sur tout le projet                           |
| `pnpm format`        | Prettier sur tout le projet                         |
| `pnpm test`          | Tests unitaires (Vitest)                            |
| `pnpm test:ui`       | Interface Vitest dans le navigateur                 |
| `pnpm test:coverage` | Rapport de couverture                               |
| `pnpm check:tokens`  | Garde-fou tokens (`scripts/check-tokens.mjs`, V2-2) |
| `pnpm check`         | `tsc -b && eslint . && check:tokens && vitest run`  |

Un hook pre-commit (Husky + lint-staged) lance `prettier --write .` et
`check:tokens` sur les fichiers `.ts`/`.tsx` modifiés avant chaque commit.

## Docker

```bash
docker compose up --build
```

L'application est servie par nginx sur `http://localhost:8080`.

## Architecture

```
src/
├── app/            App.tsx, router.tsx (routes FR), providers.tsx, layouts (coquille site, coquille atelier)
├── domain/         Schémas zod par entité (source unique des types, z.infer)
├── api/            client.ts (fetch + ApiError), <domaine>.ts, queries/<domaine>.ts (hooks TanStack Query)
├── mocks/          browser.ts, handlers/<domaine>.ts (= spec backend), data/, db.ts
├── shared/
│   ├── ui/         Primitives maison (base-ui/Radix + cva + tokens) : Button, Card, Badge, Dialog…
│   ├── lib/        cn, dates, couleurs déterministes (accent), hooks génériques
│   └── components/ Composants transverses composés à partir des primitives (ex. ProjectCard)
└── features/<feature>/  components/, pages/, hooks/ — un domaine d'écrans par feature
```

### Alias de chemin (Vite + TypeScript)

| Alias         | Résolution       |
| ------------- | ---------------- |
| `@/*`         | `src/*`          |
| `@shared/*`   | `src/shared/*`   |
| `@features/*` | `src/features/*` |

## Règles clés

- **Tokens uniquement** : aucune valeur visuelle en dur (`src/**/*.{ts,tsx}`)
  — hex, palette Tailwind brute, `text-[13px]`, `style={{}}` visuel. Tout
  passe par les tokens de `src/index.css`, vérifié par `pnpm check:tokens`.
  Détails : `docs/v2/CONVENTIONS.md`.
- **Primitives** : les pages composent `src/shared/ui/`, elles ne re-stylent
  pas de composants headless directement.
- **Contrat de données unique** : schémas zod dans `src/domain/` ; aucune
  `interface Project/User/...` ailleurs.
- **Hooks de requête** : tout accès réseau passe par `src/api/queries/<domaine>.ts`
  (TanStack Query), jamais de `useState`+`useEffect` de fetch fait main.
- **MSW = spec backend** : chaque handler de `src/mocks/handlers/` valide
  entrée/sortie avec les schémas de `src/domain/` et sert de référence au
  contrat de routes — voir `docs/v2/API-ROUTES.md`.

## Stack technique

| Catégorie              | Outil                                |
| ---------------------- | ------------------------------------ |
| UI                     | React 19, TypeScript 6               |
| Build                  | Vite 8                               |
| Routing                | React Router 7                       |
| Styling                | Tailwind CSS 4, tw-animate-css       |
| Composants headless    | base-ui                              |
| Contrat de données     | zod                                  |
| Requêtes serveur       | TanStack Query                       |
| Mock API               | MSW                                  |
| Tableau blanc (canvas) | tldraw                               |
| Icônes                 | lucide-react                         |
| Tests                  | Vitest + @vitest/coverage-v8         |
| Qualité                | ESLint, Prettier, Husky, lint-staged |
