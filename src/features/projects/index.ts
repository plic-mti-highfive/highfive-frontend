export { default as CreateProjectPage } from "./pages/CreateProjectPage";
export { ProjectDetailPage } from "./pages/ProjectDetailPage";
export { ProjectNewsPage } from "./pages/ProjectNewsPage";
export { ProjectTeamPage } from "./pages/ProjectTeamPage";
export { ProjectLayout } from "./components/ProjectLayout";

// Utilises par d'autres features en migration parallele (search, user) :
// exports conserves tels quels (mission — "ne pas renommer/supprimer").
export { TagSearchDropdown } from "./components/TagSearchDropdown";
export { ProjectFiltersBar } from "./components/ProjectFilters";
