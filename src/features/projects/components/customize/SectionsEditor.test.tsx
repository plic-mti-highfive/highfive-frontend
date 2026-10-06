// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_SECTIONS, type CustomizationSection } from "@/domain";
import { SectionsEditor } from "./SectionsEditor";

afterEach(cleanup);

function Harness({ initial = [...DEFAULT_SECTIONS] }) {
  const [sections, setSections] = useState<CustomizationSection[]>(initial);
  return (
    <>
      <SectionsEditor sections={sections} onChange={setSections} />
      <div data-testid="state">
        {sections.map((s) => `${s.id}:${s.visible ? "on" : "off"}`).join(",")}
      </div>
    </>
  );
}

const state = () => screen.getByTestId("state").textContent;

describe("SectionsEditor", () => {
  it("liste les sections dans l'ordre avec leur visibilite", () => {
    render(<Harness />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText("Annonce épinglée")).toBeTruthy();
    expect(within(items[3]).getByText("Commentaires")).toBeTruthy();
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });

  it("descend et monte une section avec les boutons, et l'annonce", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(
      screen.getByRole("button", { name: "Descendre « Annonce épinglée »" }),
    );
    expect(state()).toBe("about:on,pinned:on,gallery:on,comments:on");
    expect(
      screen.getByText("Annonce épinglée déplacée en position 2 sur 4."),
    ).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Monter « Galerie »" }),
    );
    expect(state()).toBe("about:on,gallery:on,pinned:on,comments:on");
    expect(
      screen.getByText("Galerie déplacée en position 2 sur 4."),
    ).toBeTruthy();
  });

  it("laisse les boutons des extremites focusables mais sans effet", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const up = screen.getByRole("button", {
      name: "Monter « Annonce épinglée »",
    });
    const down = screen.getByRole("button", {
      name: "Descendre « Commentaires »",
    });
    expect(
      up.getAttribute("aria-disabled") ?? up.getAttribute("disabled"),
    ).not.toBeNull();
    expect(
      down.getAttribute("aria-disabled") ?? down.getAttribute("disabled"),
    ).not.toBeNull();
    await user.click(up);
    await user.click(down);
    expect(state()).toBe("pinned:on,about:on,gallery:on,comments:on");
    up.focus();
    expect(document.activeElement).toBe(up);
  });

  it("garde le focus sur le bouton apres un deplacement", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const down = screen.getByRole("button", { name: "Descendre « À propos »" });
    await user.click(down);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Descendre « À propos »" }),
    );
  });

  it("masque et reaffiche une section avec sa case", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const gallery = screen.getByRole("checkbox", { name: "Galerie" });
    await user.click(gallery);
    expect(state()).toBe("pinned:on,about:on,gallery:off,comments:on");
    await user.click(gallery);
    expect(state()).toBe("pinned:on,about:on,gallery:on,comments:on");
  });
});
