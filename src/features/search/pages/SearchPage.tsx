import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FolderOpen, Users, Tag } from "lucide-react";
import { Header } from "@features/layout";
import { Footer } from "@features/layout";
import { SmallCard } from "@shared/components/projects";
import { ProjectFiltersBar } from "@features/projects";
import { projectService } from "@/api";
import type { Project } from "@shared/types";
import type { MinimalProfileDto, ProjectDto } from "@/api/types";
import { userService } from "@/api/services";
import { SearchEntityType } from "@plic-mti-highfive/shared-types";

function adaptProject(p: ProjectDto): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    tags: p.tags ?? [],
    author: "",
    contributorsCount: 0,
    highfiveCount: p.highfiveCount,
    successRate: 0,
    daysLeft: null,
  };
}

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = searchParams.get("q") || "";
  const tagFilter = searchParams.get("tag");

  const resultType: SearchEntityType = location.pathname.includes("/users")
    ? SearchEntityType.USERS
    : location.pathname.includes("/tags")
      ? SearchEntityType.TAGS
      : SearchEntityType.PROJECTS;

  const [, setActiveSort] = useState<"name" | "date" | "popularity">("date");
  const [, setActiveFilters] = useState<string[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<MinimalProfileDto[]>([]);
  const [, setTags] = useState<unknown[]>([]); // TODO

  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (resultType === SearchEntityType.PROJECTS) {
          const response = await projectService.getProjects({
            search: searchQuery || undefined,
            tags: tagFilter ? [tagFilter] : undefined,
            limit: 20,
          });
          setProjects(response.data.map(adaptProject));
          setTotalCount(response.total);
        } else if (resultType === SearchEntityType.USERS) {
          const response = await userService.searchProfiles({
            search: searchQuery || undefined,
            limit: 20,
          });
          setUsers(response.data);
          setTotalCount(response.total);

          setProjects([]);
          setTotalCount(0);
        } else if (resultType === "tags") {
          // TODO
          setProjects([]);
          setUsers([]);
          setTotalCount(0);
        }
      } catch (e) {
        console.error("Failed to fetch results:", e);
        setProjects([]);
        setUsers([]);
        setTags([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, tagFilter, resultType]);

  const resultsCount = totalCount;

  const resultsLabel =
    resultType === "projects"
      ? "projet"
      : resultType === "users"
        ? "utilisateur"
        : "tag";

  const handleTypeChange = (type: string) => {
    const currentParams = searchParams.toString();
    const path =
      type === "projects"
        ? "/search/projects"
        : type === "users"
          ? "/search/users"
          : "/search/tags";
    navigate(currentParams ? `${path}?${currentParams}` : path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Résultats pour :{" "}
            <span className="text-muted-foreground">
              {tagFilter || searchQuery}
            </span>
          </h1>
          <p className="mt-3 text-body-lg text-muted-foreground">
            {resultsCount} {resultsLabel}
            {resultsCount > 1 ? "s" : ""} trouvé{resultsCount > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => handleTypeChange("projects")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${
                  resultType === "projects"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              <FolderOpen size={18} />
              Projets
            </button>
            <button
              onClick={() => handleTypeChange("users")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${
                  resultType === "users"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              <Users size={18} />
              Utilisateurs
            </button>
            <button
              onClick={() => handleTypeChange("tags")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-body-md font-semibold
                transition-all outline-none
                ${
                  resultType === "tags"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              <Tag size={18} />
              Tags
            </button>
          </div>

          <div className="flex-shrink-0 h-[42px]">
            {resultType === "projects" && (
              <ProjectFiltersBar
                onSortChange={(sort) => setActiveSort(sort)}
                onFilterChange={(filters) => setActiveFilters(filters)}
              />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <>
            {/* VUE PROJETS */}
            {resultType === "projects" &&
              (projects.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
                  {projects.map((project) => (
                    <SmallCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    Aucun projet trouvé{" "}
                    {tagFilter || searchQuery
                      ? `pour "${tagFilter || searchQuery}"`
                      : ""}
                  </p>
                  <p className="mt-2 text-body-md text-muted-foreground">
                    Essayez avec d'autres mots-clés
                  </p>
                </div>
              ))}

            {/* VUE UTILISATEURS */}
            {resultType === "users" &&
              (users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => navigate(`/user/${user.userId}`)}
                      className="flex items-center gap-4 p-4 text-left bg-background border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors outline-none"
                    >
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-body-lg font-bold text-foreground truncate">
                          {user.displayName}
                        </p>
                        <p className="text-body-md text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    Aucun utilisateur trouvé{" "}
                    {searchQuery ? `pour "${searchQuery}"` : ""}
                  </p>
                </div>
              ))}

            {/* VUE TAGS (TODO) */}
            {resultType === "tags" && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  La recherche par tags n'est pas encore disponible.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
