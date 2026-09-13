import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { ProjectHeader } from "../components/ProjectHeader";
import { ProjectTabs, type TabId } from "../components/ProjectTabs";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { TicketList } from "../components/TicketList";
import { DiscussionThread } from "../components/DiscussionThread";
import { NewsFeedPreview } from "../components/NewsFeedPreview";
import { SimilarProjects } from "../components/SimilarProjects";
import { ProjectDetailSkeleton } from "../components/ProjectDetailSkeleton";
import {
  ConfirmJoinModal,
  JoinSuccessModal,
} from "../components/JoinProjectModal";
import type { ProjectMessageDto } from "@/api/types";
import { projectService } from "@/api/services";
import { ProjectRole } from "@plic-mti-highfive/shared-types";
import { useAuth } from "@shared/contexts";

export function ProjectDetailPage() {
  // TODO(v2-L4) : route "/projets/:slug" (param renomme id -> slug) ; le hook
  // ci-dessous attend encore un id technique, a migrer.
  const { slug: id } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [localMessages, setLocalMessages] = useState<ProjectMessageDto[]>([]);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [highfiveCount, setHighfiveCount] = useState<number | null>(null);
  const [hasHighfived, setHasHighfived] = useState(false);

  const {
    project,
    members,
    tickets,
    messages,
    similarProjects,
    isLoading,
    error,
  } = useProjectDetail(id || "");

  const handleMessageSent = (newMessage: ProjectMessageDto) => {
    setLocalMessages((prev) => [...prev, newMessage]);
  };

  const allMessages = (() => {
    const messageArray = Array.isArray(messages) ? messages : [];
    const messageIds = new Set(messageArray.map((m) => m.id));
    const combined = [
      ...messageArray,
      ...localMessages.filter((m) => !messageIds.has(m.id)),
    ];
    return combined;
  })();

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <>
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Projet introuvable
              </h1>
              <p className="text-muted-foreground mb-6">
                {error || "Le projet que vous recherchez n'existe pas."}
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handleJoinProject = () => {
    setShowJoinConfirm(true);
  };

  // Le proprietaire, identifie par son role et non par sa position dans la
  // liste. Repli sur le profil imbrique dans le projet si l'appel /members
  // n'a rien renvoye.
  const ownerMember = members.find((m) => m.role === ProjectRole.OWNER);
  const creator = ownerMember?.user
    ? {
        email: ownerMember.user.email,
        avatar: ownerMember.user.profile?.avatarPath ?? undefined,
      }
    : project.owner
      ? {
          email: project.owner.username,
          avatar: project.owner.avatar ?? undefined,
        }
      : undefined;

  const handleConfirmJoin = async () => {
    setShowJoinConfirm(false);
    setJoinError(null);

    if (!user) {
      navigate("/connexion");
      return;
    }

    // La confirmation de succes etait hors du try/catch : elle s'affichait meme
    // quand l'appel echouait, et meme quand aucun appel n'etait fait faute
    // d'utilisateur connecte. On ne l'affiche plus que si l'ajout a reussi.
    try {
      await projectService.addProjectMember(project.id, {
        userId: user.id,
        role: ProjectRole.MEMBER,
      });
      setHasJoined(true);
      setShowJoinSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la tentative de rejoindre le projet:", err);
      setJoinError(
        "Impossible de rejoindre ce projet pour le moment. Réessayez.",
      );
    }
  };

  const handleHighfive = async () => {
    if (!user) {
      navigate("/connexion");
      return;
    }

    const current = highfiveCount ?? project.highfiveCount ?? 0;
    const next = hasHighfived ? current - 1 : current + 1;

    // Mise a jour optimiste, puis persistance : le compteur n'etait
    // qu'un etat local et retombait a sa valeur initiale au rechargement.
    setHighfiveCount(next);
    setHasHighfived(!hasHighfived);
    try {
      if (hasHighfived) {
        await projectService.removeHighfive(project.id);
      } else {
        await projectService.addHighfive(project.id);
      }
    } catch (err) {
      console.error("Erreur lors du highfive:", err);
      setHighfiveCount(current);
      setHasHighfived(hasHighfived);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-background">
        <ProjectHeader
          project={project}
          // `members[0]` designait le premier membre renvoye par l'API, dont
          // l'ordre n'est pas garanti : l'en-tete a affiche un simple VIEWER
          // comme createur alors que le panneau equipe montrait le bon
          // proprietaire juste a cote. On s'appuie sur le role.
          creator={creator}
          onJoinClick={hasJoined ? undefined : handleJoinProject}
          onHighfiveClick={handleHighfive}
        />

        <div className="border-b border-border bg-background py-12">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === "overview" && (
                  <div className="pl-4 prose prose-sm max-w-none">
                    {project.description ? (
                      <div>
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                          À propos du projet
                        </h2>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {project.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Aucune description détaillée pour le moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "announcement" && (
                  <div className="pl-4">
                    <NewsFeedPreview
                      projectId={project.id}
                      isOwner={members.some(
                        (m) =>
                          m.userId === user?.id && m.role === ProjectRole.OWNER,
                      )}
                    />
                  </div>
                )}

                {activeTab === "tasks" && (
                  <TicketList
                    tickets={tickets}
                    members={members}
                    projectId={project.id}
                  />
                )}
              </div>

              <div className="lg:col-span-1">
                <ProjectSidebar
                  project={project}
                  members={members}
                  highfiveCount={highfiveCount ?? project.highfiveCount ?? 0}
                />
              </div>
            </div>
          </div>
        </div>

        <section className="border-b border-border bg-background py-16">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Discussion
            </h2>
            <DiscussionThread
              projectId={project.id}
              messages={allMessages}
              onMessageSent={handleMessageSent}
            />
          </div>
        </section>

        <SimilarProjects projects={similarProjects} />
      </main>

      {joinError && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg"
        >
          <span>{joinError}</span>
          <button
            onClick={() => setJoinError(null)}
            className="font-medium underline underline-offset-2 hover:opacity-80"
          >
            Fermer
          </button>
        </div>
      )}

      {showJoinConfirm && (
        <ConfirmJoinModal
          projectName={project.name}
          onConfirm={handleConfirmJoin}
          onCancel={() => setShowJoinConfirm(false)}
        />
      )}

      {showJoinSuccess && (
        <JoinSuccessModal
          projectName={project.name}
          onClose={() => setShowJoinSuccess(false)}
        />
      )}
    </>
  );
}
