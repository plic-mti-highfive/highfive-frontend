import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header, Footer } from "@features/layout";
import type { ProjectNewsDto } from "@/api/types";
import { projectService } from "@/api/services";
import { NewsCard } from "../components/NewsCard";

export function ProjectNewsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<ProjectNewsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectService.getProjectNews(id),
      projectService.getProjectById(id),
    ]).then(([items, project]) => {
      const sorted = [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setNews(sorted);
      setProjectName(project.name);
      setIsLoading(false);
    });
  }, [id]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Retour au projet
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground">
              Fil d'actualités
            </h1>
            {projectName && (
              <p className="text-muted-foreground mt-1">{projectName}</p>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-6 animate-pulse"
                >
                  <div className="h-5 bg-muted rounded w-1/3 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Aucune actualité publiée pour ce projet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
