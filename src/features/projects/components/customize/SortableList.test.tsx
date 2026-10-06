// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { createElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DragEndEvent, DndContextProps } from "@dnd-kit/core";
import { SortableList } from "./SortableList";

// On capture les props du DndContext : jsdom ne fait pas de mise en page, le
// vrai glisser (collisions, rectangles) n'y est pas simulable. Le glisser
// lui-meme est celui de dnd-kit ; ici on teste notre logique : depot,
// annonces et consignes francaises, poignee.
const captured = vi.hoisted(() => ({ props: undefined as unknown }));
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...original,
    DndContext: (props: DndContextProps) => {
      captured.props = props;
      return createElement(original.DndContext, props);
    },
  };
});

afterEach(cleanup);

interface Row {
  id: string;
  name: string;
}
const ROWS: Row[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

function Harness({ onReorder }: { onReorder?: (rows: Row[]) => void }) {
  const [rows, setRows] = useState(ROWS);
  return (
    <>
      <SortableList
        items={rows}
        getLabel={(row) => row.name}
        onReorder={(next) => {
          setRows(next);
          onReorder?.(next);
        }}
        renderItem={(row, index, handle) => (
          <div>
            {handle}
            <span>
              {index + 1}. {row.name}
            </span>
          </div>
        )}
      />
      <div data-testid="order">{rows.map((r) => r.id).join(",")}</div>
    </>
  );
}

const order = () => screen.getByTestId("order").textContent;
const props = () => captured.props as DndContextProps;
function drop(activeId: string, overId: string | null) {
  act(() => {
    props().onDragEnd?.({
      active: { id: activeId },
      over: overId ? { id: overId } : null,
    } as unknown as DragEndEvent);
  });
}

describe("SortableList", () => {
  it("rend une poignee nommee par element, dans l'ordre", () => {
    render(<Harness />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    for (const name of ["Alpha", "Beta", "Gamma"]) {
      expect(
        screen.getByRole("button", {
          name: `Réordonner « ${name} » (glisser)`,
        }),
      ).toBeTruthy();
    }
  });

  it("deplace l'element depose a la position de celui qui est dessous", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);
    drop("a", "c");
    expect(order()).toBe("b,c,a");
    expect(onReorder).toHaveBeenCalledTimes(1);
    drop("c", "b");
    expect(order()).toBe("c,b,a");
    expect(screen.getByText("1. Gamma")).toBeTruthy();
  });

  it("ne fait rien si on depose sur place ou hors de la liste", () => {
    const onReorder = vi.fn();
    render(<Harness onReorder={onReorder} />);
    drop("b", "b");
    drop("b", null);
    drop("inconnu", "a");
    drop("a", "inconnu");
    expect(order()).toBe("a,b,c");
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("donne des annonces et une consigne en francais", () => {
    render(<Harness />);
    const { announcements, screenReaderInstructions } = props().accessibility!;
    const event = (active: string, over?: string) =>
      ({
        active: { id: active },
        over: over ? { id: over } : null,
      }) as never;
    expect(announcements!.onDragStart!(event("b"))).toBe(
      "Beta saisi, position 2 sur 3.",
    );
    expect(announcements!.onDragOver!(event("b", "c"))).toBe(
      "Beta déplacé en position 3 sur 3.",
    );
    expect(announcements!.onDragOver!(event("b"))).toBe(
      "Beta n'est plus au-dessus d'une position.",
    );
    expect(announcements!.onDragEnd!(event("b", "a"))).toBe(
      "Beta déposé en position 1 sur 3.",
    );
    expect(announcements!.onDragEnd!(event("b"))).toBe(
      "Beta déposé à sa position d'origine.",
    );
    expect(announcements!.onDragCancel!(event("b"))).toBe(
      "Déplacement annulé. Beta reste en position 2 sur 3.",
    );
    expect(screenReaderInstructions!.draggable).toMatch(/Espace/);
    expect(screenReaderInstructions!.draggable).toMatch(/Échap/);
  });

  it("n'applique aucune transition aux elements (pas d'animation)", () => {
    render(<Harness />);
    for (const row of screen.getAllByRole("listitem")) {
      expect(row.style.transition).toBe("");
    }
    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toContain("transition-none");
    }
  });

  it("n'expose le glisser que sur la poignee (touch-none, curseur grab)", () => {
    render(<Harness />);
    const handle = screen.getByRole("button", {
      name: "Réordonner « Alpha » (glisser)",
    });
    expect(handle.className).toContain("touch-none");
    expect(handle.className).toContain("cursor-grab");
    expect(handle.getAttribute("aria-roledescription")).toBe("sortable");
    expect(
      screen.getAllByRole("listitem")[0].getAttribute("aria-roledescription"),
    ).toBeNull();
  });
});
