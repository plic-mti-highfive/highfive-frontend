import type { User } from "../types/user";

// LEGACY: Ce fichier utilise l'ancien type `User` qui contient des données UI spécifiques
// (stats, projects embarqués, followers/following) qui ne correspondent pas au format backend.
// Ce fichier est uniquement utilisé par UserProfilePage.tsx et devrait être migré vers
// les mocks centralisés (src/api/services/mock/data/) une fois que le backend supportera
// les endpoints nécessaires pour récupérer ces données agrégées.
//
// Pour les nouveaux développements, utilisez les mocks centralisés :
// - src/api/services/mock/data/mockUsers.ts (format UserDto compatible backend)
// - src/api/services/mock/data/mockProjects.ts (format ProjectDto compatible backend)
// - src/api/services/mock/data/mockTags.ts (tags centralisés)

export const mockUsers: Record<string, User> = {
  Utilisateur: {
    username: "Utilisateur",
    displayName: "Utilisateur",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Utilisateur",
    bio: "Nouveau membre de la plateforme HighFive. Toujours à la recherche de nouveaux projets passionnants !",
    createdAt: "2024-03-20",
    tags: ["JavaScript", "React", "Débutant"],
    stats: {
      projectsCreated: 0,
      projectsContributed: 0,
      followers: 0,
      following: 0,
    },
    projects: {
      created: [],
      collaborations: [],
      liked: [],
    },
    followers: [],
    following: [],
  },
  johndoe: {
    username: "johndoe",
    displayName: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
    bio: "Designer passionné par les interfaces utilisateur et l'expérience utilisateur. J'adore créer des projets qui ont du sens.",
    createdAt: "2024-01-15",
    tags: ["Design UI/UX", "Figma", "React", "TypeScript", "Créatif"],
    stats: {
      projectsCreated: 12,
      projectsContributed: 34,
      followers: 245,
      following: 189,
    },
    projects: {
      created: [
        {
          id: "1",
          name: "PixelForge",
          description:
            "Éditeur graphique collaboratif en temps réel, open source et orienté pixel art et design UI.",
          tags: ["Open Source", "Design", "Web"],
          author: "johndoe",
          contributorsCount: 24,
          successRate: 87,
          daysLeft: null,
        },
        {
          id: "2",
          name: "DesignUI Kit",
          description:
            "Composants React réutilisables pour créer des interfaces magnifiques et accessibles.",
          tags: ["Web", "Design UI/UX", "React"],
          author: "johndoe",
          contributorsCount: 18,
          successRate: 95,
          daysLeft: 12,
        },
      ],
      collaborations: [
        {
          id: "3",
          name: "EcoTrack",
          description:
            "Une plateforme collaborative pour suivre et réduire son empreinte carbone au quotidien.",
          tags: ["Environnement", "Web", "Social"],
          author: "alex",
          contributorsCount: 31,
          successRate: 72,
          daysLeft: 5,
        },
      ],
      liked: [
        {
          id: "4",
          name: "OpenLibrary",
          description:
            "Un projet open source pour numériser et partager des livres rares.",
          tags: ["Open Source", "Data"],
          author: "sam",
          contributorsCount: 45,
          successRate: 100,
          daysLeft: null,
        },
        {
          id: "5",
          name: "MeshCity",
          description:
            "Réseau mesh décentralisé pour connecter les quartiers sans FAI traditionnel.",
          tags: ["Hardware", "Open Source", "Social"],
          author: "mike",
          contributorsCount: 12,
          successRate: 45,
          daysLeft: 8,
        },
      ],
    },
    followers: [
      {
        username: "janedoe",
        displayName: "Jane Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
      },
      {
        username: "mariedurand",
        displayName: "Marie Durand",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand",
      },
      {
        username: "alexsmith",
        displayName: "Alex Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith",
      },
    ],
    following: [
      {
        username: "janedoe",
        displayName: "Jane Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
      },
      {
        username: "alexsmith",
        displayName: "Alex Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith",
      },
    ],
  },
  janedoe: {
    username: "janedoe",
    displayName: "Jane Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
    bio: "Développeuse full-stack qui aime résoudre des problèmes complexes.",
    createdAt: "2023-11-20",
    tags: ["Python", "Django", "Node.js", "Docker", "Kubernetes", "DevOps"],
    stats: {
      projectsCreated: 8,
      projectsContributed: 56,
      followers: 412,
      following: 203,
    },
    projects: {
      created: [
        {
          id: "6",
          name: "DataCommons",
          description:
            "Entrepôt de datasets publics annotés par la communauté pour entraîner des modèles ML éthiques.",
          tags: ["Data", "IA / ML", "Open Source"],
          author: "janedoe",
          contributorsCount: 67,
          successRate: 92,
          daysLeft: null,
        },
        {
          id: "7",
          name: "HealthMesh",
          description:
            "Réseau de partage de données médicales anonymisées pour la recherche sur les maladies rares.",
          tags: ["Data", "Environnement", "Social"],
          author: "janedoe",
          contributorsCount: 22,
          successRate: 78,
          daysLeft: 15,
        },
      ],
      collaborations: [
        {
          id: "8",
          name: "CodeMentor",
          description:
            "Plateforme de mentorat technique peer-to-peer pour débutants en programmation.",
          tags: ["Éducation", "Web", "Open Source"],
          author: "chris",
          contributorsCount: 43,
          successRate: 85,
          daysLeft: 3,
        },
        {
          id: "9",
          name: "SoundWeave",
          description:
            "Plateforme de composition musicale collaborative où chaque utilisateur peut contribuer une piste.",
          tags: ["Art", "Web"],
          author: "alex",
          contributorsCount: 19,
          successRate: 68,
          daysLeft: 20,
        },
      ],
      liked: [
        {
          id: "10",
          name: "MicroGrid",
          description:
            "Logiciel de gestion d'énergie pour micro-réseaux solaires dans les zones rurales.",
          tags: ["Hardware", "Environnement", "Open Source"],
          author: "david",
          contributorsCount: 15,
          successRate: 55,
          daysLeft: 7,
        },
      ],
    },
    followers: [
      {
        username: "johndoe",
        displayName: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
      },
      {
        username: "mariedurand",
        displayName: "Marie Durand",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand",
      },
    ],
    following: [
      {
        username: "johndoe",
        displayName: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
      },
      {
        username: "mariedurand",
        displayName: "Marie Durand",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand",
      },
      {
        username: "alexsmith",
        displayName: "Alex Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith",
      },
    ],
  },
  alexsmith: {
    username: "alexsmith",
    displayName: "Alex Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith",
    bio: "Artiste digital et créatif. Toujours à la recherche de nouvelles inspirations.",
    createdAt: "2024-03-10",
    tags: ["Design UI/UX", "Figma", "Créatif", "Illustration"],
    stats: {
      projectsCreated: 5,
      projectsContributed: 18,
      followers: 98,
      following: 156,
    },
    projects: {
      created: [
        {
          id: "11",
          name: "ArtFlow",
          description:
            "Plateforme d'art numérique collaborative pour les illustrateurs et designers.",
          tags: ["Art", "Design UI/UX", "Web"],
          author: "alexsmith",
          contributorsCount: 28,
          successRate: 81,
          daysLeft: 10,
        },
      ],
      collaborations: [],
      liked: [
        {
          id: "12",
          name: "PixelForge",
          description:
            "Éditeur graphique collaboratif en temps réel, open source et orienté pixel art.",
          tags: ["Design", "Open Source", "Web"],
          author: "johndoe",
          contributorsCount: 24,
          successRate: 87,
          daysLeft: null,
        },
        {
          id: "13",
          name: "DesignUI Kit",
          description:
            "Composants React réutilisables pour créer des interfaces magnifiques.",
          tags: ["Web", "Design UI/UX", "React"],
          author: "johndoe",
          contributorsCount: 18,
          successRate: 95,
          daysLeft: 12,
        },
      ],
    },
    followers: [
      {
        username: "johndoe",
        displayName: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
      },
    ],
    following: [
      {
        username: "johndoe",
        displayName: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
      },
      {
        username: "janedoe",
        displayName: "Jane Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
      },
    ],
  },
  mariedurand: {
    username: "mariedurand",
    displayName: "Marie Durand",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand",
    bio: "Passionnée de data science et d'intelligence artificielle. J'aime partager mes connaissances et apprendre des autres.",
    createdAt: "2024-02-05",
    tags: [
      "Python",
      "Data Science",
      "Machine Learning",
      "TensorFlow",
      "Pédagogue",
    ],
    stats: {
      projectsCreated: 15,
      projectsContributed: 42,
      followers: 320,
      following: 156,
    },
    projects: {
      created: [
        {
          id: "14",
          name: "MLHub",
          description:
            "Plateforme centralisée pour partager, collaborer et déployer des modèles de machine learning.",
          tags: ["IA / ML", "Data", "Web"],
          author: "mariedurand",
          contributorsCount: 89,
          successRate: 94,
          daysLeft: null,
        },
        {
          id: "15",
          name: "DataVisualizer",
          description:
            "Outil interactif pour visualiser des datasets complexes en 3D et en temps réel.",
          tags: ["Data", "Web", "IA / ML"],
          author: "mariedurand",
          contributorsCount: 34,
          successRate: 88,
          daysLeft: 25,
        },
        {
          id: "16",
          name: "AIEthics",
          description:
            "Projet éducatif sur l'éthique de l'IA et les biais dans les modèles de machine learning.",
          tags: ["Éducation", "IA / ML", "Open Source"],
          author: "mariedurand",
          contributorsCount: 45,
          successRate: 91,
          daysLeft: 6,
        },
      ],
      collaborations: [
        {
          id: "17",
          name: "DataCommons",
          description:
            "Entrepôt de datasets publics annotés par la communauté.",
          tags: ["Data", "Open Source"],
          author: "janedoe",
          contributorsCount: 67,
          successRate: 92,
          daysLeft: null,
        },
      ],
      liked: [
        {
          id: "18",
          name: "OpenLibrary",
          description:
            "Un projet open source pour numériser et partager des livres rares.",
          tags: ["Open Source", "Data", "Éducation"],
          author: "sam",
          contributorsCount: 45,
          successRate: 100,
          daysLeft: null,
        },
      ],
    },
    followers: [
      {
        username: "johndoe",
        displayName: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe",
      },
      {
        username: "janedoe",
        displayName: "Jane Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
      },
    ],
    following: [
      {
        username: "janedoe",
        displayName: "Jane Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe",
      },
    ],
  },
};

// Fonction pour obtenir l'utilisateur actuellement connecté
export function getCurrentUsername(): string {
  return localStorage.getItem("username") ?? "Utilisateur";
}
