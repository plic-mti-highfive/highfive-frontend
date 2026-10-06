import { describe, expect, it } from "vitest";
import { projectSchema } from "@/domain";
import {
  applyInfoDraft,
  getInfoIssues,
  isInfoDirty,
  toInfoDraft,
  toUpdateInput,
} from "./projectInfo";

const project = projectSchema.parse({
  id: "00000000-0000-4000-8000-000000000100",
  slug: "projet-test",
  title: "Projet test",
  tagline: "Une accroche",
  tags: ["dessin"],
  visibility: "public",
  participation: "open",
  state: "active",
  ownerId: "00000000-0000-4000-8000-000000000200",
  highfiveCount: 0,
  createdAt: "2026-09-01T10:00:00.000Z",
  updatedAt: "2026-09-01T10:00:00.000Z",
  lastActivityAt: "2026-09-01T10:00:00.000Z",
});

describe("projectInfo", () => {
  it("part du projet sans modification", () => {
    expect(isInfoDirty(toInfoDraft(project), project)).toBe(false);
    expect(
      isInfoDirty({ ...toInfoDraft(project), title: "Autre" }, project),
    ).toBe(true);
  });

  it("liste les champs a corriger dans l'ordre de la page", () => {
    const issues = getInfoIssues({
      ...toInfoDraft(project),
      title: " a ",
      tagline: "  ",
      tags: [],
    });
    expect(issues.map((issue) => issue.label)).toEqual([
      "Titre",
      "Accroche",
      "Thèmes",
    ]);
    expect(getInfoIssues(toInfoDraft(project))).toEqual([]);
  });

  it("nettoie les textes et retire une description vide", () => {
    const draft = {
      ...toInfoDraft(project),
      title: "  Titre  ",
      description: "   ",
    };
    expect(toUpdateInput(draft)).toMatchObject({
      title: "Titre",
      description: undefined,
    });
    expect(applyInfoDraft(project, draft).title).toBe("Titre");
  });
});
