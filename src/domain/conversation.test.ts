import { describe, expect, it } from "vitest";
import {
  conversationSchema,
  messageBodyUpdateInputSchema,
  messageCreateInputSchema,
} from "./conversation";

const uploadId = "11111111-1111-4111-8111-111111111111";

describe("messageCreateInputSchema (R-MSG8)", () => {
  it("accepte un texte seul", () => {
    expect(messageCreateInputSchema.safeParse({ body: "Salut" }).success).toBe(
      true,
    );
  });

  it("accepte une piece jointe sans texte", () => {
    const parsed = messageCreateInputSchema.safeParse({
      attachment: { kind: "upload", uploadId },
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse un message sans texte ni piece jointe", () => {
    expect(messageCreateInputSchema.safeParse({}).success).toBe(false);
    expect(messageCreateInputSchema.safeParse({ body: "" }).success).toBe(
      false,
    );
  });
});

describe("messageBodyUpdateInputSchema (R-MSG5)", () => {
  it("refuse de vider un message en le modifiant", () => {
    expect(messageBodyUpdateInputSchema.safeParse({ body: "" }).success).toBe(
      false,
    );
  });
});

describe("conversationSchema : plafond de participants", () => {
  const people = (count: number) =>
    Array.from(
      { length: count },
      (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    );
  const base = {
    id: uploadId,
    createdAt: "2026-01-15T10:00:00.000Z",
  };

  it("R-MSG2 : un groupe plafonne a 50", () => {
    expect(
      conversationSchema.safeParse({
        ...base,
        type: "group",
        participantIds: people(51),
      }).success,
    ).toBe(false);
  });

  it("R-MSG3 : un canal suit son equipe, sans plafond", () => {
    expect(
      conversationSchema.safeParse({
        ...base,
        type: "channel",
        projectId: uploadId,
        participantIds: people(120),
      }).success,
    ).toBe(true);
  });
});
