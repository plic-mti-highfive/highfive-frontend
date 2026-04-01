import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, UserPlus, PackageOpen } from 'lucide-react'
import { Header } from '@features/layout'
import { Footer } from '@features/layout'
import { UserNotFound } from '../components/UserNotFound'
import { UserActionsMenu } from '../components/UserActionsMenu'
import { EditProfileModal } from '../components/EditProfileModal'
import { Button } from '@shared/components/ui/button'
import { ProfileTabs, EmptyState, ProjectCard } from '../components/ProfileTabs'
import { createProjectsTabs } from '../utils/profileTabsUtils'
import { ProjectFiltersBar } from '../../projects/components/ProjectFilters'
import { UsersListDialog } from '../components/UsersListDialog'
import { UnfollowConfirmDialog } from '../components/UnfollowConfirmDialog'
import { mockUsers, getCurrentUsername } from '@shared/data/mockUsers'
import { getTagColor } from '@shared/utils/tagColors'
import type { UserProfileFormData } from '@shared/types/user'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long'
  })
}

function StatItem({
  value,
  label,
  onClick,
}: {
  value: number
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        onClick ? 'hover:text-ink-muted cursor-pointer' : ''
      }`}
      disabled={!onClick}
    >
      <span className="text-2xl font-heading font-bold text-ink">{value}</span>
      <span className="text-xs text-ink-muted text-center">{label}</span>
    </button>
  )
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  const user = username ? mockUsers[username] : null
  const isOwnProfile = username === getCurrentUsername()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
  const [unfollowConfirmOpen, setUnfollowConfirmOpen] = useState(false)

  const handleSaveProfile = (data: UserProfileFormData) => {
    console.log('Saving profile:', data)
    // Ici on mettrait à jour les données de l'utilisateur
  }

  const handleShare = () => {
    console.log('Partager le profil')
  }

  const handleFollow = () => {
    setFollowing(!following)
    console.log(following ? 'Unfollow' : 'Follow')
  }

  const handleMessage = () => {
    console.log('Envoyer un message')
  }

  if (!user) {
    return (
      <>
        <Header />
        <UserNotFound />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream">
        <div className="flex flex-col lg:flex-row">
          {/* Pan gauche - Profil */}
          <aside className="lg:w-1/3 lg:min-h-screen">
            <div className="bg-white border-r border-cream-mid lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
                {/* Bande horizontale en haut - Avatar + Infos + Menu */}
                <div className="flex items-center gap-4 p-6 border-b border-cream-mid">
                  {/* Avatar à gauche */}
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-24 h-24 rounded-3xl object-cover bg-cream-dark flex-shrink-0"
                  />

                  {/* Infos au centre */}
                  <div className="flex-1">
                    <h1 className="text-xl font-heading font-bold text-ink">
                      {user.displayName}
                    </h1>
                    <p className="text-body-md text-ink-muted">@{user.username}</p>
                    <p className="text-sm text-ink-muted mt-1">
                      Membre depuis {formatDate(user.createdAt)}
                    </p>
                  </div>

                  {/* Menu 3 points à droite */}
                  <UserActionsMenu
                    isOwnProfile={isOwnProfile}
                    onShare={handleShare}
                    onEdit={() => setEditModalOpen(true)}
                  />
                </div>

                {/* Contenu principal du profil */}
                <div className="p-6 space-y-6">

                  {/* Statistiques */}
                  <div className="grid grid-cols-4 gap-2 pb-6 border-b border-cream-mid">
                    <StatItem
                      value={user.stats.projectsCreated}
                      label="Projets"
                    />
                    <StatItem
                      value={user.stats.projectsContributed}
                      label="Contributions"
                    />
                    <StatItem
                      value={user.stats.followers}
                      label="Abonnés"
                      onClick={() => setFollowersDialogOpen(true)}
                    />
                    <StatItem
                      value={user.stats.following}
                      label="Abonnements"
                      onClick={() => setFollowingDialogOpen(true)}
                    />
                  </div>

                  {/* Biographie */}
                  {user.bio && (
                    <p className="text-body-md text-ink text-center leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  {/* Tags */}
                  {user.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag) => {
                        const colors = getTagColor(tag)
                        return (
                          <span
                            key={tag}
                            className={`
                              px-3 py-1.5 rounded-full text-xs font-semibold
                              border ${colors.bg} ${colors.text} ${colors.border}
                            `}
                          >
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  {!isOwnProfile && (
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => {
                          if (following) {
                            setUnfollowConfirmOpen(true)
                          } else {
                            handleFollow()
                          }
                        }}
                        className="w-full"
                        size="lg"
                        variant={following ? "outline" : "default"}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {following ? 'Abonné' : 'Suivre'}
                      </Button>
                      <Button
                        onClick={handleMessage}
                        className="w-full"
                        size="lg"
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Envoyer un message
                      </Button>
                    </div>
                  )}
                </div>
            </div>
          </aside>

          {/* Pan droit - Contenu */}
          <section className="flex-1 lg:w-2/3 bg-ink-soft/5">
            <div className="px-8 pt-0 pb-8">
              <ProfileTabs
                tabs={createProjectsTabs({
                  createdProjects:
                    user.projects.created.length > 0 ? (
                      <div>
                        <ProjectFiltersBar />
                        <div className="grid grid-cols-2 gap-4">
                          {user.projects.created.map((project) => (
                            <ProjectCard
                              key={project.id}
                              name={project.name}
                              description={project.description}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<PackageOpen className="w-8 h-8 text-ink-muted" />}
                        title="Aucun projet créé"
                        description={
                          isOwnProfile
                            ? "Vous n'avez pas encore créé de projet. Commencez à créer quelque chose !"
                            : `${user.displayName} n'a pas encore créé de projet.`
                        }
                      />
                    ),
                  collaborations:
                    user.projects.collaborations.length > 0 ? (
                      <div>
                        <ProjectFiltersBar />
                        <div className="grid grid-cols-2 gap-4">
                          {user.projects.collaborations.map((project) => (
                            <ProjectCard
                              key={project.id}
                              name={project.name}
                              description={project.description}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<PackageOpen className="w-8 h-8 text-ink-muted" />}
                        title="Aucune collaboration"
                        description={
                          isOwnProfile
                            ? "Vous n'avez pas encore collaboré sur des projets."
                            : `${user.displayName} n'a pas encore collaboré sur des projets.`
                        }
                      />
                    ),
                  likedProjects:
                    user.projects.liked.length > 0 ? (
                      <div>
                        <ProjectFiltersBar />
                        <div className="grid grid-cols-2 gap-4">
                          {user.projects.liked.map((project) => (
                            <ProjectCard
                              key={project.id}
                              name={project.name}
                              description={project.description}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        icon={<PackageOpen className="w-8 h-8 text-ink-muted" />}
                        title="Aucun High Five"
                        description={
                          isOwnProfile
                            ? "Vous n'avez pas encore liké de projets."
                            : `${user.displayName} n'a pas encore liké de projets.`
                        }
                      />
                    ),
                })}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {isOwnProfile && (
        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          user={user}
          onSave={handleSaveProfile}
        />
      )}

      <UsersListDialog
        open={followersDialogOpen}
        onOpenChange={setFollowersDialogOpen}
        title="Abonnés"
        users={user.followers}
      />

      <UsersListDialog
        open={followingDialogOpen}
        onOpenChange={setFollowingDialogOpen}
        title="Abonnements"
        users={user.following}
      />

      <UnfollowConfirmDialog
        open={unfollowConfirmOpen}
        onOpenChange={setUnfollowConfirmOpen}
        displayName={user.displayName}
        onConfirm={handleFollow}
      />
    </>
  )
}
