// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { presetColor } from "@shared/lib/accentPresets";
import { AccentPicker } from "./AccentPicker";

afterEach(cleanup);

function Harness({ initial }: { initial?: string }) {
  const [value, setValue] = useState<string | undefined>(initial);
  return (
    <>
      <AccentPicker value={value} onChange={setValue} />
      <div data-testid="value">{value ?? "auto"}</div>
    </>
  );
}

const value = () => screen.getByTestId("value").textContent;
const hexField = () =>
  screen.getByLabelText("Code couleur") as HTMLInputElement;

describe("AccentPicker", () => {
  it("part sur Automatique sans couleur choisie, et n'affiche pas d'apercu des themes", () => {
    render(<Harness />);
    expect(
      screen
        .getByRole("button", { name: "Automatique" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.queryByTestId("accent-preview")).toBeNull();
  });

  it("propose six couleurs rapides avec un libelle texte, et les applique", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const labels = [
      "Rose",
      "Orange",
      "Jaune",
      "Vert pomme",
      "Bleu ciel",
      "Violet",
    ];
    for (const label of labels) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    await user.click(screen.getByRole("button", { name: "Violet" }));
    expect(value()).toBe(presetColor("purple"));
    expect(
      screen
        .getByRole("button", { name: "Violet" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Automatique" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(hexField().value).toBe(presetColor("purple"));
  });

  it("accepte une couleur du selecteur natif", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Couleur"), {
      target: { value: presetColor("sky") },
    });
    expect(value()).toBe(presetColor("sky"));
  });

  it("applique un code a 6 chiffres des qu'il est complet, majuscules et sans # compris", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(hexField(), presetColor("rose").slice(1).toUpperCase());
    expect(value()).toBe(presetColor("rose"));
    expect(hexField().value).toBe(presetColor("rose"));
  });

  it("n'ecrase pas la saisie en cours : le raccourci a 3 chiffres s'applique a la sortie du champ", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(hexField(), "#f48");
    expect(hexField().value).toBe("#f48");
    expect(value()).toBe("auto");
    await user.tab();
    expect(value()).toBe("#ff4488");
    expect(hexField().value).toBe("#ff4488");
  });

  it("signale un code invalide sans changer la couleur", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetColor("sky")} />);
    await user.clear(hexField());
    await user.type(hexField(), "rouge");
    expect(screen.getByRole("alert").textContent).toContain("Code invalide");
    expect(hexField().getAttribute("aria-invalid")).toBe("true");
    expect(value()).toBe(presetColor("sky"));
  });

  it("montre l'apercu clair et sombre quand une couleur est choisie", () => {
    render(<Harness initial={presetColor("yellow")} />);
    expect(screen.getByTestId("accent-preview")).toBeTruthy();
    expect(screen.getByText("Thème clair")).toBeTruthy();
    expect(screen.getByText("Thème sombre")).toBeTruthy();
  });

  it("revient a Automatique", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetColor("sky")} />);
    await user.click(screen.getByRole("button", { name: "Automatique" }));
    expect(value()).toBe("auto");
    expect(hexField().value).toBe("");
    expect(screen.queryByTestId("accent-preview")).toBeNull();
  });
});
