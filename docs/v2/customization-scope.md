# Personnalisation de la fiche projet — scope v1

Statut : scope validé, plan d'implémentation à rédiger. Branche : `feat/project-customization`.

## Objectif

Le porteur d'un projet personnalise la fiche de son projet (à la itch.io, sans CSS libre) :
bannière, sections de l'Aperçu, galerie d'images et, en option, une palette de couleurs. Les visiteurs voient
le résultat. C'est une fonctionnalité optionnelle qui rend le site plus vivant : un projet
sans personnalisation s'affiche exactement comme aujourd'hui (on estime qu'environ 30 % des
projets auront des images).

## Décisions

### Droits

- Nouvelle capacité `canCustomize` (`src/features/projects/lib/capabilities.ts`) : **porteur
  (`owner`) seul**. Les co-porteurs ne personnalisent pas (contrairement à `canEdit`).
- La personnalisation **suit le projet** lors d'un transfert (`POST /projects/:slug/transfer`).
- Un projet en brouillon, terminé ou archivé reste personnalisable.

### Éléments personnalisables

1. **Bannière** : image au-dessus du header de la fiche (le titre n'est jamais superposé à
   l'image : contraste garanti). Point focal `{x, y}` (en %) pour que la zone importante
   reste visible quand le ratio change (ex. 3:1 desktop, 16:9 mobile).
2. **Couleurs (optionnel)** : une **palette de quatre couleurs** (`#rrggbb`) : fond de la page,
   fond des blocs, texte, accent (liens, boutons, onglet actif). Choix d'un des six presets
   (Papier, Forêt, Bonbon, Nuit, Océan, Terminal), puis ajustement libre au sélecteur ou par code
   hexadécimal. Absente, la fiche suit le thème du site. La palette est un tout (les quatre
   couleurs ensemble) et **s'impose à la fiche quel que soit le thème clair/sombre du visiteur**
   (la nav et le pied de page restent ceux du site). Le front dérive le reste (bordures, texte
   secondaire, texte des boutons) et **corrige les couleurs peu lisibles** : texte ≥ 4.5:1 sur
   le fond et les blocs, lien ≥ 4.5:1, appui ≥ 3:1 (`src/shared/lib/projectTheme.ts`, OKLCH,
   même teinte) ; l'éditeur signale quand le texte a été ajusté. `theme.accent` s'applique aussi
   aux **cartes** (feed, recherche, profil) via `ProjectSummary.accent`. La **bannière** s'affiche
   aussi sur les cartes `card` et `hero`, recadrée autour du point focal (voir « Bannière sur les
   cartes ») ; la galerie reste sur la fiche seule. Hors V1 : image de fond, polices, rayon.
3. **Sections de l'Aperçu** : annonce épinglée, À propos, galerie, commentaires. Chacune est
   visible ou masquée, et réordonnable. La sidebar reste fixe (elle porte l'action de
   participation).
4. **Galerie** : 8 images maximum, légende optionnelle, grille responsive et visionneuse
   accessible (lightbox).

### Visionneuse et zoom

- Une seule visionneuse pour la galerie, la **bannière** (cliquable sur la fiche) et les
  aperçus de l'éditeur (bouton « Agrandir » sur la bannière et les vignettes).
- **Vrai zoom** de 100 % à 500 % : clic sur l'image (curseur loupe, centré sur le point cliqué ; un second clic
  dézoome), boutons, touches `+` `-` `0`, molette ;
  l'image zoomée se déplace en glissant ou avec les flèches. Aucune animation.
- **Plein écran** : bouton ou touche `F`. API Fullscreen du navigateur quand elle existe
  (masque aussi son interface), sinon la visionneuse occupe toute la fenêtre. Garde le mode
  en changeant d'image ; Échap quitte le plein écran du navigateur, puis ferme la visionneuse.

### Défilement de l'éditeur

- Toute la page défile (en-tête collant) ; l'aperçu est une carte bornée collée sous l'en-tête
  (sous `lg`, onglets Édition / Aperçu).

### Images

- Compression côté client avant upload : redimensionnement et passage en WebP (bannière
  ≤ 1600 px de large, galerie ≤ 1200 px).
- Texte alternatif **obligatoire** sur chaque image, avec une case « image décorative » pour
  s'en dispenser.
- Aucun placeholder : pas d'image = pas de bloc. La section galerie n'apparaît que s'il y a
  des images.
- Mock : images stockées en mémoire côté MSW. Fixtures de démo neutres (dégradés, SVG), pas de
  fausses photos (cf. `PRODUCT.md`, « Don't invent what isn't real »).

### Éditeur

- Page dédiée `/projets/:slug/modifier` (l'ancienne adresse `/personnaliser` redirige), avec
  **aperçu live** de la vraie fiche. Un seul bouton « Modifier la fiche » y mène, en quatre
  onglets : **Infos** (titre, accroche, description, thèmes, besoins ; porteur et co-porteurs),
  puis **Images** (bannière, galerie), **Sections** et **Couleurs** (porteur seul : un
  co-porteur ne voit que Infos). Un seul bouton Enregistrer : les infos (`PATCH /projects/:slug`)
  d'abord, puis la personnalisation (`PATCH …/customization`).
- Enregistrement explicite ; confirmation si on quitte avec des changements non sauvegardés.
- **Réordonnancement** : boutons ↑/↓ (alternative sans glisser, exigée par WCAG 2.2 critère
  2.5.7, toujours visibles) + glisser-déposer par une poignée (dnd-kit : souris, tactile,
  clavier Espace/flèches/Espace, annonces et consignes en français, sans animation de transition).
- Accessibilité et responsive (mobile-first) dès le départ, éditeur compris.

### Modération

- Un admin voit et retire un média : bouton « Médias » par projet dans l'administration (liste
  de la bannière et de la galerie, agrandissement, retrait avec motif facultatif). Fonctionne
  aussi pour un projet privé ou en brouillon (`GET /admin/projects/:slug/media`). Le retrait
  est journalisé sous `remove_project_media`.

