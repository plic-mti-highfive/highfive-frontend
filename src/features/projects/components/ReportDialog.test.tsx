// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";
import { ReportDialog } from "./ReportDialog";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  error: null as unknown,
}));

vi.mock("@/api/queries/reports", () => ({
  useCreateReport: () => ({
    mutate: mocks.mutate,
    isPending: false,
    error: mocks.error,
  }),
}));

afterEach(() => {
  cleanup();
  mocks.mutate.mockReset();
  mocks.error = null;
});

const TARGET = "00000000-0000-4000-8000-000000000501";

function setup() {
  const onOpenChange = vi.fn();
  const onSent = vi.fn();
  render(
    <ReportDialog
      open
      onOpenChange={onOpenChange}
      targetType="comment"
      targetId={TARGET}
      subject="ce commentaire"
      onSent={onSent}
    />,
  );
  return { user: userEvent.setup(), onOpenChange, onSent };
}

describe("ReportDialog", () => {
  it("exige un motif avant d'envoyer", async () => {
    const { user } = setup();
    const send = screen.getByRole("button", { name: "Envoyer le signalement" });
    expect((send as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("radio", { name: "Spam" }));
    expect((send as HTMLButtonElement).disabled).toBe(false);
  });

  it("envoie la cible, le motif et la precision, puis ferme et prévient", async () => {
    const { user, onOpenChange, onSent } = setup();
    await user.click(screen.getByRole("radio", { name: "Harcèlement" }));
    await user.type(
      screen.getByLabelText("Précision (facultative)"),
      "  Insultes répétées  ",
    );
    await user.click(
      screen.getByRole("button", { name: "Envoyer le signalement" }),
    );

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const [input, options] = mocks.mutate.mock.calls[0] as [
      unknown,
      { onSuccess: () => void },
    ];
    expect(input).toEqual({
      targetType: "comment",
      targetId: TARGET,
      reason: "harassment",
      detail: "Insultes répétées",
    });
    options.onSuccess();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSent).toHaveBeenCalledTimes(1);
  });

  it("affiche le message du serveur quand le signalement est refusé", () => {
    mocks.error = new ApiError(
      409,
      "conflict",
      "Tu as déjà signalé ce contenu.",
    );
    setup();
    expect(screen.getByRole("alert").textContent).toBe(
      "Tu as déjà signalé ce contenu.",
    );
  });
});
