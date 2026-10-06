/**
 * Factory de cles TanStack Query centralisee (V2-7). Chaque domaine expose
 * un objet de fonctions produisant des tuples stables ; les mutations
 * invalident via ces memes cles plutot que des chaines dupliquees.
 */
export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  users: {
    byUsername: (username: string) => ["users", username] as const,
    projects: (username: string) => ["users", username, "projects"] as const,
    suggestedPeople: () => ["users", "suggested"] as const,
  },
  tags: {
    all: () => ["tags"] as const,
  },
  projects: {
    list: (query: unknown) => ["projects", "list", query] as const,
    detail: (slug: string) => ["projects", "detail", slug] as const,
    mine: () => ["projects", "mine"] as const,
    highfivers: (slug: string) => ["projects", slug, "highfivers"] as const,
    members: (slug: string) => ["projects", slug, "members"] as const,
    joinRequests: (slug: string) =>
      ["projects", slug, "join-requests"] as const,
    invitations: (slug: string) => ["projects", slug, "invitations"] as const,
    announcements: (slug: string) =>
      ["projects", slug, "announcements"] as const,
    comments: (slug: string) => ["projects", slug, "comments"] as const,
    columns: (slug: string) => ["projects", slug, "columns"] as const,
    tasks: (slug: string) => ["projects", slug, "tasks"] as const,
    wall: (slug: string) => ["projects", slug, "wall"] as const,
    wallSession: (slug: string) =>
      ["projects", slug, "wall", "session"] as const,
    files: (slug: string) => ["projects", slug, "files"] as const,
  },
  feed: {
    discover: () => ["feed", "discover"] as const,
    byTag: (tagId: string, cursor?: string) =>
      ["feed", "tag", tagId, cursor ?? null] as const,
    trendingTags: () => ["feed", "trending-tags"] as const,
  },
  search: {
    results: (params: unknown) => ["search", params] as const,
  },
  conversations: {
    list: () => ["conversations"] as const,
    detail: (id: string) => ["conversations", id] as const,
    messages: (id: string, cursor?: string) =>
      ["conversations", id, "messages", cursor ?? null] as const,
  },
  notifications: {
    /** Prefixe utilise pour invalider toutes les cles notifications (liste + compteur de l'en-tete). */
    all: () => ["notifications"] as const,
    list: (cursor?: string) => ["notifications", cursor ?? null] as const,
    preferences: () => ["notifications", "preferences"] as const,
  },
  admin: {
    reports: (cursor?: string) => ["admin", "reports", cursor ?? null] as const,
    stats: () => ["admin", "stats"] as const,
    users: (cursor?: string) => ["admin", "users", cursor ?? null] as const,
    projects: (cursor?: string) =>
      ["admin", "projects", cursor ?? null] as const,
    projectMedia: (slug: string) => ["admin", "project-media", slug] as const,
    tags: () => ["admin", "tags"] as const,
  },
} as const;
