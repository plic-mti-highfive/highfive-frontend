import { describe, expect, it } from "vitest";
import { scrollScope } from "./scrollScope";

describe("scrollScope", () => {
  it("regroupe les onglets d'une meme fiche projet", () => {
    const base = scrollScope("/projets/repair-cafe");
    expect(scrollScope("/projets/repair-cafe/annonces")).toBe(base);
    expect(scrollScope("/projets/repair-cafe/equipe")).toBe(base);
    expect(scrollScope("/projets/repair-cafe/equipe/")).toBe(base);
  });

  it("distingue deux projets et les pages hors onglets", () => {
    expect(scrollScope("/projets/a")).not.toBe(scrollScope("/projets/b"));
    expect(scrollScope("/projets/a/lab")).not.toBe(scrollScope("/projets/a"));
    expect(scrollScope("/recherche")).toBe("/recherche");
  });
});
