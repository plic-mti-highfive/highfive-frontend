import { useSearch } from "../hooks/useSearch";

const sectionTitleCls =
  "px-3 py-2 text-body-md font-semibold text-muted-foreground uppercase tracking-wider";
const separatorCls = "border-t border-border my-1.5 mx-2";
const resultItemCls =
  "flex items-center gap-3 w-full px-3 py-2 text-body-lg text-foreground cursor-pointer hover:bg-muted outline-none select-none transition-colors text-left";

type SearchResultsDropdownProps = {
  query: string;
  navigate: (to: string) => void;
};

export function SearchResultsDropdown({
  query,
  navigate,
}: SearchResultsDropdownProps) {
  const {
    filteredProjects,
    filteredUsers,
    filteredTags,
    filteredProgress,
    isEmpty,
  } = useSearch(query);

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
              onClick={() => navigate(`/projects/${project.id}`)}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-lg text-foreground truncate font-medium">
                  {project.name}
                </p>
                <p className="text-body-md text-muted-foreground truncate">
                  {project.description}
                </p>
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
              key={user.userId}
              className={resultItemCls}
              onClick={() => navigate(`/user/${user.userId}`)}
              type="button"
            >
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="min-w-0">
                <p className="text-body-lg text-foreground truncate font-medium">
                  {user.displayName}
                </p>
                <p className="text-body-md text-muted-foreground truncate">
                  @{user.username}
                </p>
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
              onClick={() =>
                navigate(`/search/projects?tag=${encodeURIComponent(tag.name)}`)
              }
              type="button"
            >
              <div className="flex-1 min-w-0">
                <p className="text-body-lg text-foreground truncate font-medium">
                  {tag.name}
                </p>
              </div>
              <span className="text-body-md text-muted-foreground shrink-0">
                ({tag.count})
              </span>
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
              className="flex flex-col gap-1 w-full px-3 py-2.5 text-foreground cursor-pointer hover:bg-muted outline-none select-none transition-colors"
              onClick={() => console.log(`Navigate to progress ${progress.id}`)}
              type="button"
            >
              <p className="text-body-lg font-medium text-foreground text-left">
                {progress.title}
              </p>
              <p className="text-body-md text-muted-foreground text-left">
                {progress.projectName}
              </p>
              <p className="text-body-md text-muted-foreground text-left line-clamp-2">
                {progress.description}
              </p>
            </button>
          ))}
          <div className={separatorCls} />
        </>
      )}

      {isEmpty && (
        <div className="px-4 py-8 text-center">
          <p className="text-body-lg text-muted-foreground">
            Aucun résultat trouvé pour "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
