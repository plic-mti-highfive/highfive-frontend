import type { LegacyNotification } from "../../interfaces/messaging.service.interface";

export const mockNotifications: LegacyNotification[] = [
  {
    id: "notif-1",
    type: "like",
    read: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
    actor: { id: "user-2", name: "Sophie Martin" },
    target: { type: "project", id: "proj-1", label: "Portfolio 3D" },
  },
  {
    id: "notif-2",
    type: "comment",
    read: false,
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    actor: { id: "user-3", name: "Thomas Dupont" },
    target: { type: "project", id: "proj-2", label: "App Météo" },
    excerpt: "Super travail sur l'interface !",
  },
  {
    id: "notif-3",
    type: "follow",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    actor: { id: "user-4", name: "Marie Laurent" },
  },
  {
    id: "notif-4",
    type: "mention",
    read: true,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
    actor: { id: "user-5", name: "Jean Claude" },
    target: { type: "project", id: "proj-3", label: "Design System" },
    excerpt: "@moi regarde cette section",
  },
  {
    id: "notif-5",
    type: "like",
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actor: { id: "user-6", name: "Lisa Moreau" },
    target: { type: "project", id: "proj-1", label: "Portfolio 3D" },
  },
  {
    id: "notif-6",
    type: "comment",
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    actor: { id: "user-2", name: "Sophie Martin" },
    target: { type: "project", id: "proj-2", label: "App Météo" },
    excerpt: "Tu peux préciser la librairie utilisée ?",
  },
  {
    id: "notif-7",
    type: "follow",
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    actor: { id: "user-3", name: "Thomas Dupont" },
  },
  {
    id: "notif-8",
    type: "like",
    read: true,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    actor: { id: "user-4", name: "Marie Laurent" },
    target: { type: "project", id: "proj-3", label: "Design System" },
  },
];
