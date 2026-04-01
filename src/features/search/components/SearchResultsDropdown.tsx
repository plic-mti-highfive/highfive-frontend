import { useSearch } from '../hooks/useSearch'

const sectionTitleCls = 'px-3 py-2 text-body-sm font-semibold text-ink-muted uppercase tracking-wider'
const separatorCls = 'border-t border-cream-mid my-1.5 mx-2'
const resultItemCls = 'flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors text-left'

type SearchResultsDropdownProps = {
  query: string
  navigate: (to: string) => void
}

export function SearchResultsDropdown({ query, navigate }: SearchResultsDropdownProps) {
  const { filteredProjects, filteredUsers, filteredTags, filteredProgress, isEmpty } = useSearch(query)

  return (
    <div className="py-1.5">
      {/* Projets Section */}
      {filteredProjects.length > 0 && (
        <>
          <div className={sectionTitleCls}>Projets</div>
          {filteredProjects.map((project) => (
            <button
              key={project.id}
              className={resultItemCls}
              onClick={() => navigate(`/project/${project.id}`)}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-md text-ink truncate font-medium">{project.name}</p>
                <p className="text-body-sm text-ink-muted truncate">{project.description}</p>
              </div>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Utilisateurs Section */}
      {filteredUsers.length > 0 && (
        <>
          <div className={sectionTitleCls}>Utilisateurs</div>
          {filteredUsers.map((user) => (
            <button
              key={user.username}
              className={resultItemCls}
              onClick={() => navigate(`/user/${user.username}`)}
              type="button"
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-6 h-6 rounded-full shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-md text-ink truncate font-medium">{user.displayName}</p>
                <p className="text-body-sm text-ink-muted truncate">@{user.username}</p>
              </div>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Tags Section */}
      {filteredTags.length > 0 && (
        <>
          <div className={sectionTitleCls}>Tags</div>
          {filteredTags.map((tag) => (
            <button
              key={tag.name}
              className={resultItemCls}
              onClick={() => navigate(`/tag/${tag.name.toLowerCase()}`)}
              type="button"
            >
              <div className="flex-1 min-w-0">
                <p className="text-body-md text-ink truncate font-medium">{tag.name}</p>
              </div>
              <span className="text-body-sm text-ink-muted shrink-0">({tag.count})</span>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {/* Progrès Section */}
      {filteredProgress.length > 0 && (
        <>
          <div className={sectionTitleCls}>Progrès</div>
          {filteredProgress.map((progress) => (
            <button
              key={progress.id}
              className="flex flex-col gap-1 w-full px-3 py-2.5 text-ink cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors"
              onClick={() => console.log(`Navigate to progress ${progress.id}`)}
              type="button"
            >
              <p className="text-body-md font-medium text-ink text-left">{progress.title}</p>
              <p className="text-body-sm text-ink-muted text-left">{progress.projectName}</p>
              <p className="text-body-sm text-ink-muted text-left line-clamp-2">{progress.description}</p>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {isEmpty && (
        <div className="px-4 py-8 text-center">
          <p className="text-body-md text-ink-muted">Aucun résultat trouvé pour "{query}"</p>
        </div>
      )}
    </div>
  )
}
