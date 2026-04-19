import type { Project } from '@shared/types'

const ALL_PROJECTS: Project[] = [
  { id: 1,  name: "EcoTrack",     description: "Plateforme collaborative pour suivre et réduire son empreinte carbone au quotidien, avec des défis communautaires.",       tags: ['Environnement', 'Web'],      author: "alice",  contributorsCount: 142, successRate: 100, daysLeft: 5   },
  { id: 2,  name: "OpenLibrary",  description: "Numériser et partager des livres rares dans une bibliothèque accessible à tous, partout dans le monde.",                   tags: ['Open Source', 'Éducation'],  author: "bob",    contributorsCount: 89,  successRate: 87,  daysLeft: 12  },
  { id: 3,  name: "MeshCity",     description: "Réseau mesh décentralisé pour connecter les quartiers sans FAI traditionnel. Conçu pour les zones peu couvertes.",         tags: ['Hardware', 'Social'],        author: "carol",  contributorsCount: 211, successRate: 100, daysLeft: null},
  { id: 4,  name: "CropSense",    description: "Capteurs IoT open hardware pour optimiser l'irrigation dans les petites exploitations agricoles.",                          tags: ['Hardware', 'Environnement'], author: "dave",   contributorsCount: 67,  successRate: 62,  daysLeft: 21  },
  { id: 5,  name: "LangBridge",   description: "Application de traduction communautaire pour les langues rares non couvertes par les outils grand public.",                 tags: ['Web', 'Social'],             author: "eve",    contributorsCount: 178, successRate: 100, daysLeft: 3   },
  { id: 6,  name: "PixelForge",   description: "Éditeur graphique collaboratif en temps réel orienté pixel art et design UI. Fonctionne entièrement dans le navigateur.",  tags: ['Open Source', 'Art'],        author: "frank",  contributorsCount: 304, successRate: 100, daysLeft: null},
  { id: 7,  name: "DataCommons",  description: "Entrepôt de datasets publics annotés par la communauté pour entraîner des modèles ML éthiques.",                           tags: ['Data', 'IA / ML'],           author: "grace",  contributorsCount: 95,  successRate: 78,  daysLeft: 18  },
  { id: 8,  name: "SoundWeave",   description: "Plateforme de composition musicale collaborative où chaque utilisateur peut contribuer une piste.",                         tags: ['Web', 'Art'],                author: "heidi",  contributorsCount: 263, successRate: 100, daysLeft: null},
  { id: 9,  name: "MicroGrid",    description: "Logiciel de gestion d'énergie pour micro-réseaux solaires dans les zones rurales.",                                        tags: ['Hardware', 'Environnement'], author: "ivan",   contributorsCount: 44,  successRate: 31,  daysLeft: 30  },
  { id: 10, name: "AgroBot",      description: "Robot agricole open source contrôlable à distance pour les petites surfaces cultivées en agriculture biologique.",          tags: ['Open Source', 'Hardware'],   author: "judy",   contributorsCount: 127, successRate: 100, daysLeft: 7   },
  { id: 11, name: "VoxPoll",      description: "Outil de sondage décentralisé sur la blockchain pour des consultations publiques fiables.",                                 tags: ['Web', 'Social'],             author: "karl",   contributorsCount: 57,  successRate: 49,  daysLeft: 14  },
  { id: 12, name: "HealthMesh",   description: "Réseau de partage de données médicales anonymisées pour la recherche sur les maladies rares.",                             tags: ['Data', 'Social'],            author: "lara",   contributorsCount: 88,  successRate: 71,  daysLeft: 25  },
  { id: 13, name: "TerraMind",    description: "Jeu de stratégie éducatif sur la gestion environnementale développé par la communauté.",                                   tags: ['Éducation', 'Open Source'],  author: "max",    contributorsCount: 193, successRate: 100, daysLeft: null},
  { id: 14, name: "CodeMentor",   description: "Mentorat technique peer-to-peer pour débutants en programmation dans les pays en développement.",                           tags: ['Éducation', 'Social'],       author: "nina",   contributorsCount: 72,  successRate: 58,  daysLeft: 9   },
  { id: 15, name: "WasteMap",     description: "Cartographie collaborative des dépôts sauvages et points de collecte alternatifs dans les villes.",                        tags: ['Environnement', 'Web'],      author: "omar",   contributorsCount: 136, successRate: 100, daysLeft: 2   },
  { id: 16, name: "NeuralSketch", description: "Génération d'esquisses assistée par IA pour designers industriels, intégrable dans Figma.",                                tags: ['IA / ML', 'Art'],            author: "petra",  contributorsCount: 241, successRate: 100, daysLeft: null},
]

export const FEATURED    = ALL_PROJECTS.find(p => p.id === 6)!
export const RECOMMENDED = ALL_PROJECTS.filter(p => [1, 7, 16, 5].includes(Number(p.id)))
export const TRENDING    = ALL_PROJECTS.filter(p => [15, 10, 3, 14].includes(Number(p.id)))
export const SUCCESSFUL  = ALL_PROJECTS.filter(p => p.successRate >= 100 && p.daysLeft === null)
export const RECENT      = ALL_PROJECTS.filter(p => [9, 11, 4, 12].includes(Number(p.id)))
export const ENDING_SOON = ALL_PROJECTS.filter(p => p.daysLeft !== null && p.daysLeft <= 7)
