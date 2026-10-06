// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectInfoDraft } from "../../lib/projectInfo";
import { InfoEditor } from "./InfoEditor";

vi.mock("../TagPicker", () => ({ TagPicker: () => null }));

afterEach(cleanup);

const NEED_ID = "00000000-0000-4000-8000-000000000301";

function Harness() {
  const [value, setValue] = useState<ProjectInfoDraft>({
    title: "Projet",
    tagline: "Accroche",
    description: "",
    tags: ["dessin"],
    needs: [
      { id: NEED_ID, label: "quelqu'un pour la photo", fulfilled: false },
    ],
  });
  return (
    <>
      <InfoEditor value={value} onChange={setValue} showIssues={false} />
      <pre data-testid="needs">{JSON.stringify(value.needs)}</pre>
    </>
  );
}

const needs = () =>
  JSON.parse(screen.getByTestId("needs").textContent ?? "[]") as {
    label: string;
    fulfilled: boolean;
  }[];

describe("InfoEditor — profils recherches", () => {
  it("marque un profil comme pourvu et le retire", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("checkbox", { name: "Pourvu" }));
    expect(needs()[0].fulfilled).toBe(true);
    await user.click(
      screen.getByRole("button", {
        name: "Retirer « quelqu'un pour la photo »",
      }),
    );
    expect(needs()).toEqual([]);
  });

  it("ajoute un profil avec Entree, et seulement a partir de 3 caracteres", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const add = screen.getByRole("button", { name: "Ajouter" });
    const input = screen.getByLabelText("Nouveau profil recherché");
    await user.type(input, "ab");
    expect((add as HTMLButtonElement).disabled).toBe(true);
    await user.type(input, "c{Enter}");
    expect(needs().map((need) => need.label)).toEqual([
      "quelqu'un pour la photo",
      "abc",
    ]);
    expect((input as HTMLInputElement).value).toBe("");
  });
});
