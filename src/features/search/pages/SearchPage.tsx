import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FolderOpen, Users } from 'lucide-react'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { SmallCard } from '@shared/components/projects'
import { ProjectFiltersBar } from '@features/projects/components/ProjectFilters'
import { mockUsers } from '@shared/data/mockUsers'
import type { Project } from '@shared/types'
import type { User } from '@shared/types/user'

// Données mockées pour le MVP
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'EcoTrack',
    description: 'Application mobile pour suivre et réduire son empreinte carbone au quotidien',
    tags: ['Mobile', 'Environnement', 'Open Source'],
    author: 'Marie Dupont',
    contributorsCount: 12,
    successRate: 75,
    daysLeft: 15,
  },
  {
    id: 2,
    name: 'HealthAI',
    description: 'Assistant IA pour le suivi personnalisé de santé et bien-être',
    tags: ['IA / ML', 'Santé', 'Web'],
    author: 'Jean Martin',
    contributorsCount: 8,
    successRate: 88,
    daysLeft: 22,
  },
  {
    id: 3,
    name: 'CodeMentor',
    description: 'Plateforme de mentorat pour développeurs débutants',
    tags: ['Web', 'Éducation', 'Social'],
    author: 'Sophie Bernard',
    contributorsCount: 15,
    successRate: 92,
    daysLeft: 10,
  },
  {
    id: 4,
    name: 'ArtGen',
    description: 'Générateur d\'art numérique basé sur l\'IA',
    tags: ['IA / ML', 'Art', 'Design'],
    author: 'Lucas Petit',
    contributorsCount: 6,
    successRate: 65,
    daysLeft: 30,
  },
  {
    id: 5,
    name: 'FarmBot',
    description: 'Robot autonome pour l\'agriculture de précision',
    tags: ['Robotique', 'Agriculture', 'IoT'],
    author: 'Claire Moreau',
    contributorsCount: 20,
    successRate: 78,
    daysLeft: null,
  },
  {
    id: 6,
    name: 'SecureChain',
    description: 'Solution blockchain pour la traçabilité alimentaire',
    tags: ['Blockchain', 'Sécurité', 'Logistique'],
    author: 'Thomas Roux',
    contributorsCount: 10,
    successRate: 82,
    daysLeft: 18,
  },
  {
    id: 7,
    name: 'GameLearn',
    description: 'Jeu éducatif pour apprendre les mathématiques',
    tags: ['Jeu', 'Éducation', 'Mobile'],
    author: 'Emma Lefebvre',
    contributorsCount: 5,
    successRate: 70,
    daysLeft: 25,
  },
  {
    id: 8,
    name: 'GreenEnergy',
    description: 'Système de gestion intelligente pour panneaux solaires',
    tags: ['Énergie', 'IoT', 'Environnement'],
    author: 'Pierre Dubois',
    contributorsCount: 14,
    successRate: 85,
    daysLeft: 12,
  },
  {
    id: 9,
    name: 'MusicFlow',
    description: 'Éditeur de musique collaboratif en temps réel',
    tags: ['Musique', 'Web', 'Social'],
    author: 'Julie Garcia',
    contributorsCount: 9,
    successRate: 76,
    daysLeft: null,
  },
  {
    id: 10,
    name: 'DataViz Pro',
    description: 'Outil de visualisation de données interactives',
    tags: ['Data', 'Design', 'Web'],
    author: 'Alexandre Leroy',
    contributorsCount: 11,
    successRate: 89,
    daysLeft: 20,
  },
  {
    id: 11,
    name: 'SportTracker',
    description: 'Application de suivi d\'entraînement sportif',
    tags: ['Sport', 'Mobile', 'Santé'],
    author: 'Camille Simon',
    contributorsCount: 7,
    successRate: 72,
    daysLeft: 8,
  },
  {
    id: 12,
    name: 'LegalAI',
    description: 'Assistant juridique basé sur l\'intelligence artificielle',
    tags: ['IA / ML', 'Juridique', 'Web'],
    author: 'Nicolas Laurent',
    contributorsCount: 13,
    successRate: 80,
    daysLeft: 16,
  },
]

// Composant pour afficher une carte utilisateur
function UserCard({ user, navigate }: { user: User; navigate: (to: string) => void }) {
  return (
    <button
      onClick={() => navigate(`/user/${user.username}`)}
      className="group flex flex-col bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:border-foreground/20 cursor-pointer text-left w-full"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-20 h-20 rounded-full mb-4 object-cover"
        />
        <h3 className="text-heading-sm font-bold text-foreground mb-1 truncate w-full">
          {user.displayName}
        </h3>
        <p className="text-body-sm text-muted-foreground mb-3 truncate w-full">
          @{user.username}
        </p>
        {user.bio && (
          <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
            {user.bio}
          </p>
        )}
        <div className="flex gap-4 mt-auto pt-3 text-body-sm text-muted-foreground">
          <span>{user.stats.projectsCreated} projets</span>
          <span>·</span>
          <span>{user.stats.followers} abonnés</span>
        </div>
      </div>
    </button>
  )
}

type ResultType = 'projects' | 'users'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const searchQuery = searchParams.get('q') || ''
  const tagFilter = searchParams.get('tag')

  // Déterminer le type de résultat à partir de la route
  const resultType: ResultType = location.pathname.includes('/users') ? 'users' : 'projects'

  const [, setActiveSort] = useState<'name' | 'date' | 'popularity'>('date')
  const [, setActiveFilters] = useState<string[]>([])

  // Pour le MVP, on affiche tous les projets mockés
  // La logique de recherche et filtrage sera implémentée plus tard
  const displayedProjects = MOCK_PROJECTS
  const displayedUsers = Object.values(mockUsers)

  const resultsCount = resultType === 'projects' ? displayedProjects.length : displayedUsers.length
  const resultsLabel = resultType === 'projects' ? 'projet' : 'utilisateur'

  const handleTypeChange = (type: ResultType) => {
    const currentParams = searchParams.toString()
    const path = type === 'projects' ? '/search/projects' : '/search/users'
    navigate(currentParams ? `${path}?${currentParams}` : path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        {/* Titre centré avec la recherche */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Résultats pour : <span className="text-muted-foreground">{tagFilter || searchQuery}</span>
          </h1>
          <p className="mt-3 text-body-lg text-muted-foreground">
            {resultsCount} {resultsLabel}{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre avec boutons de type et filtres */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {/* Boutons de type de résultat */}
          <div className="flex gap-3">
            <button
              onClick={() => handleTypeChange('projects')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${resultType === 'projects'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
            >
              <FolderOpen size={18} />
              Projets
            </button>
            <button
              onClick={() => handleTypeChange('users')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${resultType === 'users'
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
            >
              <Users size={18} />
              Utilisateurs
            </button>
          </div>

          {/* Filtres - uniquement pour les projets */}
          {resultType === 'projects' && (
            <ProjectFiltersBar
              onSortChange={(sort) => setActiveSort(sort)}
              onFilterChange={(filters) => setActiveFilters(filters)}
            />
          )}
        </div>

        {/* Grille de résultats */}
        {resultType === 'projects' ? (
          displayedProjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
              {displayedProjects.map((project) => (
                <SmallCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                Aucun projet trouvé pour "{searchQuery}"
              </p>
              <p className="mt-2 text-body-md text-muted-foreground">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )
        ) : (
          displayedUsers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
              {displayedUsers.map((user) => (
                <UserCard key={user.username} user={user} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                Aucun utilisateur trouvé pour "{searchQuery}"
              </p>
              <p className="mt-2 text-body-md text-muted-foreground">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  )
}
