import { useEffect, useRef, useState } from "react";
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
  TabsTab,
} from "@shared/ui";
import { cn } from "@shared/lib/cn";
import { useDocumentTitle } from "@shared/lib/useDocumentTitle";
import { useCurrentUser } from "@features/auth/hooks/useCurrentUser";
import { ConfirmActionDialog } from "@features/admin/components/ConfirmActionDialog";
import { ApiError } from "@/api/client";
import type { TeamMember } from "@/api/memberships";
import { useMembers } from "@/api/queries/memberships";
import { useProject } from "@/api/queries/projects";
import {
  useDeleteCustomizationImage,
  useUpdateCustomization,
  useUploadCustomizationImage,
} from "@/api/queries/customization";
import type { Project, ProjectCustomization } from "@/domain";
import { AccentPicker } from "../components/customize/AccentPicker";
import { BannerEditor } from "../components/customize/BannerEditor";
import { CustomizePreview } from "../components/customize/CustomizePreview";
import { GalleryEditor } from "../components/customize/GalleryEditor";
import { SectionsEditor } from "../components/customize/SectionsEditor";
import type { UploadImage } from "../components/customize/types";
import { getMembershipRole, getProjectCapabilities } from "../lib/capabilities";
import { getDraftIssues, isDraftDirty, toDraft } from "../lib/customization";
import { compressImage } from "../lib/imageCompression";
import { useUnsavedChangesGuard } from "../lib/useUnsavedChangesGuard";

/**
 * Editeur de personnalisation de la fiche (`/projets/:slug/personnaliser`),
 * porteur seul. Coquille a hauteur d'ecran comme Le Lab : en-tete avec
 * retour nomme vers la fiche, puis formulaire et apercu live cote a cote
 * (onglets Edition / Apercu sous `lg`). Enregistrement explicite, garde
 * « changements non sauvegardes » (voir `useUnsavedChangesGuard`).
 */
export function ProjectCustomizePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { user, isAuthenticated, isLoading: isUserLoading } = useCurrentUser();
  const projectQuery = useProject(slug);
  const membersQuery = useMembers(slug);

  useDocumentTitle(
    projectQuery.data ? `Personnaliser ${projectQuery.data.title}` : undefined,
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

  if (!capabilities.canCustomize) {
    return (
      <Shell>
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Lock}
            title="Seul le porteur peut personnaliser la fiche"
            description="La personnalisation (bannière, couleur, sections, galerie) est réservée au créateur du projet."
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

  return <CustomizeEditor project={project} members={members} />;
}

/** Coquille a hauteur d'ecran des etats de chargement/erreur/permission. */
function Shell({ children }: { children: React.ReactNode }) {
  return <main className="h-screen bg-background">{children}</main>;
}

function CustomizeEditor({
  project,
  members,
}: {
  project: Project;
  members: TeamMember[];
}) {
  const navigate = useNavigate();
  const ficheUrl = `/projets/${project.slug}`;
  const saved = project.customization;

  const [draft, setDraft] = useState<ProjectCustomization>(() =>
    toDraft(saved),
  );
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [submitted, setSubmitted] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  /** Champ a focaliser apres un enregistrement refuse (objet neuf a chaque tentative). */
  const [focusTarget, setFocusTarget] = useState<{ inputId: string } | null>(
    null,
  );
  /** Images televersees pendant cette session d'edition (a nettoyer si abandonnees). */
  const uploadedIds = useRef(new Set<string>());

  const updateCustomization = useUpdateCustomization(project.slug);
  const uploadImageMutation = useUploadCustomizationImage(project.slug);
  const deleteImageMutation = useDeleteCustomizationImage(project.slug);

  const dirty = isDraftDirty(draft, saved);
  const issues = getDraftIssues(draft);
  useUnsavedChangesGuard(dirty);

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
    if (issues.count > 0) {
      setSubmitted(true);
      setView("edit");
      setFocusTarget({ inputId: issues.items[0].inputId });
      return;
    }
    updateCustomization.mutate(draft, {
      onSuccess: () => navigate(ficheUrl),
    });
  }

  const saveError = updateCustomization.error;

  // Apres un enregistrement refuse : va au premier champ a corriger (une fois
  // l'onglet Edition affiche, d'ou l'effet plutot qu'un appel direct).
  useEffect(() => {
    if (!focusTarget) return;
    const field = document.getElementById(focusTarget.inputId);
    field?.scrollIntoView?.({ block: "center" });
    field?.focus();
  }, [focusTarget]);

  function focusField(inputId: string) {
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
            Personnaliser la fiche
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
            <Button
              size="sm"
              disabled={updateCustomization.isPending}
              onClick={handleSave}
            >
              {updateCustomization.isPending
                ? "Enregistrement…"
                : "Enregistrer"}
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
          {submitted && issues.count > 0 && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-lg border border-danger-border bg-danger-bg p-3 text-body-sm text-danger-fg"
            >
              <p>
                Impossible d'enregistrer : il manque un texte alternatif.
                Complète-le, ou coche « Image décorative ».
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {issues.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => focusField(item.inputId)}
                      className="font-medium underline underline-offset-2"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Section title="Couleur d'accent">
            <AccentPicker
              value={draft.accent}
              onChange={(accent) => setDraft((d) => ({ ...d, accent }))}
            />
          </Section>

          <Section title="Bannière">
            <BannerEditor
              banner={draft.banner}
              error={submitted ? issues.banner : undefined}
              onChange={(banner) => setDraft((d) => ({ ...d, banner }))}
              onUpload={uploadImage}
              onDiscardImage={discardImage}
            />
          </Section>

          <Section title="Sections de l'Aperçu">
            <SectionsEditor
              sections={draft.sections}
              onChange={(sections) => setDraft((d) => ({ ...d, sections }))}
            />
          </Section>

          <Section title="Galerie">
            <GalleryEditor
              gallery={draft.gallery}
              issues={submitted ? issues.gallery : {}}
              onChange={(gallery) => setDraft((d) => ({ ...d, gallery }))}
              onUpload={uploadImage}
              onDiscardImage={discardImage}
            />
          </Section>
        </div>

        <div
          className={cn(
            "bg-muted/40 p-4 sm:p-6 lg:col-span-2 lg:block",
            view === "preview" ? "block" : "hidden",
          )}
        >
          <p className="mb-3 text-label uppercase text-muted-foreground">
            Aperçu en direct
          </p>
          {/* Carte bornee et collee sous l'en-tete : son bord est visible, elle defile
              a l'interieur sans etre coupee par le bas de la fenetre. */}
          <div className="overflow-y-auto rounded-xl border border-border bg-background lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)]">
            <CustomizePreview
              project={project}
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
        description="Tes modifications de la personnalisation seront perdues."
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer à modifier"
        destructive
        onConfirm={leave}
      />
    </div>
  );
}
