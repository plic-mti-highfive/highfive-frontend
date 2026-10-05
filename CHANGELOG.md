# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Personnalisation de la fiche projet (porteur seul) : banniere avec point
  focal, accent a couleur libre (variantes clair/sombre au contraste garanti), sections de l'Apercu
  ordonnables et masquables, galerie de 8 images au plus. Contrat additif
  (`Project.customization`, `ProjectSummary.accent`, trois routes) documente
  dans `docs/v2/customization-scope.md`, `API-ROUTES.md`, `openapi.yaml` et
  `SPEC.md`. Rendu de la fiche : banniere, header teinte, sections ordonnees,
  galerie et visionneuse accessible, accent sur les cartes. Editeur du
  porteur sur `/projets/:slug/personnaliser` avec apercu live : accent,
  banniere (point focal, texte alternatif obligatoire), sections reordonnables
  par boutons ou glisser-deposer (dnd-kit), galerie, compression WebP cote
  client, garde de sortie.

### Changed

- `DESIGN.md` : exception encadree a la « Deterministic Tint Rule » pour
  l'accent de projet choisi par son porteur.

## [2.0.1] - 2026-09-16

### Fixed

- Les appels API tombent sur l'origine de la page au lieu de
  `http://localhost:3000` fige au build. Dans une image Docker, le front et
  l'API sont servis par la meme gateway et l'URL publique n'est pas connue au
  moment du build : l'interface se chargeait mais aucun appel n'aboutissait.
  `VITE_API_URL` est desormais exposee en `ARG` du Dockerfile, vide par
  defaut, et une base vide signifie « meme origine ».
- Le bundle `docs/v2/backend/schemas/` n'avait pas ete regenere apres le
  passage de `wallToTasksInputSchema` de `elementIds` a `elements` :
  `WallToTasksInput.json` documentait une forme qui n'existait plus ni au
  front ni au back. Le contrat publie decrit de nouveau ce qui est reellement
  accepte.

## [2.0.0] - 2026-09-16

### Added

- Docker support with `Dockerfile` for containerized deployment
- GitHub Actions CI/CD pipeline (`.github/workflows/pipeline.yml`)
