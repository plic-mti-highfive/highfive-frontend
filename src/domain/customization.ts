import { z } from "zod";
import { idSchema } from "./common";
import { tagAccentSchema } from "./tag";

/**
 * Personnalisation de la fiche projet (docs/v2/customization-scope.md).
 * Reservee au porteur ; optionnelle : `Project.customization` absent = fiche
 * par defaut (accent hache depuis l'id, sections dans l'ordre par defaut,
 * ni banniere ni galerie).
 *
 * Pas de CSS ni de couleur libre : l'accent est l'une des six teintes de la
 * roue (`tagAccentSchema`), les images passent par l'API d'upload.
 */

/** Nombre maximal d'images dans la galerie d'un projet. */
export const MAX_GALLERY_IMAGES = 8;

/**
 * URL d'image : http(s) (backend reel) ou `data:image/` (mock MSW).
 * Jamais `javascript:` ni un autre schema.
 */
const imageUrlSchema = z
  .string()
  .regex(/^(https?:\/\/|data:image\/)/, "url d'image invalide");

/**
 * Champs communs d'une image personnalisee. Accessibilite : un texte
 * alternatif est obligatoire, sauf si le porteur declare l'image decorative
 * (`decorative: true`, rendue avec `alt=""`).
 */
const imageFields = {
  id: idSchema,
  url: imageUrlSchema,
  alt: z.string().max(200),
  decorative: z.boolean(),
};

function assertAltOrDecorative(
  image: { alt: string; decorative: boolean },
  ctx: z.RefinementCtx,
) {
  if (!image.decorative && image.alt.trim().length === 0) {
    ctx.addIssue({
      code: "custom",
      message:
        "Un texte alternatif est requis, sauf si l'image est decorative.",
      path: ["alt"],
    });
  }
}

/** Reponse de `POST /projects/:slug/customization/images` : l'image est televersee, pas encore referencee. */
export const customizationImageUploadSchema = z.object({
  id: idSchema,
  url: imageUrlSchema,
});
export type CustomizationImageUpload = z.infer<
  typeof customizationImageUploadSchema
>;

/** Point focal de la banniere, en pourcentage (0 = bord haut/gauche, 100 = bord bas/droit). */
export const bannerFocalSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});
export type BannerFocal = z.infer<typeof bannerFocalSchema>;

export const projectBannerSchema = z
  .object({ ...imageFields, focal: bannerFocalSchema })
  .superRefine(assertAltOrDecorative);
export type ProjectBanner = z.infer<typeof projectBannerSchema>;

export const galleryItemSchema = z
  .object({ ...imageFields, caption: z.string().max(140).optional() })
  .superRefine(assertAltOrDecorative);
export type GalleryItem = z.infer<typeof galleryItemSchema>;

/** Sections de l'onglet Apercu que le porteur peut ordonner et masquer (la sidebar reste fixe). */
export const customizationSectionIdSchema = z.enum([
  "pinned",
  "about",
  "gallery",
  "comments",
]);
export type CustomizationSectionId = z.infer<
  typeof customizationSectionIdSchema
>;

export const customizationSectionSchema = z.object({
  id: customizationSectionIdSchema,
  visible: z.boolean(),
});
export type CustomizationSection = z.infer<typeof customizationSectionSchema>;

/** Ordre et visibilite par defaut : celui de la fiche d'un projet non personnalise. */
export const DEFAULT_SECTIONS: readonly CustomizationSection[] = [
  { id: "pinned", visible: true },
  { id: "about", visible: true },
  { id: "gallery", visible: true },
  { id: "comments", visible: true },
];

/**
 * Corps de `PATCH /projects/:slug/customization` (remplacement complet) et
 * champ `Project.customization`. Regles non representees dans le JSON Schema
 * (voir docs/v2/backend/SPEC.md) : `sections` contient chacune des quatre
 * sections exactement une fois ; les `id` de la galerie sont uniques.
 */
export const projectCustomizationSchema = z
  .object({
    banner: projectBannerSchema.optional(),
    accent: tagAccentSchema.optional(),
    sections: z.array(customizationSectionSchema).length(4),
    gallery: z.array(galleryItemSchema).max(MAX_GALLERY_IMAGES),
  })
  .superRefine((customization, ctx) => {
    const sectionIds = new Set(customization.sections.map((s) => s.id));
    if (sectionIds.size !== customizationSectionIdSchema.options.length) {
      ctx.addIssue({
        code: "custom",
        message:
          "Chaque section (pinned, about, gallery, comments) doit apparaitre exactement une fois.",
        path: ["sections"],
      });
    }
    const galleryIds = new Set(customization.gallery.map((item) => item.id));
    if (galleryIds.size !== customization.gallery.length) {
      ctx.addIssue({
        code: "custom",
        message: "Les images de la galerie doivent avoir des id distincts.",
        path: ["gallery"],
      });
    }
  });
export type ProjectCustomization = z.infer<typeof projectCustomizationSchema>;
