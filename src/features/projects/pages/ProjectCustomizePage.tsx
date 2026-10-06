import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

import {
  Button,
  EmptyState,
  ErrorState,
  Section,
  Spinner,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { ConfirmActionDialog } from "@features/admin/components/ConfirmActionDialog";
import { ApiError } from "@/api/client";
import type { TeamMember } from "@/api/memberships";
import { useMembers } from "@/api/queries/memberships";
import { useProject, useUpdateProject } from "@/api/queries/projects";
import {
  useDeleteCustomizationImage,
  useUpdateCustomization,
  useUploadCustomizationImage,
} from "@/api/queries/customization";
import type { Project, ProjectCustomization } from "@/domain";
import { BannerEditor } from "../components/customize/BannerEditor";
import { CustomizePreview } from "../components/customize/CustomizePreview";
import { GalleryEditor } from "../components/customize/GalleryEditor";
import { InfoEditor } from "../components/customize/InfoEditor";
import { SectionsEditor } from "../components/customize/SectionsEditor";
import { ThemeEditor } from "../components/customize/ThemeEditor";
import type { UploadImage } from "../components/customize/types";
import { getMembershipRole, getProjectCapabilities } from "../lib/capabilities";
import { getDraftIssues, isDraftDirty, toDraft } from "../lib/customization";
import { compressImage } from "../lib/imageCompression";
import {
  applyInfoDraft,
  getInfoIssues,
  isInfoDirty,
  toInfoDraft,
  toUpdateInput,
} from "../lib/projectInfo";
import { useUnsavedChangesGuard } from "../lib/useUnsavedChangesGuard";

type EditorTab = "infos" | "images" | "sections" | "colors";

const EDITOR_TABS: { value: EditorTab; label: string }[] = [
  { value: "infos", label: "Infos" },
  { value: "images", label: "Images" },
  { value: "sections", label: "Sections" },
  { value: "colors", label: "Couleurs" },
];

/**
 * Editeur de la fiche (`/projets/:slug/modifier`) : un seul point d'entree
 * pour les infos (titre, accroche, description, themes, besoins ; porteur et
 * co-porteurs) et la personnalisation (images, sections, couleurs ; porteur
 * seul), en onglets. Coquille a hauteur d'ecran comme Le Lab : en-tete avec
 * retour nomme vers la fiche, puis formulaire et apercu live cote a cote
 * (onglets Edition / Apercu sous `lg`). Un seul bouton Enregistrer, garde
 * « changements non sauvegardes » (voir `useUnsavedChangesGuard`).
 */
export function ProjectCustomizePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();
  const projectQuery = useProject(slug);
  const membersQuery = useMembers(slug);

  useDocumentTitle(
    projectQuery.data ? `Modifier ${projectQuery.data.title}` : undefined,
  );

  if (projectQuery.isLoading || membersQuery.isLoading || isUserLoading) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Shell>
    );
  }

  const error = projectQuery.error;
  if (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 403)
  ) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Lock}
            title={
              error.status === 404
                ? "Ce projet n'existe pas."
                : "Ce projet est privé."
            }
            action={
              <Button render={<Link to="/" />}>Retour à Découvrir</Button>
            }
          />
        </div>
      </Shell>
    );
  }
  if (projectQuery.isError || membersQuery.isError || !projectQuery.data) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <ErrorState
            message="Impossible de charger la personnalisation pour le moment."
            onRetry={() => {
              void projectQuery.refetch();
              void membersQuery.refetch();
            }}
          />
        </div>
      </Shell>
    );
  }

  const project = projectQuery.data;
  const members = membersQuery.data ?? [];
  const capabilities = getProjectCapabilities(
    getMembershipRole(members, user?.id),
    isAuthenticated,
  );

  if (!capabilities.canEdit) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Lock}
            title="Seuls le porteur et les co-porteurs peuvent modifier la fiche"
            description="Les infos du projet sont modifiables par l'équipe porteuse, la personnalisation (images, sections, couleurs) par le porteur seul."
            action={
              <Button render={<Link to={`/projets/${slug}`} />}>
                Voir la fiche du projet
              </Button>
            }
          />
        </div>
      </Shell>
    );
  }

  return (
    <CustomizeEditor
      project={project}
      members={members}
      canCustomize={capabilities.canCustomize}
    />
  );
}

/** Coquille a hauteur d'ecran des etats de chargement/erreur/permission. */
function Shell({ children }: { children: React.ReactNode }) {
  return <main className="h-screen bg-background">{children}</main>;
}

