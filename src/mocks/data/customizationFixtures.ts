import {
  DEFAULT_SECTIONS,
  type CustomizationSection,
  type ProjectCustomization,
} from "@/domain";
import { presetTheme } from "@shared/lib/projectThemePresets";
import type { DbCustomizationImage } from "../db";

/**
 * Personnalisations de demo (docs/v2/customization-scope.md). Images =
 * degrades SVG neutres encodes en data URL : pas de fausses photos
 * (PRODUCT.md, "Don't invent what isn't real"). Les id sont des uuid
 * litteraux (et non `nextId()`) pour ne pas decaler les id des autres
 * fixtures ; ils vivent dans la plage `...-8c0d-...`.
 */

function gradient(from: string, to: string, width: number, height: number) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    `</linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function imageId(n: number): string {
  return `00000000-0000-4000-8c0d-${n.toString(16).padStart(12, "0")}`;
}

function sections(order: CustomizationSection["id"][], hidden: string[] = []) {
  return order.map((id) => ({ id, visible: !hidden.includes(id) }));
}

interface FixtureImage {
  n: number;
  url: string;
}

const IMAGES = {
  fresqueBanner: {
    n: 1,
    url: gradient("rgb(255, 77, 140)", "rgb(255, 208, 226)", 1600, 533),
  },
  fresqueMur: {
    n: 2,
    url: gradient("rgb(255, 208, 226)", "rgb(204, 0, 85)", 1200, 800),
  },
  fresqueAtelier: {
    n: 3,
    url: gradient("rgb(255, 107, 26)", "rgb(255, 214, 0)", 1200, 800),
  },
  jardinGalerie: {
    n: 4,
    url: gradient("rgb(94, 214, 81)", "rgb(237, 252, 232)", 1200, 800),
  },
  mareeBanner: {
    n: 5,
    url: gradient("rgb(62, 198, 245)", "rgb(5, 64, 96)", 1600, 533),
  },
  mareeCapture1: {
    n: 6,
    url: gradient("rgb(176, 232, 250)", "rgb(10, 96, 128)", 1200, 800),
  },
  mareeCapture2: {
    n: 7,
    url: gradient("rgb(5, 64, 96)", "rgb(194, 75, 255)", 1200, 800),
  },
} satisfies Record<string, FixtureImage>;

/** Personnalisation par slug de projet (porteur de demo : Alex Rivera, fresque murale). */
export const CUSTOMIZATIONS: Record<string, ProjectCustomization> = {
  // Banniere + galerie + palette Bonbon, ordre par defaut.
  "fresque-murale-collaborative": {
    banner: {
      id: imageId(IMAGES.fresqueBanner.n),
      url: IMAGES.fresqueBanner.url,
      alt: "Dégradé rose évoquant les couleurs de la fresque",
      decorative: false,
      focal: { x: 50, y: 50 },
    },
    theme: presetTheme("bonbon"),
    sections: [...DEFAULT_SECTIONS],
    gallery: [
      {
        id: imageId(IMAGES.fresqueMur.n),
        url: IMAGES.fresqueMur.url,
        alt: "Aplat de rose et de rouge, premier jet du mur",
        decorative: false,
        caption: "Premier jet de la palette",
      },
      {
        id: imageId(IMAGES.fresqueAtelier.n),
        url: IMAGES.fresqueAtelier.url,
        alt: "",
        decorative: true,
        caption: "Atelier du samedi",
      },
    ],
  },
  // Pas de banniere : palette Forêt et sections reordonnees (A propos en premier).
  "jardin-partage-derriere-lecole": {
    theme: presetTheme("foret"),
    sections: sections(["about", "pinned", "gallery", "comments"]),
    gallery: [
      {
        id: imageId(IMAGES.jardinGalerie.n),
        url: IMAGES.jardinGalerie.url,
        alt: "Dégradé vert évoquant les bacs du jardin",
        decorative: false,
      },
    ],
  },
  // Banniere decentree (point focal), palette Océan, galerie avant l'annonce epinglee, commentaires masques.
  "maree-basse-jeu-video": {
    banner: {
      id: imageId(IMAGES.mareeBanner.n),
      url: IMAGES.mareeBanner.url,
      alt: "Dégradé bleu profond, comme l'eau d'un fond marin",
      decorative: false,
      focal: { x: 20, y: 70 },
    },
    theme: presetTheme("ocean"),
    sections: sections(
      ["about", "gallery", "pinned", "comments"],
      ["comments"],
    ),
    gallery: [
      {
        id: imageId(IMAGES.mareeCapture1.n),
        url: IMAGES.mareeCapture1.url,
        alt: "Capture d'écran fictive : premier niveau sous l'eau",
        decorative: false,
        caption: "Premier niveau",
      },
      {
        id: imageId(IMAGES.mareeCapture2.n),
        url: IMAGES.mareeCapture2.url,
        alt: "Capture d'écran fictive : grotte violette",
        decorative: false,
        caption: "La grotte",
      },
    ],
  },
};

/** Enregistrements d'images du store mock correspondant aux fixtures (sinon un PATCH qui les reference serait refuse). */
export function buildCustomizationImages(
  projectIdBySlug: Map<string, string>,
): DbCustomizationImage[] {
  const records: DbCustomizationImage[] = [];
  for (const [slug, customization] of Object.entries(CUSTOMIZATIONS)) {
    const projectId = projectIdBySlug.get(slug);
    if (!projectId) continue;
    const images = [
      ...(customization.banner ? [customization.banner] : []),
      ...customization.gallery,
    ];
    for (const image of images) {
      records.push({
        id: image.id,
        projectId,
        url: image.url,
        size: image.url.length,
        mimeType: "image/svg+xml",
      });
    }
  }
  return records;
}
