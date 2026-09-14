# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants to carry out a project, or wants to join one — community initiatives, builds, coding projects, creative work, and beyond. General purpose, not niche to one domain.

The core persona is someone who wants to accomplish something but doesn't know where to look: city webpages, Facebook groups, Discord servers — too many scattered options, too much time spent filtering for people who share a common idea or project. HighFive! is a general-purpose, social-based work organizer for teams of people who may not know each other yet but have complementary skills.

## Product Purpose

HighFive! lets people discover real-world projects worth joining (or start their own) and then actually run them as a team: recruit contributors with complementary skills, coordinate through Le Lab (Le Mur, a shared drawing space, plus Les Tâches, a kanban board), chat, and post progress — all in one place. Success means a project that would otherwise die in a scattered Facebook group or Discord actually gets organized and moved forward, with the right people finding it and each other.

## Positioning

All-in-one for real-world projects. Competing tools force a team to stitch together a discovery/social layer (Facebook groups, Discord), a planning tool (Trello/Notion), and a real-time creative space (a separate whiteboard app) — HighFive! combines project discovery + social feed + Le Lab (Le Mur, a real-time collaborative canvas, and Les Tâches, a kanban board) + chat in one product, so an ad-hoc project doesn't need several disconnected tools to get organized.

## Operating Context

- The Découvrir feed and search (projects, people, tags) drive discovery of projects to join.
- A project has a fiche (detail page) with announcements, a team tab, and — for its team — Le Lab: Le Mur (a real-time collaborative drawing space) and Les Tâches (a kanban board), plus files and comments.
- People join a project with a role — porteur (owner), co-porteur, membre, or observateur — that governs access to Le Lab and to the team's tools; a porteur can open Le Mur and Les Tâches to observateurs in read-only.
- Users have public profiles (bio, avatar, project history) and can message each other directly or in groups.
- Tags categorize projects with a consistent, deterministic color system; a "highfive" count acts as a like/social-proof signal on projects.
- An admin dashboard manages users and projects, and moderates reports and comments.
- Backend has a mock mode (default, MSW intercepting the API contract) and an http mode (real API) toggled by `VITE_API_MODE` — the MSW handlers double as the backend contract spec (see `docs/v2/API-ROUTES.md`).

## Capabilities and Constraints

- Le Mur is built on tldraw, a real-time drawing/sketching canvas shared by a project's team.
- Terminology (French, doc 03 glossary): projet, fiche, porteur/co-porteur/membre/observateur, Le Lab, Le Mur, Les Tâches, tâche, annonce, commentaire, tag, highfive, conversation, notification.

## Brand Commitments

- Name is "HighFive!" (with exclamation mark) — locked.
- French-only for now; no i18n/English support planned yet, so copy, error messages, and content stay in French.
- Typography already established: Fraunces (serif, display) paired with Geist (sans, body).

## Evidence on Hand

- Mock fixtures show illustrative project domains (community garden, charity music festival, participatory cooking class, winter drive, collaborative mural) — these are placeholder/mock data, not real case studies or testimonials, and must not be presented as real evidence in future work.
- No real customer testimonials, press, or usage metrics exist yet — do not fabricate them.

## Product Principles

1. Lower the cost of finding your people: discovery (feed, search, tags, social proof) is a first-class job, not an afterthought bolted onto project management.
2. One place beats four tools: every feature added should reduce, not add to, the number of external tools a project team needs to run itself.
3. General-purpose over niche: the product must stay legible for wildly different project domains (civic, creative, technical, community) rather than optimizing its language or flows for just one.
4. Real-time and collaborative by default: Le Mur and Les Tâches are shared live spaces for people who may be strangers at the start, not single-player tools.
5. Don't invent what isn't real: mock data and copy must reflect only what the real product can actually deliver (per the recent mock/http alignment fix) — no invented benchmarks, pricing, or claims.

## Accessibility & Inclusion

No formal accessibility standard has been established yet. Existing coverage relies on the house primitives (`src/shared/ui/`, built on base-ui/Radix) and scattered ARIA attributes (e.g. breadcrumb navigation, scroll-to-top button); no comprehensive audit exists.