function CustomizeEditor({
  project,
  members,
  canCustomize,
}: {
  project: Project;
  members: TeamMember[];
  /** Porteur seul : sans ce droit, seul l'onglet Infos est proposé. */
  canCustomize: boolean;
}) {
  const navigate = useNavigate();
  const ficheUrl = `/projets/${project.slug}`;
  const saved = project.customization;

  const [draft, setDraft] = useState<ProjectCustomization>(() =>
    toDraft(saved),
  );
  const [info, setInfo] = useState(() => toInfoDraft(project));
  const [tab, setTab] = useState<EditorTab>("infos");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [submitted, setSubmitted] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  /** Champ a focaliser apres un enregistrement refuse (objet neuf a chaque tentative). */
  const [focusTarget, setFocusTarget] = useState<{ inputId: string } | null>(
    null,
  );
  /** Images televersees pendant cette session d'edition (a nettoyer si abandonnees). */
  const uploadedIds = useRef(new Set<string>());

  const updateProject = useUpdateProject(project.slug);
  const updateCustomization = useUpdateCustomization(project.slug);
  const uploadImageMutation = useUploadCustomizationImage(project.slug);
  const deleteImageMutation = useDeleteCustomizationImage(project.slug);

  const infoDirty = isInfoDirty(info, project);
  const customizationDirty = canCustomize && isDraftDirty(draft, saved);
  const dirty = infoDirty || customizationDirty;
  const infoIssues = getInfoIssues(info);
  const issues = getDraftIssues(draft);
  useUnsavedChangesGuard(dirty);

  // Apercu live : la fiche telle qu'elle serait avec les infos du brouillon.
  const previewProject = useMemo(
    () => applyInfoDraft(project, info),
    [project, info],
  );
  const tabs = canCustomize
    ? EDITOR_TABS
    : EDITOR_TABS.filter((item) => item.value === "infos");

  const uploadImage: UploadImage = async (file, maxWidth) => {
    const compressed = await compressImage(file, { maxWidth });
    const uploaded = await uploadImageMutation.mutateAsync(compressed);
    uploadedIds.current.add(uploaded.id);
    return uploaded;
  };

  /** Retire du serveur une image televersee ici et jamais enregistree (au mieux, sans bloquer). */
  function discardImage(imageId: string) {
    if (uploadedIds.current.delete(imageId)) {
      deleteImageMutation.mutate(imageId);
    }
  }

  function leave() {
    const referenced = new Set([
      ...(saved?.banner ? [saved.banner.id] : []),
      ...(saved?.gallery.map((item) => item.id) ?? []),
    ]);
    for (const imageId of uploadedIds.current) {
      if (!referenced.has(imageId)) deleteImageMutation.mutate(imageId);
    }
    navigate(ficheUrl);
  }

  function requestLeave() {
    if (dirty) setConfirmLeave(true);
    else navigate(ficheUrl);
  }

  function handleSave() {
    if (infoIssues.length > 0 || (canCustomize && issues.count > 0)) {
      setSubmitted(true);
      setView("edit");
      if (infoIssues.length > 0) {
        setTab("infos");
        setFocusTarget({ inputId: infoIssues[0].inputId });
      } else {
        setTab("images");
        setFocusTarget({ inputId: issues.items[0].inputId });
      }
      return;
    }
    const saveCustomization = () => {
      if (customizationDirty) {
        updateCustomization.mutate(draft, {
          onSuccess: () => navigate(ficheUrl),
        });
      } else {
        navigate(ficheUrl);
      }
    };
    if (infoDirty) {
      updateProject.mutate(toUpdateInput(info), {
        onSuccess: saveCustomization,
      });
    } else {
      saveCustomization();
    }
  }

  const isSaving = updateProject.isPending || updateCustomization.isPending;
  const saveError = updateProject.error ?? updateCustomization.error;

  // Apres un enregistrement refuse : va au premier champ a corriger (une fois
  // l'onglet Edition affiche, d'ou l'effet plutot qu'un appel direct).
  useEffect(() => {
    if (!focusTarget) return;
    const field = document.getElementById(focusTarget.inputId);
    field?.scrollIntoView?.({ block: "center" });
    field?.focus();
  }, [focusTarget]);

  function focusField(inputId: string, target: EditorTab) {
    setTab(target);
    setFocusTarget({ inputId });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* En-tete (et onglets sous `lg`) collants : toute la page defile, pas des panneaux coupes. */}
      <div className="sticky top-0 z-sticky bg-background">
        <header className="flex h-13 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link
            to={ficheUrl}
            onClick={(event) => {
              if (dirty) {
                event.preventDefault();
                setConfirmLeave(true);
              }
            }}
            className="flex min-w-0 items-center gap-2 text-body-md font-semibold text-foreground transition-colors hover:text-muted-foreground"
          >
            <ArrowLeft size={18} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{project.title}</span>
          </Link>
          <span className="hidden text-body-md text-muted-foreground sm:inline">
            Modifier la fiche
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {dirty && (
              <span
                role="status"
                className="hidden text-body-sm text-muted-foreground md:inline"
              >
                Modifications non enregistrées
              </span>
            )}
            <Button variant="outline" size="sm" onClick={requestLeave}>
              Annuler
            </Button>
            <Button size="sm" disabled={isSaving} onClick={handleSave}>
              {isSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </header>

        <Tabs
          value={view}
          onValueChange={(next) => setView(next as "edit" | "preview")}
          className="shrink-0 gap-0 border-b border-border px-4 lg:hidden"
        >
          <TabsList aria-label="Affichage de l'éditeur">
            <TabsTab value="edit">Édition</TabsTab>
            <TabsTab value="preview">Aperçu</TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3">
        <div
          className={cn(
            "flex-col gap-8 p-4 pb-12 sm:p-6 sm:pb-12 lg:col-span-1 lg:flex lg:border-r lg:border-border",
            view === "edit" ? "flex" : "hidden",
          )}
        >
          {saveError && (
            <p role="alert" className="text-body-sm text-danger-fg">
              {saveError instanceof ApiError
                ? saveError.message
                : "L'enregistrement a échoué. Réessaie dans un instant."}
            </p>
          )}
          {submitted && infoIssues.length > 0 && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-lg border border-danger-border bg-danger-bg p-3 text-body-sm text-danger-fg"
            >
              <p>Impossible d'enregistrer : complète les infos du projet.</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {infoIssues.map((item) => (
                  <li key={item.inputId}>
                    <button
                      type="button"
                      onClick={() => focusField(item.inputId, "infos")}
                      className="font-medium underline underline-offset-2"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {submitted && canCustomize && issues.count > 0 && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-lg border border-danger-border bg-danger-bg p-3 text-body-sm text-danger-fg"
            >
              <p>
                Impossible d'enregistrer : il manque un texte alternatif. Décris
                chaque image pour continuer.
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {issues.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => focusField(item.inputId, "images")}
                      className="font-medium underline underline-offset-2"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Tabs
            value={tab}
            onValueChange={(next) => setTab(next as EditorTab)}
            className="gap-6"
          >
            {tabs.length > 1 && (
              <TabsList
                aria-label="Parties de la fiche"
                className="w-full border-b border-border"
              >
                {tabs.map((item) => (
                  <TabsTab key={item.value} value={item.value}>
                    {item.label}
                  </TabsTab>
                ))}
              </TabsList>
            )}

            <TabsPanel value="infos">
              <InfoEditor
                value={info}
                onChange={setInfo}
                showIssues={submitted}
              />
            </TabsPanel>
            {canCustomize && (
              <>
                <TabsPanel value="images" className="flex flex-col gap-8">
                  <Section title="Bannière">
                    <BannerEditor
                      banner={draft.banner}
                      error={submitted ? issues.banner : undefined}
                      onChange={(banner) => setDraft((d) => ({ ...d, banner }))}
                      onUpload={uploadImage}
                      onDiscardImage={discardImage}
                    />
                  </Section>
                  <Section title="Galerie">
                    <GalleryEditor
                      gallery={draft.gallery}
                      issues={submitted ? issues.gallery : {}}
                      onChange={(gallery) =>
                        setDraft((d) => ({ ...d, gallery }))
                      }
                      onUpload={uploadImage}
                      onDiscardImage={discardImage}
                    />
                  </Section>
                </TabsPanel>
                <TabsPanel value="sections">
                  <Section title="Sections de l'Aperçu">
                    <SectionsEditor
                      sections={draft.sections}
                      onChange={(sections) =>
                        setDraft((d) => ({ ...d, sections }))
                      }
                    />
                  </Section>
                </TabsPanel>
                <TabsPanel value="colors">
                  <Section title="Couleurs de la fiche">
                    <ThemeEditor
                      value={draft.theme}
                      onChange={(theme) => setDraft((d) => ({ ...d, theme }))}
                    />
                  </Section>
                </TabsPanel>
              </>
            )}
          </Tabs>
        </div>

        <div
          className={cn(
            "p-4 sm:p-6 lg:col-span-2 lg:block",
            view === "preview" ? "block" : "hidden",
          )}
        >
          {/* Colle sous l'en-tete et defile a l'interieur sans etre coupe par le
              bas de la fenetre ; aucun cadre : les sections de l'apercu se
              suffisent. */}
          <div className="lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto">
            <CustomizePreview
              project={previewProject}
              members={members}
              draft={draft}
            />
          </div>
        </div>
      </main>

      <ConfirmActionDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Quitter sans enregistrer ?"
        description="Tes modifications de la fiche seront perdues."
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer à modifier"
        destructive
        onConfirm={leave}
      />
    </div>
  );
}
