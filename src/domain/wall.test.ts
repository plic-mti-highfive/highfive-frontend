import { describe, expect, it } from "vitest";
import {
  acceptSuggestedTasksInputSchema,
  proposedTaskSchema,
  wallSessionSchema,
  wallSuggestionsSchema,
} from "./wall";

const ID = "00000000-0000-4000-8000-000000000001";

describe("wallSessionSchema", () => {
  const valid = {
    canvasId: "canvas-1",
    projectId: ID,
    websocketUrl: "ws://localhost:5391/ws",
    token: "jwt",
    role: "editor",
  };

  it("accepte une session complète", () => {
    expect(wallSessionSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un rôle inconnu ou un jeton vide", () => {
    expect(
      wallSessionSchema.safeParse({ ...valid, role: "owner" }).success,
    ).toBe(false);
    expect(wallSessionSchema.safeParse({ ...valid, token: "" }).success).toBe(
      false,
    );
  });
});

describe("proposedTaskSchema", () => {
  it("complète description et sourceHints absents", () => {
    expect(proposedTaskSchema.parse({ title: "Faire X" })).toEqual({
      title: "Faire X",
      description: "",
      sourceHints: [],
    });
  });

  it("borne le titre (1..120) et la description (<= 1000)", () => {
    expect(proposedTaskSchema.safeParse({ title: "" }).success).toBe(false);
    expect(
      proposedTaskSchema.safeParse({ title: "a".repeat(121) }).success,
    ).toBe(false);
    expect(
      proposedTaskSchema.safeParse({
        title: "a".repeat(120),
        description: "b".repeat(1000),
      }).success,
    ).toBe(true);
    expect(
      proposedTaskSchema.safeParse({
        title: "ok",
        description: "b".repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe("wallSuggestionsSchema", () => {
  it("accepte un Mur vide", () => {
    expect(
      wallSuggestionsSchema.safeParse({ tasks: [], empty: true }).success,
    ).toBe(true);
  });

  it("exige le drapeau empty", () => {
    expect(wallSuggestionsSchema.safeParse({ tasks: [] }).success).toBe(false);
  });
});

describe("acceptSuggestedTasksInputSchema", () => {
  const task = { title: "Une tâche", description: "", sourceHints: [] };

  it("exige entre 1 et 50 tâches", () => {
    expect(
      acceptSuggestedTasksInputSchema.safeParse({ tasks: [] }).success,
    ).toBe(false);
    expect(
      acceptSuggestedTasksInputSchema.safeParse({ tasks: [task] }).success,
    ).toBe(true);
    expect(
      acceptSuggestedTasksInputSchema.safeParse({
        tasks: Array.from({ length: 51 }, () => task),
      }).success,
    ).toBe(false);
  });
});
