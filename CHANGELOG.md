# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-09-16

### Fixed

- Les appels API tombent sur l'origine de la page au lieu de
  `http://localhost:3000` fige au build. Dans une image Docker, le front et
  l'API sont servis par la meme gateway et l'URL publique n'est pas connue au
  moment du build : l'interface se chargeait mais aucun appel n'aboutissait.
  `VITE_API_URL` est desormais exposee en `ARG` du Dockerfile, vide par
  defaut, et une base vide signifie « meme origine ».

## [2.0.0] - 2026-09-16

### Added

- Docker support with `Dockerfile` for containerized deployment
- GitHub Actions CI/CD pipeline (`.github/workflows/pipeline.yml`)
