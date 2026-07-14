import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, X } from "lucide-react";
import type { ProjectNewsDto } from "@/api/types";
import { projectService } from "@/api/services";
import { NewsCard } from "./NewsCard";

const PREVIEW_COUNT = 3;

interface NewsFeedPreviewProps {
  projectId: string;
  isOwner?: boolean;
}

export function NewsFeedPreview({
  projectId,
  isOwner = false,
}: NewsFeedPreviewProps) {
  const navigate = useNavigate();
  const [news, setNews] = useState<ProjectNewsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    projectService.getProjectNews(projectId).then((items) => {
      const sorted = [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setNews(sorted);
      setIsLoading(false);
    });
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await projectService.createNews(projectId, {
        title: title.trim(),
        content: content.trim(),
      });
      setNews((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch {
      // silently fail — production would show a toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewItems = news.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Annuler" : "Nouvelle annonce"}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de l'annonce"
                className="w-full bg-transparent text-foreground font-semibold placeholder:text-muted-foreground focus:outline-none text-base"
                disabled={isSubmitting}
              />
              <div className="border-t border-border" />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Décrivez la mise à jour, l'annonce ou l'avancement du projet..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end px-4 pb-4">
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : previewItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isOwner
              ? "Aucune annonce pour l'instant. Publiez votre première mise à jour !"
              : "Aucune annonce publiée pour ce projet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {previewItems.map((item) => (
            <NewsCard key={item.id} news={item} compact />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(`/projects/${projectId}/news`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Voir toutes les actualités
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
