import type {
  AdminUser,
  AdminProject,
  AdminStats,
  AdminTenant,
  DailyRegistration,
  RecentlyClosedProject,
} from "@features/admin/types";

export const mockAdminUsers: AdminUser[] = [
  {
    id: "user-1",
    email: "alice.dupont@example.com",
    username: "alice.dupont",
    status: "ACTIVE",
    projectsCount: 8,
    followersCount: 142,
    joinedAt: new Date("2025-02-14"),
  },
  {
    id: "user-2",
    email: "sophie.martin@example.com",
    username: "sophie.martin",
    status: "ACTIVE",
    projectsCount: 5,
    followersCount: 87,
    joinedAt: new Date("2025-03-01"),
  },
  {
    id: "user-3",
    email: "thomas.dupont@example.com",
    username: "thomas.dupont",
    status: "ACTIVE",
    projectsCount: 3,
    followersCount: 34,
    joinedAt: new Date("2025-04-10"),
  },
  {
    id: "user-4",
    email: "marie.laurent@example.com",
    username: "marie.laurent",
    status: "PENDING",
    projectsCount: 0,
    followersCount: 0,
    joinedAt: new Date("2026-05-28"),
  },
  {
    id: "user-5",
    email: "jean.claude@example.com",
    username: "jean.claude",
    status: "SUSPENDED",
    projectsCount: 2,
    followersCount: 12,
    joinedAt: new Date("2025-06-20"),
  },
  {
    id: "user-6",
    email: "lisa.moreau@example.com",
    username: "lisa.moreau",
    status: "ACTIVE",
    projectsCount: 11,
    followersCount: 310,
    joinedAt: new Date("2025-01-05"),
  },
  {
    id: "user-7",
    email: "paul.bernard@example.com",
    username: "paul.bernard",
    status: "PENDING",
    projectsCount: 0,
    followersCount: 0,
    joinedAt: new Date("2026-05-30"),
  },
  {
    id: "user-8",
    email: "noemie.petit@example.com",
    username: "noemie.petit",
    status: "ACTIVE",
    projectsCount: 4,
    followersCount: 56,
    joinedAt: new Date("2025-09-12"),
  },
];

export const mockAdminProjects: AdminProject[] = [
  {
    id: "proj-1",
    name: "Portfolio 3D",
    description: "Un portfolio interactif en Three.js avec des animations 3D.",
    ownerUsername: "alice.dupont",
    membersCount: 4,
    highfiveCount: 89,
    createdAt: new Date("2025-03-10"),
    status: "active",
  },
  {
    id: "proj-2",
    name: "App Météo",
    description: "Application météo avec prévisions sur 7 jours et cartes.",
    ownerUsername: "sophie.martin",
    membersCount: 2,
    highfiveCount: 45,
    createdAt: new Date("2025-04-01"),
    status: "active",
  },
  {
    id: "proj-3",
    name: "Design System",
    description: "Bibliothèque de composants React réutilisables.",
    ownerUsername: "lisa.moreau",
    membersCount: 6,
    highfiveCount: 132,
    createdAt: new Date("2025-02-20"),
    status: "active",
  },
  {
    id: "proj-4",
    name: "CLI DevTools",
    description:
      "Outils en ligne de commande pour automatiser les tâches de dev.",
    ownerUsername: "thomas.dupont",
    membersCount: 1,
    highfiveCount: 18,
    createdAt: new Date("2025-07-15"),
    status: "archived",
  },
  {
    id: "proj-5",
    name: "Plateforme e-learning",
    description: "Cours en ligne avec système de progression et quiz.",
    ownerUsername: "noemie.petit",
    membersCount: 5,
    highfiveCount: 74,
    createdAt: new Date("2025-10-01"),
    status: "active",
  },
  {
    id: "proj-6",
    name: "Bot Discord",
    description:
      "Bot de modération et de divertissement pour serveurs Discord.",
    ownerUsername: "jean.claude",
    membersCount: 3,
    highfiveCount: 27,
    createdAt: new Date("2025-05-05"),
    status: "archived",
  },
];

export const mockAdminTenants: AdminTenant[] = [
  {
    id: "tenant-1",
    name: "Highfive HQ",
    domain: "highfive.app",
    usersCount: 312,
    projectsCount: 87,
    createdAt: new Date("2024-11-01"),
  },
  {
    id: "tenant-2",
    name: "École Numérique",
    domain: "ecole-numerique.fr",
    usersCount: 145,
    projectsCount: 42,
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "tenant-3",
    name: "Studio Créatif",
    domain: "studio-creatif.io",
    usersCount: 58,
    projectsCount: 19,
    createdAt: new Date("2025-04-22"),
  },
  {
    id: "tenant-4",
    name: "DevLab",
    domain: "devlab.tech",
    usersCount: 23,
    projectsCount: 8,
    createdAt: new Date("2025-09-03"),
  },
];

export const mockAdminStats: AdminStats = {
  totalUsers: 538,
  activeUsers: 481,
  pendingUsers: 39,
  suspendedUsers: 18,
  totalProjects: 156,
  activeProjects: 134,
  totalTenants: 4,
  newUsersThisWeek: 14,
  newProjectsThisWeek: 6,
  onlineUsers: 47,
};

// Daily registrations over the last 30 days
function generateDailyRegistrations(): DailyRegistration[] {
  const data: DailyRegistration[] = [];
  const base = new Date();
  base.setDate(base.getDate() - 29);
  const trend = [
    2, 1, 3, 2, 4, 3, 5, 2, 1, 3, 4, 6, 3, 2, 5, 4, 7, 5, 3, 4, 6, 5, 8, 4, 3,
    5, 6, 7, 5, 4,
  ];
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    data.push({
      date: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      inscriptions: trend[i],
    });
  }
  return data;
}

export const mockDailyRegistrations: DailyRegistration[] =
  generateDailyRegistrations();

export const mockRecentlyClosedProjects: RecentlyClosedProject[] = [
  {
    id: "proj-7",
    name: "Dashboard Analytics",
    ownerUsername: "alice.dupont",
    closedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    membersCount: 3,
    highfiveCount: 42,
  },
  {
    id: "proj-8",
    name: "API REST Node",
    ownerUsername: "thomas.dupont",
    closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    membersCount: 2,
    highfiveCount: 18,
  },
  {
    id: "proj-9",
    name: "Refonte UI Mobile",
    ownerUsername: "noemie.petit",
    closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    membersCount: 4,
    highfiveCount: 67,
  },
  {
    id: "proj-10",
    name: "Système de cache Redis",
    ownerUsername: "sophie.martin",
    closedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    membersCount: 2,
    highfiveCount: 29,
  },
  {
    id: "proj-11",
    name: "Extension Chrome",
    ownerUsername: "lisa.moreau",
    closedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    membersCount: 1,
    highfiveCount: 11,
  },
];
