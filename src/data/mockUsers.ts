import type { User } from '../types/user'

export const mockUsers: Record<string, User> = {
  Utilisateur: {
    username: 'Utilisateur',
    displayName: 'Utilisateur',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Utilisateur',
    bio: 'Nouveau membre de la plateforme HighFive. Toujours à la recherche de nouveaux projets passionnants !',
    createdAt: '2024-03-20',
    tags: ['JavaScript', 'React', 'Débutant'],
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
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
    bio: 'Designer passionné par les interfaces utilisateur et l\'expérience utilisateur. J\'adore créer des projets qui ont du sens.',
    createdAt: '2024-01-15',
    tags: ['Design UI/UX', 'Figma', 'React', 'TypeScript', 'Créatif'],
    stats: {
      projectsCreated: 12,
      projectsContributed: 34,
      followers: 245,
      following: 189,
    },
    projects: {
      created: [
        { id: '1', name: 'PixelForge', description: 'Éditeur graphique collaboratif en temps réel, open source et orienté pixel art et design UI.' },
        { id: '2', name: 'DesignUI Kit', description: 'Composants React réutilisables pour créer des interfaces magnifiques et accessibles.' },
      ],
      collaborations: [
        { id: '3', name: 'EcoTrack', description: 'Une plateforme collaborative pour suivre et réduire son empreinte carbone au quotidien.' },
      ],
      liked: [
        { id: '4', name: 'OpenLibrary', description: 'Un projet open source pour numériser et partager des livres rares.' },
        { id: '5', name: 'MeshCity', description: 'Réseau mesh décentralisé pour connecter les quartiers sans FAI traditionnel.' },
      ],
    },
    followers: [
      { username: 'janedoe', displayName: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe' },
      { username: 'mariedurand', displayName: 'Marie Durand', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand' },
      { username: 'alexsmith', displayName: 'Alex Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith' },
    ],
    following: [
      { username: 'janedoe', displayName: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe' },
      { username: 'alexsmith', displayName: 'Alex Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith' },
    ],
  },
  janedoe: {
    username: 'janedoe',
    displayName: 'Jane Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe',
    bio: 'Développeuse full-stack qui aime résoudre des problèmes complexes.',
    createdAt: '2023-11-20',
    tags: ['Python', 'Django', 'Node.js', 'Docker', 'Kubernetes', 'DevOps'],
    stats: {
      projectsCreated: 8,
      projectsContributed: 56,
      followers: 412,
      following: 203,
    },
    projects: {
      created: [
        { id: '6', name: 'DataCommons', description: 'Entrepôt de datasets publics annotés par la communauté pour entraîner des modèles ML éthiques.' },
        { id: '7', name: 'HealthMesh', description: 'Réseau de partage de données médicales anonymisées pour la recherche sur les maladies rares.' },
      ],
      collaborations: [
        { id: '8', name: 'CodeMentor', description: 'Plateforme de mentorat technique peer-to-peer pour débutants en programmation.' },
        { id: '9', name: 'SoundWeave', description: 'Plateforme de composition musicale collaborative où chaque utilisateur peut contribuer une piste.' },
      ],
      liked: [
        { id: '10', name: 'MicroGrid', description: 'Logiciel de gestion d\'énergie pour micro-réseaux solaires dans les zones rurales.' },
      ],
    },
    followers: [
      { username: 'johndoe', displayName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
      { username: 'mariedurand', displayName: 'Marie Durand', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand' },
    ],
    following: [
      { username: 'johndoe', displayName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
      { username: 'mariedurand', displayName: 'Marie Durand', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand' },
      { username: 'alexsmith', displayName: 'Alex Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith' },
    ],
  },
  alexsmith: {
    username: 'alexsmith',
    displayName: 'Alex Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexsmith',
    bio: 'Artiste digital et créatif. Toujours à la recherche de nouvelles inspirations.',
    createdAt: '2024-03-10',
    tags: ['Design UI/UX', 'Figma', 'Créatif', 'Illustration'],
    stats: {
      projectsCreated: 5,
      projectsContributed: 18,
      followers: 98,
      following: 156,
    },
    projects: {
      created: [
        { id: '11', name: 'ArtFlow', description: 'Plateforme d\'art numérique collaborative pour les illustrateurs et designers.' },
      ],
      collaborations: [],
      liked: [
        { id: '12', name: 'PixelForge', description: 'Éditeur graphique collaboratif en temps réel, open source et orienté pixel art.' },
        { id: '13', name: 'DesignUI Kit', description: 'Composants React réutilisables pour créer des interfaces magnifiques.' },
      ],
    },
    followers: [
      { username: 'johndoe', displayName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
    ],
    following: [
      { username: 'johndoe', displayName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
      { username: 'janedoe', displayName: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe' },
    ],
  },
  mariedurand: {
    username: 'mariedurand',
    displayName: 'Marie Durand',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariedurand',
    bio: 'Passionnée de data science et d\'intelligence artificielle. J\'aime partager mes connaissances et apprendre des autres.',
    createdAt: '2024-02-05',
    tags: ['Python', 'Data Science', 'Machine Learning', 'TensorFlow', 'Pédagogue'],
    stats: {
      projectsCreated: 15,
      projectsContributed: 42,
      followers: 320,
      following: 156,
    },
    projects: {
      created: [
        { id: '14', name: 'MLHub', description: 'Plateforme centralisée pour partager, collaborer et déployer des modèles de machine learning.' },
        { id: '15', name: 'DataVisualizer', description: 'Outil interactif pour visualiser des datasets complexes en 3D et en temps réel.' },
        { id: '16', name: 'AIEthics', description: 'Projet éducatif sur l\'éthique de l\'IA et les biais dans les modèles de machine learning.' },
      ],
      collaborations: [
        { id: '17', name: 'DataCommons', description: 'Entrepôt de datasets publics annotés par la communauté.' },
      ],
      liked: [
        { id: '18', name: 'OpenLibrary', description: 'Un projet open source pour numériser et partager des livres rares.' },
      ],
    },
    followers: [
      { username: 'johndoe', displayName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe' },
      { username: 'janedoe', displayName: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe' },
    ],
    following: [
      { username: 'janedoe', displayName: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=janedoe' },
    ],
  },
}

// Fonction pour obtenir l'utilisateur actuellement connecté
export function getCurrentUsername(): string {
  return localStorage.getItem('username') ?? 'Utilisateur'
}
