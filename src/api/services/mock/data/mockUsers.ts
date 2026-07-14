import type { UserDto } from "@/api/types";
import { UserStatus } from "@plic-mti-highfive/shared-types";

// Mock users - source de vérité unique pour tous les mocks d'utilisateurs
// Format: UserDto (compatible avec l'API backend)
// Profils variés avec différents niveaux de détail

export const mockUsers: Record<string, UserDto> = {
  "user-1": {
    id: "user-1",
    email: "sophie.martin@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-20T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
    profile: {
      bio: "Nouvelle sur la plateforme, j'adore les projets créatifs et la rencontre avec de nouvelles personnes !",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-2": {
    id: "user-2",
    email: "thomas.dubois@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    profile: {
      bio: "Photographe amateur passionné par les portraits et la vie urbaine. J'aime capturer l'authenticité des moments et des rencontres. Toujours partant pour de nouveaux projets photo collaboratifs et des expos de quartier. Le partage et l'entraide sont mes moteurs !",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-3": {
    id: "user-3",
    email: "marie.laurent@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2023-11-20T10:00:00Z",
    updatedAt: "2023-11-20T10:00:00Z",
    profile: {
      bio: "Professeure de yoga et grande amatrice de bien-être. Convaincue qu'ensemble on peut créer des choses merveilleuses pour notre communauté.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-4": {
    id: "user-4",
    email: "alex.rivera@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
    profile: {
      bio: "Artiste peintre et illustrateur. Je cherche toujours de nouveaux murs à peindre et des collaborations artistiques.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-5": {
    id: "user-5",
    email: "julie.bernard@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-05T10:00:00Z",
    profile: {
      bio: "Bénévole active dans plusieurs assos. Mon truc c'est l'action concrète et l'entraide.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=julie",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-6": {
    id: "user-6",
    email: "pierre.moreau@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    profile: {
      bio: "Jardinier urbain. Convaincu qu'on peut verdir nos villes et cultiver du lien social en même temps. Expertise en permaculture et compostage à partager.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=pierre",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-7": {
    id: "user-7",
    email: "camille.petit@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2023-12-15T10:00:00Z",
    profile: {
      bio: "Musicienne et prof de chant. J'organise des ateliers et j'adore les projets musicaux collectifs.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=camille",
      themePreference: "dark",
      emailNotifications: false,
    },
  },
  "user-8": {
    id: "user-8",
    email: "lucas.andre@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
    profile: {
      bio: null,
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucas",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-9": {
    id: "user-9",
    email: "emma.rousseau@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-05T10:00:00Z",
    updatedAt: "2024-03-05T10:00:00Z",
    profile: {
      bio: "Cuisinière passionnée qui aime transmettre les recettes de famille et découvrir de nouvelles saveurs du monde entier.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-10": {
    id: "user-10",
    email: "maxime.blanc@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    profile: {
      bio: "Réalisateur de documentaires indépendants. Intéressé par les histoires humaines et les initiatives locales. Toujours à la recherche de nouveaux sujets qui mettent en lumière les talents et les solidarités de proximité.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=maxime",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-11": {
    id: "user-11",
    email: "lea.simon@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2023-10-10T10:00:00Z",
    updatedAt: "2023-10-10T10:00:00Z",
    profile: {
      bio: "Fan de sport et de nature. J'organise des sorties rando et des événements sportifs.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=lea",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-12": {
    id: "user-12",
    email: "antoine.garcia@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-14T10:00:00Z",
    updatedAt: "2024-02-14T10:00:00Z",
    profile: {
      bio: "Développeur full-stack (React/Node.js) qui aime mettre mes compétences au service de projets à impact social. Contributeur open source et mentor pour débutants.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=antoine",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-13": {
    id: "user-13",
    email: "clara.martinez@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-30T10:00:00Z",
    updatedAt: "2024-03-30T10:00:00Z",
    profile: {
      bio: "Comédienne amateur cherchant à monter des projets théâtraux dans le quartier.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=clara",
      themePreference: "light",
      emailNotifications: false,
    },
  },
  "user-14": {
    id: "user-14",
    email: "hugo.lefevre@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    profile: {
      bio: "Bricoleur et adepte du DIY. Si ça peut se réparer, je vais essayer !",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=hugo",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-15": {
    id: "user-15",
    email: "sarah.fontaine@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-04-02T10:00:00Z",
    updatedAt: "2024-04-02T10:00:00Z",
    profile: {
      bio: "Étudiante en environnement et militante écolo. Motivée pour agir localement.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-16": {
    id: "user-16",
    email: "nicolas.roux@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2023-09-22T10:00:00Z",
    updatedAt: "2023-09-22T10:00:00Z",
    profile: {
      bio: "Passionné de jeux de société. J'en ai des centaines et j'adore les partager.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=nicolas",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-17": {
    id: "user-17",
    email: "amelie.girard@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-22T10:00:00Z",
    updatedAt: "2024-03-22T10:00:00Z",
    profile: {
      bio: null,
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=amelie",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-18": {
    id: "user-18",
    email: "julien.vincent@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-08T10:00:00Z",
    updatedAt: "2024-02-08T10:00:00Z",
    profile: {
      bio: "Bibliothécaire et amoureux des livres. J'organise des clubs de lecture et des ateliers d'écriture pour tous âges.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=julien",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-19": {
    id: "user-19",
    email: "laura.michel@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-16T10:00:00Z",
    updatedAt: "2024-03-16T10:00:00Z",
    profile: {
      bio: "Coach sportif bénévole. Le sport pour tous, peu importe le niveau !",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-20": {
    id: "user-20",
    email: "raphael.clement@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-29T10:00:00Z",
    updatedAt: "2024-01-29T10:00:00Z",
    profile: {
      bio: "Apiculteur amateur. Je partage ma passion pour les abeilles et la biodiversité urbaine.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=raphael",
      themePreference: "light",
      emailNotifications: false,
    },
  },
  "user-21": {
    id: "user-21",
    email: "alice.dubois@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-11T10:00:00Z",
    updatedAt: "2024-03-11T10:00:00Z",
    profile: {
      bio: "Data scientist passionnée par le ML et l'analyse de données. Je cherche des projets où la tech peut aider la société.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=alicedubois",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-22": {
    id: "user-22",
    email: "kevin.moreau@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-19T10:00:00Z",
    updatedAt: "2024-02-19T10:00:00Z",
    profile: {
      bio: "Maker et passionné d'électronique. Arduino, ESP32, Raspberry Pi... Si ça clignote, je suis dedans !",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=kevin",
      themePreference: "dark",
      emailNotifications: true,
    },
  },
  "user-23": {
    id: "user-23",
    email: "nadia.farah@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-01-07T10:00:00Z",
    updatedAt: "2024-01-07T10:00:00Z",
    profile: {
      bio: "Designeuse UI/UX qui adore créer des interfaces accessibles et inclusives. Figma addict.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=nadia",
      themePreference: "light",
      emailNotifications: true,
    },
  },
  "user-24": {
    id: "user-24",
    email: "martin.lopez@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-03-27T10:00:00Z",
    updatedAt: "2024-03-27T10:00:00Z",
    profile: {
      bio: "Étudiant en cybersécurité. Intéressé par la protection des données et la sensibilisation aux bonnes pratiques numériques.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=martin",
      themePreference: "dark",
      emailNotifications: false,
    },
  },
  "user-25": {
    id: "user-25",
    email: "sofia.bernard@mail.com",
    status: UserStatus.ACTIVE,
    tenantId: "default-tenant",
    createdAt: "2024-02-26T10:00:00Z",
    updatedAt: "2024-02-26T10:00:00Z",
    profile: {
      bio: "Dev mobile iOS/Android. J'aime créer des apps qui simplifient la vie.",
      avatarPath: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia",
      themePreference: "light",
      emailNotifications: true,
    },
  },
};

// Helper pour obtenir un utilisateur par email
export function getUserByEmail(email: string): UserDto | undefined {
  return Object.values(mockUsers).find((user) => user.email === email);
}

// Helper pour obtenir tous les utilisateurs
export function getAllUsers(): UserDto[] {
  return Object.values(mockUsers);
}

// Helper pour obtenir un utilisateur par ID
export function getUserById(id: string): UserDto | undefined {
  return mockUsers[id];
}
