# HighFive! frontend v2 — conventions de refonte

Branche : `v2` (depuis `dev`). Docs produit de référence : `C:\Users\thund\Downloads\highfive-docs` (00, 01, 03, 04, 06).
Ce fichier fait autorité pour le chantier v2 du frontend.

## Décisions figées

| ID    | Décision                                                                                                                                                                                                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2-1  | **Design system conservé** : celui de `src/index.css` / `DESIGN.md` (papier crème, roue de 6 teintes rose/orange/yellow/apple/sky/purple, Geist + Fraunces réservé au logo). On ne change pas les couleurs, on les fait respecter.                                                                                                              |
| V2-2  | **Zéro valeur visuelle en dur** dans `src/**/*.{ts,tsx}` : pas de hex/rgb/hsl, pas de palette Tailwind brute (`gray-500`, `blue-600`…), pas de `text-[13px]`/`shadow-[…]`/`rounded-[…]`, pas de `style={{}}` visuel (sauf variables CSS dynamiques du type `style={{ "--card-accent": token }}`). Tout passe par les tokens de `src/index.css`. |
| V2-3  | **Primitives maison** dans `src/shared/ui/` (base-ui/Radix sans style + `cva` + tokens). Les pages composent ces primitives, elles ne re-stylent pas.                                                                                                                                                                                           |
| V2-4  | **Contrat de données unique** : schémas zod dans `src/domain/` ; les types TS en sont inférés (`z.infer`). Aucune `interface Project/User/...` ailleurs.                                                                                                                                                                                        |
| V2-5  | **Une seule implémentation d'API** : `src/api/<domaine>.ts` appelle `fetch` via `src/api/client.ts`. Le mode mock = **MSW** (`src/mocks/`) qui intercepte ces mêmes routes. Brancher le backend = désactiver MSW.                                                                                                                               |
| V2-6  | **Handlers MSW = spec backend** : chaque handler valide son body et sa réponse avec les schémas de `src/domain/`. Ils serviront à rédiger les routes backend.                                                                                                                                                                                   |
| V2-7  | **TanStack Query** pour tout fetch : hooks par domaine dans `src/api/queries/<domaine>.ts` (clés centralisées). Plus de `useState`+`useEffect` de fetch fait main.                                                                                                                                                                              |
| V2-8  | **Vocabulaire du glossaire (doc 03)** dans l'UI : Découvrir, fiche, Le Lab, Mur, Étapes, porteur/co-porteur/membre/observateur, highfive, annonce, commentaire, tutoiement, casse de phrase, pas d'emoji.                                                                                                                                       |
| V2-9  | **Routes FR (doc 06)** : `/`, `/recherche`, `/u/:pseudo`, `/projets/nouveau`, `/projets/:slug`, `/projets/:slug/annonces`, `/projets/:slug/lab/mur`, `/projets/:slug/lab/etapes`, `/messages`, `/messages/:id`, `/notifications`, `/connexion`, `/inscription`, `/admin`.                                                                       |
| V2-10 | **Mur** (ex-Tableau blanc) remplace Canvas + Moodboard (un seul espace tldraw). `/debug` supprimé. Une feature inaboutie est retirée plutôt que laissée cassée.                                                                                                                                                                                 |
| V2-11 | **Erreurs** : une seule classe `ApiError` (status, code, message). Les 5 états d'écran (chargement, vide, erreur, permission, succès) utilisent les primitives `Skeleton`, `EmptyState`, `ErrorState`.                                                                                                                                          |

## Arborescence cible

```
src/
  app/            App.tsx, router.tsx, providers.tsx (QueryClient, Theme, Auth), layouts (coquille site, coquille atelier)
  domain/         schémas zod par entité + index.ts (source unique des types)
  api/            client.ts (fetch + ApiError + validation dev), <domaine>.ts, queries/<domaine>.ts
  mocks/          browser.ts, handlers/<domaine>.ts, data/ (jeu de démo cohérent), db.ts (store en mémoire)
  shared/ui/      primitives (Button, Card, Badge, TagPill, Avatar, Tabs, Dialog, Input, EmptyState, ErrorState, PageHeader, Skeleton…)
  shared/lib/     cn, dates (R-X1), couleurs déterministes (hash -> token), hooks génériques
  features/<feature>/  components/, pages/, hooks/ (UI uniquement) — une feature = un domaine d'écrans
```

## Critères d'acceptation globaux (chaque lot)

- `pnpm exec tsc -b` et `pnpm lint` verts.
- `pnpm build` vert en fin de lot.
- Pas de régression hors périmètre du lot.
- Rapport : fichiers touchés, commandes + résultat, incertitudes.

## Garde-fou automatique (V2-2)

`scripts/check-tokens.mjs` (Node pur, sans dépendance, `pnpm check:tokens`)
remplace les greps manuels ci-dessous : il échoue (exit 1) si `src/**/*.{ts,tsx}`
contient un hex, une classe de palette Tailwind brute, une valeur arbitraire
de couleur/dimension (`[#…]`/`[rgb…]`/`[hsl…]`/`[<nombre>px|rem]`) ou un
`style={{}}` visuel (hors ligne avec une variable CSS `--`). Les commentaires
sont ignorés ; exceptions de fichier explicites en tête du script (ex.
`src/features/lab/wall/tldrawTheme.ts`, palette interne du package `tldraw`).
Branché dans `pnpm check` et dans `lint-staged`.

Les greps ci-dessous restent utiles pour une recherche ponctuelle (ex.
`rg` sur un seul fichier pendant l'écriture) :

```bash
rg -n "#[0-9a-fA-F]{3,8}\b" src --glob "*.{ts,tsx}"
rg -n "\b(bg|text|border|ring|from|to|via|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" src
rg -n "\[(#|rgb|hsl|[0-9]+px)" src --glob "*.tsx"
rg -n "style=\{\{" src
```
