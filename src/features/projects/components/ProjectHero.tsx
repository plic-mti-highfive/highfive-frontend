import { Hand, MoreVertical, Bookmark, Share2, Flag } from 'lucide-react'
import { Menu } from '@base-ui/react/menu'
import { Thumbnail } from '@shared/components/projects/shared/Thumbnail'
import type { ProjectDto } from '@/api/types'
import { ProjectStatus } from '@/api/types'

interface ProjectHeroProps {
  project: ProjectDto
  memberCount: number
  highfiveCount?: number
  onJoinClick?: () => void
  onHighfiveClick?: () => void
}

const popupCls =
  'bg-background border border-border rounded-xl shadow-lg py-1.5 w-48 z-[999] origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0'

const itemCls =
  'flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground rounded-lg cursor-pointer hover:bg-muted outline-none select-none transition-colors'

export function ProjectHero({ project, memberCount, highfiveCount = 0, onJoinClick, onHighfiveClick }: ProjectHeroProps) {
  return (
    <div className="bg-background">
      <div className="relative h-80 sm:h-96 overflow-hidden border-b border-border">
        <Thumbnail
          id={project.id}
          name={project.name}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between gap-6 mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                {project.name}
              </h1>
              <Menu.Root>
                <Menu.Trigger className="flex items-center justify-center w-10 h-10 rounded-lg bg-background/90 backdrop-blur-sm border border-border text-foreground hover:bg-background transition-colors cursor-pointer shrink-0">
                  <MoreVertical size={20} />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                    <Menu.Popup className={popupCls}>
                      <Menu.Item className={itemCls} onClick={() => console.log('Enregistrer')}>
                        <Bookmark size={16} className="text-muted-foreground" />
                        Enregistrer
                      </Menu.Item>
                      <Menu.Item className={itemCls} onClick={() => console.log('Partager')}>
                        <Share2 size={16} className="text-muted-foreground" />
                        Partager
                      </Menu.Item>
                      <Menu.Item className={itemCls} onClick={() => console.log('Signaler')}>
                        <Flag size={16} className="text-muted-foreground" />
                        Signaler
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>

            <div className="flex items-center gap-8 mb-6">
              <div className="flex items-center gap-2">
                <Hand size={20} className="text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{highfiveCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Contributeurs</p>
                <p className="text-xl font-bold text-foreground">{memberCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
  )
}
