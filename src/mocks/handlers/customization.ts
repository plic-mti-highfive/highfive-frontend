import { http, HttpResponse } from "msw";
import {
  customizationImageUploadSchema,
  projectCustomizationSchema,
  projectSchema,
  type Project,
  type ProjectCustomization,
} from "@/domain";
import { nextId } from "../data/ids";
import { getDb, type DbUser } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  isWritable,
  simulateLatency,
} from "./utils";

/** Types acceptes (liste blanche) : pas de GIF en v1, l'animation serait perdue a la compression cote client. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
/** Taille maximale d'une image televersee (apres compression cote client). */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function findProjectBySlug(slug: string): Project | undefined {
  return getDb().projects.findOne((p) => p.slug === slug);
}

/** Personnalisation : porteur seul (pas de co-porteur), compte actif. */
function canCustomize(project: Project, user: DbUser | undefined): boolean {
  return Boolean(user && user.id === project.ownerId && isWritable(user));
}

/** Les octets ne sont pas servis par le mock : l'image est renvoyee en data URL. */
async function toDataUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }
  return `data:${file.type};base64,${btoa(binary)}`;
}

/** Ids d'images referencees par une personnalisation (banniere + galerie). */
function referencedImageIds(customization: ProjectCustomization): string[] {
  return [
    ...(customization.banner ? [customization.banner.id] : []),
    ...customization.gallery.map((item) => item.id),
  ];
}

export const customizationHandlers = [
  http.patch(
    apiUrl("/projects/:slug/customization"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = findProjectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      if (!canCustomize(project, user)) return errors.forbidden();

      const parsed = projectCustomizationSchema.safeParse(
        await request.json().catch(() => undefined),
      );
      if (!parsed.success) return errors.validation(parsed.error.issues);

      const db = getDb();
      const ownImageIds = new Set(
        db.customizationImages
          .find((image) => image.projectId === project.id)
          .map((image) => image.id),
      );
      const foreign = referencedImageIds(parsed.data).filter(
        (id) => !ownImageIds.has(id),
      );
      if (foreign.length > 0) {
        return errors.validation({
          images: "Image inconnue pour ce projet : televerse-la d'abord.",
        });
      }

      const updated = db.projects.update((p) => p.id === project.id, {
        customization: parsed.data,
        updatedAt: new Date().toISOString(),
      });
      return HttpResponse.json(projectSchema.parse(updated));
    },
  ),

  http.post(
    apiUrl("/projects/:slug/customization/images"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = findProjectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      if (!canCustomize(project, user)) return errors.forbidden();

      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File))
        return errors.validation({ file: "Image requise." });
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return errors.validation({
          file: "Format non pris en charge (JPEG, PNG, WebP ou AVIF).",
        });
      }
      if (file.size > MAX_IMAGE_SIZE)
        return errors.validation({ file: "2 Mo maximum par image." });

      const record = {
        id: nextId(),
        projectId: project.id,
        url: await toDataUrl(file),
        size: file.size,
        mimeType: file.type,
      };
      getDb().customizationImages.insert(record);
      return HttpResponse.json(
        customizationImageUploadSchema.parse({
          id: record.id,
          url: record.url,
        }),
        { status: 201 },
      );
    },
  ),

  http.delete(
    apiUrl("/projects/:slug/customization/images/:imageId"),
    async ({ request, params }) => {
      await simulateLatency();
      const project = findProjectBySlug(String(params.slug));
      if (!project) return errors.notFound("Ce projet n'existe pas.");
      const user = getAuthUser(request);
      if (!user) return errors.unauthorized();
      // Porteur (compte actif) ou administration (moderation).
      const isAdmin = user.platformRole === "admin";
      if (!isAdmin && !canCustomize(project, user)) return errors.forbidden();

      const db = getDb();
      const image = db.customizationImages.findOne(
        (i) => i.id === params.imageId && i.projectId === project.id,
      );
      if (!image) return errors.notFound("Image introuvable.");

      // Moderation : un admin qui retire le media d'un autre porteur est journalise (R-S4).
      if (isAdmin && user.id !== project.ownerId) {
        const body = (await request.json().catch(() => ({}))) as {
          reason?: unknown;
        };
        const reason =
          typeof body.reason === "string" && body.reason.trim()
            ? body.reason.trim().slice(0, 1000)
            : undefined;
        db.adminActions.insert({
          id: nextId(),
          adminId: user.id,
          type: "remove_project_media",
          targetType: "project",
          targetId: project.id,
          reason,
          createdAt: new Date().toISOString(),
        });
      }

      db.customizationImages.remove((i) => i.id === image.id);
      const { customization } = project;
      if (customization) {
        // Nouveaux objets : les fixtures sont partagees, ne jamais muter en place.
        const { banner, ...rest } = customization;
        db.projects.update((p) => p.id === project.id, {
          customization: {
            ...rest,
            ...(banner && banner.id !== image.id ? { banner } : {}),
            gallery: customization.gallery.filter(
              (item) => item.id !== image.id,
            ),
          },
          updatedAt: new Date().toISOString(),
        });
      }
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