### Décisions complémentaires (après exploration du code)

- **Thème de fiche** : le wrapper de la fiche (`data-project-theme`) recâble les tokens
  sémantiques (`--background`, `--card`, `--foreground`, `--primary`, `--border`…) sur la palette ;
  `Card`, `Button`, `Section`… suivent sans modification. Les puces de titre, l'onglet actif,
  les liens du markdown et le fond du header (`accent-light`) viennent des `--accent-*` dérivés.
  Les boutons primaires de la fiche prennent donc la couleur d'accent (la règle
  « Accent-Not-Action » est levée dans la fiche d'un projet themé, seulement) ; les `TagPill`
  gardent leur teinte hachée. Limite connue : les variantes Tailwind `dark:` suivent le thème du
  site, pas celui de la fiche (les paires restent lisibles, mais ne sont pas retravaillées).
- **Éditeur** : le contenu d'abord (bannière, sections, galerie), les couleurs en dernier et
  facultatives.
- **`DESIGN.md`** amendé : exception encadrée à la « Deterministic Tint Rule » et à
  « Accent-Not-Action » pour la palette choisie par le porteur (fallback `getAccent(id)` inchangé).
- **Tests de composants** : ajout de `jsdom`, `@testing-library/react` et
  `@testing-library/user-event` en devDependencies, environnement activé fichier par fichier.
- **Garde « changements non sauvegardés »** : `useBlocker` est inutilisable (l'app utilise
  `<BrowserRouter>`, pas un data router). Garde maison : `beforeunload` + confirmation sur
  les liens et boutons internes de l'éditeur. Le bouton retour du navigateur n'est pas couvert.
- **Images** : upload immédiat à la sélection (le `PATCH` référence les ids). Les images
  téléversées mais non référencées sont à nettoyer côté backend. GIF refusé en v1 (perte
  d'animation silencieuse) ; entrée jpeg/png/webp/avif ≤ 10 Mo, sortie compressée ≤ 2 Mo.

### Bannière sur les cartes

- Même image et même point focal que la fiche : la carte la recadre (bandeau 16:9). Pas de champ
  `cover` dédié.
- Variantes `card` (bandeau en haut) et `hero` (remplace le motif CSS du panneau latéral ; bandeau en
  haut sur mobile). Les variantes denses `list` et `top` n'affichent pas d'image.
- `alt=""` sur la carte : le lien de la carte porte déjà le titre du projet. Image absente ou en
  erreur de chargement = carte sans bloc image, comme avant.
- L'éditeur affiche un aperçu de la carte avec le brouillon, pour régler le point focal.

## Contrat de données (additif, règle V2-4)

```ts
Project.customization?: {
  banner?: { url: string; alt: string; decorative: boolean; focal: { x: number; y: number } }
  theme?: { background: string; panel: string; text: string; accent: string } // "#rrggbb" en minuscules, les quatre ensemble
  sections: { id: "pinned" | "needs" | "about" | "gallery" | "comments"; visible: boolean }[] // l'ordre du tableau = l'ordre d'affichage
  gallery: { id: string; url: string; alt: string; decorative: boolean; caption?: string }[] // max 8
}
ProjectSummary.accent?: AccentColor // issu de customization.theme.accent, pour les cartes
ProjectSummary.banner?: ProjectBanner // issu de customization.banner, pour les cartes `card` et `hero`
```

`undefined` = apparence actuelle (thème du site, accent de carte haché depuis l'id, layout par défaut).

## API (à consigner dans `API-ROUTES.md`, handlers MSW, `schemas/`)

| Méthode | Route                                      | Droits         |
| ------- | ------------------------------------------ | -------------- |
| PATCH   | `/projects/:slug/customization`            | porteur seul   |
| POST    | `/projects/:slug/customization/images`     | porteur seul   |
| DELETE  | `/projects/:slug/customization/images/:id` | porteur, admin |

Upload multipart, types image uniquement, quotas à définir.

## Hors scope v1

CSS/HTML libre, description markdown étendue, embed vidéo, galerie sur les cartes, image de carte distincte de la bannière,
co-porteurs, thème du Lab, versionnement du thème.

## Points à signaler au backend

- Les URLs d'images d'un projet privé ne doivent pas être publiquement devinables (R-V3).
- Quotas et types de fichiers images (équivalent R-F1/R-F2).
- Suppression d'un média par un admin, journalisée comme les autres actions admin.
- Le transfert de projet conserve la personnalisation.

## Découpage

1. **Domaine + mock** : zod, `customization`, `ProjectSummary.accent`, handlers MSW,
   `API-ROUTES.md`, `schemas/`.
2. **Rendu fiche** : `canCustomize`, bannière, `data-accent`, sections ordonnées, galerie +
   lightbox, accent sur `ProjectCard`.
3. **Éditeur** : page + aperçu live, upload avec compression, point focal, boutons ↑/↓, alt
   text, garde de sortie.
4. **Glisser-déposer** : dnd-kit au-dessus des boutons.
5. **Admin** : retrait d'un média.
