import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@features/layout/components/Header";
import Footer from "@features/layout/components/Footer";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { ProjectHero } from "../components/ProjectHero";
import { ProjectTabs, type TabId } from "../components/ProjectTabs";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { TicketList } from "../components/TicketList";
import { DiscussionThread } from "../components/DiscussionThread";
import { SimilarProjects } from "../components/SimilarProjects";
import { ProjectDetailSkeleton } from "../components/ProjectDetailSkeleton";
import type { ProjectMessageDto } from "@/api/types";
import { TicketStatus } from "@plic-mti-highfive/shared-types";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [localMessages, setLocalMessages] = useState<ProjectMessageDto[]>([]);

  const { project, members, tickets, messages, isLoading, error } =
    useProjectDetail(id || "");

  const handleMessageSent = (newMessage: ProjectMessageDto) => {
    setLocalMessages((prev) => [...prev, newMessage]);
  };

  const allMessages = (() => {
    const messageIds = new Set(messages.map((m) => m.id));
    const combined = [
      ...messages,
      ...localMessages.filter((m) => !messageIds.has(m.id)),
    ];
    return combined;
  })();

  if (isLoading) {
    return (
      <>
        <Header />
        <ProjectDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  const completedTickets = tickets.filter(
    (t) => t.status === TicketStatus.DONE,
  ).length;
  const totalTickets = tickets.length;
  const progress =
    totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0;

  const handleJoinProject = () => {
    console.log("Rejoindre le projet:", project.id);
  };

  const handleHighfive = () => {
    console.log("Highfive le projet:", project.id);
  };

  // Simuler des projets similaires et highfives (à remplacer par une vraie requête API plus tard)
  const similarProjects: (typeof project)[] = [
    {
      ...project,
      id: "101",
      name: "Projet Open Source similaire 1",
      description: "Description du projet similaire 1",
    },
    {
      ...project,
      id: "102",
      name: "Projet Open Source similaire 2",
      description: "Description du projet similaire 2",
    },
    {
      ...project,
      id: "103",
      name: "Projet Open Source similaire 3",
      description: "Description du projet similaire 3",
    },
    {
      ...project,
      id: "104",
      name: "Projet Open Source similaire 4",
      description: "Description du projet similaire 4",
    },
  ];
  const highfiveCount = 42;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <ProjectHero
          project={project}
          memberCount={members.length}
          creator={
            members[0]?.user
              ? {
                  email: members[0].user.email,
                  avatar: members[0].user.profile?.avatarPath,
                }
              : undefined
          }
          progress={progress}
          highfiveCount={highfiveCount}
          onJoinClick={handleJoinProject}
          onHighfiveClick={handleHighfive}
        />

        <div className="border-b border-border bg-background py-12">
          <div className="max-w-8xl mx-auto px-6">
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

                {activeTab === "tasks" && (
                  <TicketList
                    tickets={tickets}
                    members={members}
                    projectId={project.id}
                  />
                )}
              </div>

              <div className="lg:col-span-1">
                <ProjectSidebar project={project} members={members} />
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
      <Footer />
    </>
  );
}
