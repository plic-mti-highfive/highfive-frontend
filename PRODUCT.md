# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants to carry out a project, or wants to join one — community initiatives, builds, coding projects, creative work, and beyond. General purpose, not niche to one domain.

The core persona is someone who wants to accomplish something but doesn't know where to look: city webpages, Facebook groups, Discord servers — too many scattered options, too much time spent filtering for people who share a common idea or project. HighFive! is a general-purpose, social-based work organizer for teams of people who may not know each other yet but have complementary skills.

## Product Purpose

HighFive! lets people discover real-world projects worth joining (or start their own) and then actually run them as a team: recruit contributors with complementary skills, coordinate through a shared canvas and kanban board, chat, and post progress — all in one place. Success means a project that would otherwise die in a scattered Facebook group or Discord actually gets organized and moved forward, with the right people finding it and each other.

## Positioning

All-in-one for real-world projects. Competing tools force a team to stitch together a discovery/social layer (Facebook groups, Discord), a planning tool (Trello/Notion), and a real-time creative space (a separate whiteboard app) — HighFive! combines project discovery + social feed + a real-time collaborative canvas (tldraw-based, with AI task-proposal generation from canvas content) + kanban ("Lab") + chat + moodboards in one product, so an ad-hoc project doesn't need four disconnected tools to get organized.

## Operating Context

- Public home feed (featured/trending/popular/active/recent) and search (projects, users, tags) drive discovery of projects to join.
- A project has a detail page, a news feed for announcements, a real-time collaborative canvas (drawing/sketching, with AI-generated task proposals), a kanban board ("Lab") for tickets/tasks with checklists and comments, and a moodboard for visual inspiration.
- Members join projects with a role (owner/editor/viewer) that governs access to collaborative areas.
- Users have public profiles (bio, avatar, followers/following, project history) and can message each other directly or in groups.
- Tags categorize projects with a consistent color system; a "highfive" count acts as a like/social-proof signal on projects.
- An admin dashboard manages users and projects; a debug page exists for internal development use.
- Backend has a mock mode (default, static fixtures) and an http mode (real API) toggled by environment variable — recent work aligned the two so mock data doesn't invent facts the real API doesn't support.

## Capabilities and Constraints

- Real-time collaboration is CRDT-based (Yjs + Hocuspocus) — canvas and kanban states sync live across members.
- Canvas is built on tldraw; it can generate AI task proposals from what's drawn/written on it.
- Multi-tenant architecture is in place (tenant identifier in config), though only a single default tenant is in use today.
- Terminology: Project, Member/Role (Owner/Editor/Viewer), Ticket (kanban task), Canvas, Tag, Conversation, News, Moodboard, HighfiveCount.

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
4. Real-time and collaborative by default: canvas and kanban are shared live spaces for people who may be strangers at the start, not single-player tools.
5. Don't invent what isn't real: mock data and copy must reflect only what the real product can actually deliver (per the recent mock/http alignment fix) — no invented benchmarks, pricing, or claims.

## Accessibility & Inclusion

No formal accessibility standard has been established yet. Existing coverage relies on Radix UI/shadcn primitives and scattered ARIA attributes (e.g. breadcrumb navigation, scroll-to-top button); no comprehensive audit exists.
