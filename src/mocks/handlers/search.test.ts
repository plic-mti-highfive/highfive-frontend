import { beforeEach, describe, expect, it } from "vitest";
import { seedDb } from "../db";
import { demoDataset, PROJECT_OF_THE_MOMENT } from "../data";
import { alexRivera } from "../data/users";
import { buildDiscoverSections } from "./search";

/**
 * Selection des sections du fil Decouvrir (doc 12 E-01, retour utilisateur
 * "Decouvrir connecte trop pauvre"). Critere d'acceptation du lot : dans le
 * jeu de demo, pour alex.rivera ET pour un visiteur, chaque section rendue
 * affiche au moins 3 projets.
 */
describe("buildDiscoverSections", () => {
  beforeEach(() => {
    seedDb(demoDataset);
  });

  it("visiteur anonyme : uniquement les sections universelles, chacune avec 3 projets ou plus", () => {
    const sections = buildDiscoverSections(undefined);
    const ids = sections.map((s) => s.id);

    expect(ids).not.toContain("for_you");
    expect(ids).not.toContain("near_your_projects");
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      expect(section.items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("alex.rivera connecte : sections personnalisees presentes, chacune avec 3 projets ou plus", () => {
    const sections = buildDiscoverSections(alexRivera);
    const ids = sections.map((s) => s.id);

    expect(ids).toContain("for_you");
    expect(ids).toContain("starting");
    expect(ids).toContain("trending_highfives");
    expect(ids).toContain("needs_help");
    expect(ids).toContain("near_your_projects");
    for (const section of sections) {
      expect(section.items.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("le projet du moment n'apparait jamais dans une section", () => {
    for (const section of buildDiscoverSections(alexRivera)) {
      expect(section.items.some((p) => p.id === PROJECT_OF_THE_MOMENT.id)).toBe(
        false,
      );
    }
  });

  it("`for_you` ne retient que des projets partageant un theme suivi", () => {
    const forYou = buildDiscoverSections(alexRivera).find(
      (s) => s.id === "for_you",
    );
    expect(forYou).toBeDefined();
    for (const project of forYou!.items) {
      expect(project.tags.some((t) => alexRivera.interests.includes(t))).toBe(
        true,
      );
    }
  });
});
