import { Hand, Bookmark, Share2, Flag } from 'lucide-react'
import { Thumbnail } from '@shared/components/projects/shared/Thumbnail'
import { DropdownMenu } from '@shared/components/DropdownMenu'
import type { ProjectDto } from '@/api/types'
import { ProjectStatus } from '@plic-mti-highfive/shared-types'

interface ProjectHeroProps {
  project: ProjectDto
  memberCount: number
  creator?: { email: string; avatar?: string }
  highfiveCount?: number
  onJoinClick?: () => void
  onHighfiveClick?: () => void
}

export function ProjectHero({ project, memberCount, creator, highfiveCount = 0, onJoinClick, onHighfiveClick }: ProjectHeroProps) {
  const creatorName = creator?.email.split('@')[0] || 'Créateur inconnu'
  return (
    <div className="bg-background">
      <div className="relative h-80 sm:h-96 overflow-hidden border-b border-border">
        <Thumbnail
          id={project.id}
          name={project.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />

        {/* Top: Titre, Créateur + Menu */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-10">
          <div className="max-w-[1400px] mx-auto flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                {project.name}
              </h1>
              {/* Créateur */}
              {creator && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ring-1 ring-black/10"
                    style={{
                      background: creator.avatar
                        ? `url(${creator.avatar}) center/cover`
                        : `hsl(${(creatorName.charCodeAt(0) * 37) % 360} 45% 80%)`,
                      color: creator.avatar ? 'transparent' : `hsl(${(creatorName.charCodeAt(0) * 37) % 360} 45% 30%)`,
                    }}
                  >
                    {!creator.avatar && creatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Créateur</p>
                    <p className="text-sm font-medium text-foreground">{creatorName}</p>
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu
              triggerSize="md"
              iconSize={20}
              offset={8}
              items={[
                {
                  icon: <Bookmark size={16} className="text-muted-foreground" />,
                  label: 'Enregistrer',
                  onClick: () => console.log('Enregistrer'),
                },
                {
                  icon: <Share2 size={16} className="text-muted-foreground" />,
                  label: 'Partager',
                  onClick: () => console.log('Partager'),
                },
                {
                  icon: <Flag size={16} className="text-muted-foreground" />,
                  label: 'Signaler',
                  onClick: () => console.log('Signaler'),
                },
              ]}
            />
          </div>
        </div>

        {/* Bottom: Stats + Boutons */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

            {/* Stats et boutons en ligne */}
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Hand size={20} className="text-muted-foreground" />
                  <span className="text-lg font-semibold text-foreground">{highfiveCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Contributeurs:</p>
                  <p className="text-lg font-bold text-foreground">{memberCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {onJoinClick && project.status === ProjectStatus.ACTIVE && (
                  <button
                    onClick={onJoinClick}
                    className="px-6 py-2.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Rejoindre le projet
                  </button>
                )}
                <button
                  onClick={onHighfiveClick}
                  className="w-10 h-10 flex items-center justify-center bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                  title="Highfive ce projet"
                >
                  <Hand size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
