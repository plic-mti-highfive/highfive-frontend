# Personnalisation de la fiche projet — scope v1

Statut : scope validé, plan d'implémentation à rédiger. Branche : `feat/project-customization`.

## Objectif

Le porteur d'un projet personnalise la fiche de son projet (à la itch.io, sans CSS libre) :
bannière, couleur d'accent, sections de l'Aperçu et galerie d'images. Les visiteurs voient
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
2. **Accent** : une **couleur libre** (`#rrggbb`), choisie au sélecteur, par code hexadécimal
   ou parmi six couleurs rapides (la roue du design system). Les six teintes imposées
   donnaient de mauvais rendus en thème sombre (grand bloc saturé) : le front dérive désormais,
   pour chaque thème, une couleur d'appui (≥ 3:1), une surface teintée discrète et une couleur
   de texte (≥ 4.5:1) au contraste garanti (`src/shared/lib/accentColor.ts`, OKLCH, même
   teinte). « Automatique » (pas de couleur) garde la teinte hachée du projet. L'accent
   s'applique aussi aux **cartes** (feed, recherche, profil) pour garder une identité
   cohérente ; la bannière et la galerie restent sur la fiche seule.
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

- Page dédiée `/projets/:slug/personnaliser`, réservée au porteur, avec **aperçu live** de la
  vraie fiche.
- Enregistrement explicite ; confirmation si on quitte avec des changements non sauvegardés.
- **Réordonnancement** : boutons ↑/↓ (alternative sans glisser, exigée par WCAG 2.2 critère
  2.5.7, toujours visibles) + glisser-déposer par une poignée (dnd-kit : souris, tactile,
  clavier Espace/flèches/Espace, annonces et consignes en français, sans animation de transition).
- Accessibilité et responsive (mobile-first) dès le départ, éditeur compris.

### Modération

- Un admin doit pouvoir voir et retirer un média. Important mais non prioritaire : le contrat
  prévoit l'action, l'UI admin est reportée.

### Décisions complémentaires (après exploration du code)

- **Accent « marqué »** : en plus des touches d'accent discrètes (onglet actif, puce des titres
  de section, annonce épinglée, liens du markdown, liseré de la sidebar, focus de la galerie),
  le header de la fiche prend un fond léger `accent-light`. Les `TagPill`, le CTA et les
  autres boutons gardent leurs couleurs (règle « Accent-Not-Action »). Contraste à vérifier
  pour les 6 teintes en clair et en sombre.
- **`DESIGN.md`** amendé : exception encadrée à la « Deterministic Tint Rule » pour l'accent
  choisi par le porteur (fallback `getAccent(id)` inchangé).
- **Tests de composants** : ajout de `jsdom`, `@testing-library/react` et
  `@testing-library/user-event` en devDependencies, environnement activé fichier par fichier.
- **Garde « changements non sauvegardés »** : `useBlocker` est inutilisable (l'app utilise
  `<BrowserRouter>`, pas un data router). Garde maison : `beforeunload` + confirmation sur
  les liens et boutons internes de l'éditeur. Le bouton retour du navigateur n'est pas couvert.
- **Images** : upload immédiat à la sélection (le `PATCH` référence les ids). Les images
  téléversées mais non référencées sont à nettoyer côté backend. GIF refusé en v1 (perte
  d'animation silencieuse) ; entrée jpeg/png/webp/avif ≤ 10 Mo, sortie compressée ≤ 2 Mo.

## Contrat de données (additif, règle V2-4)

```ts
Project.customization?: {
  banner?: { url: string; alt: string; decorative: boolean; focal: { x: number; y: number } }
  accent?: AccentColor // "#rrggbb" en minuscules
  sections: { id: "pinned" | "about" | "gallery" | "comments"; visible: boolean }[] // l'ordre du tableau = l'ordre d'affichage
  gallery: { id: string; url: string; alt: string; decorative: boolean; caption?: string }[] // max 8
}
ProjectSummary.accent?: AccentColor // issu de customization.accent, pour les cartes
```

`undefined` = apparence actuelle (accent haché depuis l'id, layout par défaut).

## API (à consigner dans `API-ROUTES.md`, handlers MSW, `schemas/`)

| Méthode | Route                                      | Droits         |
| ------- | ------------------------------------------ | -------------- |
| PATCH   | `/projects/:slug/customization`            | porteur seul   |
| POST    | `/projects/:slug/customization/images`     | porteur seul   |
| DELETE  | `/projects/:slug/customization/images/:id` | porteur, admin |

Upload multipart, types image uniquement, quotas à définir.

## Hors scope v1

CSS/HTML libre, description markdown étendue, embed vidéo, bannière ou galerie sur les cartes,
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
