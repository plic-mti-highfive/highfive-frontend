// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { presetTheme } from "@shared/lib/projectThemePresets";
import type { ProjectTheme } from "@/domain";
import { ThemeEditor } from "./ThemeEditor";

afterEach(cleanup);

function Harness({ initial }: { initial?: ProjectTheme }) {
  const [value, setValue] = useState<ProjectTheme | undefined>(initial);
  return (
    <>
      <ThemeEditor value={value} onChange={setValue} />
      <div data-testid="value">{value ? JSON.stringify(value) : "defaut"}</div>
    </>
  );
}

const value = () => screen.getByTestId("value").textContent;
const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("ThemeEditor", () => {
  it("part sur « Par défaut » sans theme, sans champs de couleur", () => {
    render(<Harness />);
    expect(pressed("Par défaut")).toBe("true");
    expect(screen.queryByTestId("theme-colors")).toBeNull();
    expect(value()).toBe("defaut");
  });

  it("propose six palettes nommees en texte et les applique en entier", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    for (const label of [
      "Papier",
      "Forêt",
      "Bonbon",
      "Nuit",
      "Océan",
      "Terminal",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    await user.click(screen.getByRole("button", { name: "Nuit" }));
    expect(value()).toBe(JSON.stringify(presetTheme("nuit")));
    expect(pressed("Nuit")).toBe("true");
    expect(pressed("Par défaut")).toBe("false");
    expect(screen.getByTestId("theme-colors")).toBeTruthy();
  });

  it("affiche les quatre couleurs avec leur role en clair", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Papier" }));
    const theme = presetTheme("papier");
    expect(
      (screen.getByLabelText("Fond de la page") as HTMLInputElement).value,
    ).toBe(theme.background);
    expect(
      (screen.getByLabelText("Fond des blocs") as HTMLInputElement).value,
    ).toBe(theme.panel);
    expect((screen.getByLabelText("Texte") as HTMLInputElement).value).toBe(
      theme.text,
    );
    expect((screen.getByLabelText("Accent") as HTMLInputElement).value).toBe(
      theme.accent,
    );
  });

  it("modifier une couleur garde les trois autres et sort du preset", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetTheme("ocean")} />);
    const accent = screen.getByLabelText("Accent") as HTMLInputElement;
    await user.clear(accent);
    await user.type(accent, "ff0000");
    expect(value()).toBe(
      JSON.stringify({ ...presetTheme("ocean"), accent: "#ff0000" }),
    );
    expect(pressed("Océan")).toBe("false");
    expect(screen.getByText("Palette personnalisée")).toBeTruthy();
  });

  it("accepte une couleur du selecteur natif", () => {
    render(<Harness initial={presetTheme("papier")} />);
    fireEvent.change(screen.getByLabelText("Fond de la page, sélecteur"), {
      target: { value: "#223344" },
    });
    expect(value()).toBe(
      JSON.stringify({ ...presetTheme("papier"), background: "#223344" }),
    );
  });

  it("n'ecrase pas la saisie en cours : le raccourci a 3 chiffres s'applique a la sortie du champ", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetTheme("papier")} />);
    const field = screen.getByLabelText("Texte") as HTMLInputElement;
    await user.clear(field);
    await user.type(field, "#f48");
    expect(field.value).toBe("#f48");
    expect(value()).toBe(JSON.stringify(presetTheme("papier")));
    await user.tab();
    expect(field.value).toBe("#ff4488");
  });

  it("signale un code invalide sans changer la couleur", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetTheme("papier")} />);
    const field = screen.getByLabelText("Accent") as HTMLInputElement;
    await user.clear(field);
    await user.type(field, "rouge");
    expect(screen.getByRole("alert").textContent).toContain("Code invalide");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(value()).toBe(JSON.stringify(presetTheme("papier")));
  });

  it("previent quand le texte est corrige automatiquement", () => {
    render(<Harness initial={{ ...presetTheme("papier"), text: "#eeeeee" }} />);
    expect(screen.getByRole("status").textContent).toContain("ajusté");
  });

  it("ne dit rien quand la palette est lisible", () => {
    render(<Harness initial={presetTheme("papier")} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("revient au theme du site, par « Par défaut » ou par le bouton dedie", async () => {
    const user = userEvent.setup();
    render(<Harness initial={presetTheme("foret")} />);
    await user.click(screen.getByRole("button", { name: "Par défaut" }));
    expect(value()).toBe("defaut");
    expect(screen.queryByTestId("theme-colors")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Terminal" }));
    await user.click(
      screen.getByRole("button", { name: "Revenir au thème du site" }),
    );
    expect(value()).toBe("defaut");
  });
});
