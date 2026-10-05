// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

afterEach(cleanup);

function fireBeforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("useUnsavedChangesGuard", () => {
  it("n'intervient pas tant qu'il n'y a pas de changement", () => {
    renderHook(() => useUnsavedChangesGuard(false));
    expect(fireBeforeUnload()).toBe(false);
  });

  it("demande confirmation avant de quitter quand il y a des changements", () => {
    renderHook(() => useUnsavedChangesGuard(true));
    expect(fireBeforeUnload()).toBe(true);
  });

  it("se desactive quand les changements sont enregistres ou au demontage", () => {
    const { rerender, unmount } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard(dirty),
      { initialProps: { dirty: true } },
    );
    expect(fireBeforeUnload()).toBe(true);
    rerender({ dirty: false });
    expect(fireBeforeUnload()).toBe(false);
    rerender({ dirty: true });
    expect(fireBeforeUnload()).toBe(true);
    unmount();
    expect(fireBeforeUnload()).toBe(false);
  });
});
