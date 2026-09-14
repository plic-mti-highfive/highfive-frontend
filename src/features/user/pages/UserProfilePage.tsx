import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackageOpen, UserX } from "lucide-react";
import { ApiError } from "@/api/client";
import { useUser, useUserProjects } from "@/api/queries/users";
import { useAuth } from "@shared/contexts";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@shared/ui";
import { ProjectCard } from "@shared/components/projects";
import { EditProfileDialog } from "../components/EditProfileDialog";
import { ProfileHeader } from "../components/ProfileHeader";

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-5 lg:w-80 lg:shrink-0">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-pill" />
            <Skeleton className="h-5 w-16 rounded-pill" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

/**
 * Profil public d'une personne (doc 12 E-04, `/u/:pseudo`). Route/param
 * "pseudo" — R-P3. Aucune bannière, aucun compteur d'abonnés (le graphe
 * social de la v1 est supprimé, doc 12 E-04 : "aucun compteur d'abonnés ni
 * d'abonnements" ; le domaine v2, doc 04 §2, ne modélise d'ailleurs aucun
 * suivi de personnes).
 */
export default function UserProfilePage() {
  const { pseudo } = useParams<{ pseudo: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const profile = useUser(pseudo ?? "");
  const projects = useUserProjects(pseudo ?? "");

  const displayName =
    profile.data?.displayName ?? profile.data?.username ?? pseudo ?? "";
  useDocumentTitle(profile.data ? displayName : undefined);

  const isOwnProfile = Boolean(
    isAuthenticated && currentUser?.username === pseudo,
  );

  if (profile.isLoading) {
    return <ProfileSkeleton />;
  }

  if (profile.isError || !profile.data) {
    const notFound =
      profile.error instanceof ApiError && profile.error.status === 404;

    if (notFound) {
      return (
        <main className="mx-auto max-w-content px-6 py-16">
          <EmptyState
            icon={UserX}
            title="Profil introuvable"
            description="Cette personne n'existe pas ou a supprimé son compte."
            action={
              <Button onClick={() => navigate("/")}>Retour à Découvrir</Button>
            }
          />
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-content px-6 py-16">
        <ErrorState
          message="Ce profil n'a pas pu être chargé."
          onRetry={() => profile.refetch()}
        />
      </main>
    );
  }

  const user = profile.data;
  const created = projects.data?.created ?? [];
  const joined = projects.data?.collaborations ?? [];
  const privateCount = projects.data?.privateProjectsCount ?? 0;

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-content px-6 py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="w-full lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
            <ProfileHeader
              user={user}
              isOwnProfile={isOwnProfile}
              isSuspended={Boolean(
                isOwnProfile && currentUser?.accountStatus === "suspended",
              )}
              createdCount={created.length}
              joinedCount={joined.length}
              privateCount={privateCount}
              onEdit={() => setEditOpen(true)}
            />
          </div>

          <div className="min-w-0 flex-1">
            <Tabs defaultValue="created">
              <TabsList>
                <TabsTab value="created">Projets portés</TabsTab>
                <TabsTab value="joined">Projets rejoints</TabsTab>
              </TabsList>

              <TabsPanel value="created">
                {projects.isLoading ? (
                  <ProjectListSkeleton />
                ) : projects.isError ? (
                  <ErrorState
                    message="Les projets n'ont pas pu être chargés."
                    onRetry={() => projects.refetch()}
                  />
                ) : created.length === 0 ? (
                  <EmptyState
                    icon={PackageOpen}
                    title="Aucun projet public"
                    description={
                      isOwnProfile
                        ? "Tu n'as pas encore de projet public."
                        : `${displayName} n'a pas encore de projet public.`
                    }
                  />
                ) : (
                  <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {created.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsPanel>

              <TabsPanel value="joined">
                {projects.isLoading ? (
                  <ProjectListSkeleton />
                ) : projects.isError ? (
                  <ErrorState
                    message="Les projets n'ont pas pu être chargés."
                    onRetry={() => projects.refetch()}
                  />
                ) : joined.length === 0 ? (
                  <EmptyState
                    icon={PackageOpen}
                    title="Aucun projet rejoint"
                    description={
                      isOwnProfile
                        ? "Tu n'as pas encore rejoint de projet public."
                        : `${displayName} n'a pas encore rejoint de projet public.`
                    }
                  />
                ) : (
                  <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {joined.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </TabsPanel>
            </Tabs>
          </div>
        </div>
      </div>

      {isOwnProfile && currentUser && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={currentUser}
        />
      )}
    </main>
  );
}
