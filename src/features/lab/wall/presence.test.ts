import { describe, expect, it } from "vitest";
import { presencesFromAwareness } from "./presence";

const PAGE = "page:page";

describe("presencesFromAwareness", () => {
  it("ignore sa propre présence et les états invalides", () => {
    const states = new Map<number, Record<string, unknown>>([
      [1, { presence: validState("moi") }],
      [2, { presence: validState("camille") }],
      [3, { presence: { userId: 42 } }],
      [4, {}],
    ]);

    const records = presencesFromAwareness(states, 1, 1000);

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      typeName: "instance_presence",
      userName: "camille",
      currentPageId: PAGE,
      cursor: { x: 10, y: 20 },
    });
  });

  it("accepte un curseur absent (null)", () => {
    const states = new Map<number, Record<string, unknown>>([
      [2, { presence: { ...validState("camille"), cursor: null } }],
    ]);
    expect(presencesFromAwareness(states, 1, 0)[0]).toMatchObject({
      cursor: null,
    });
  });
});

function validState(name: string) {
  return {
    userId: `user-${name}`,
    name,
    color: "hsl(10 70% 50%)",
    cursor: { x: 10, y: 20 },
    pageId: PAGE,
    selectedShapeIds: [],
  };
}
