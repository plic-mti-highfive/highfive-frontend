// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommentWithAuthor } from "@/api/comments";
import { CommentThread } from "./CommentThread";

vi.mock("./ReportDialog", () => ({ ReportDialog: () => null }));

afterEach(cleanup);

function comment(
  n: number,
  username: string,
  overrides: Partial<CommentWithAuthor> = {},
): CommentWithAuthor {
  return {
    id: `00000000-0000-4000-8000-00000000050${n}`,
    projectId: "00000000-0000-4000-8000-000000000100",
    authorId: `00000000-0000-4000-8000-00000000030${n}`,
    body: `Message ${n}`,
    publishedAt: "2026-09-08T10:00:00.000Z",
    hidden: false,
    author: { id: `u${n}`, username } as CommentWithAuthor["author"],
    ...overrides,
  };
}

const ROOT = comment(1, "sophie.martin");
const REPLIES = [
  comment(2, "alex.rivera", { parentId: ROOT.id }),
  comment(3, "marc.leroy", { parentId: ROOT.id }),
];

function setup(props: Partial<Parameters<typeof CommentThread>[0]> = {}) {
  const onReply = vi.fn();
  const onHide = vi.fn();
  render(
    <MemoryRouter>
      <CommentThread
        root={ROOT}
        replies={REPLIES}
        currentUserId="viewer"
        canReply
        canModerate={false}
        onReply={onReply}
        onHide={onHide}
        isSubmittingReply={false}
        {...props}
      />
    </MemoryRouter>,
  );
  return { user: userEvent.setup(), onReply, onHide };
}

describe("CommentThread", () => {
  it("replie les reponses derriere un compteur, et les deplie au clic", async () => {
    const { user } = setup();
    expect(screen.queryByText("Message 2")).toBeNull();
    const toggle = screen.getByRole("button", { name: "2 réponses" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    await user.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Message 2")).toBeTruthy();
    expect(screen.getByText("Message 3")).toBeTruthy();

    await user.click(toggle);
    expect(screen.queryByText("Message 2")).toBeNull();
  });

  it("accorde le compteur au singulier et n'affiche rien sans reponse", () => {
    setup({ replies: [REPLIES[0]] });
    expect(screen.getByRole("button", { name: "1 réponse" })).toBeTruthy();
    cleanup();
    setup({ replies: [] });
    expect(screen.queryByRole("button", { name: /réponse/ })).toBeNull();
  });

  it("ouvre d'emblee le fil dont une reponse est la cible du lien", () => {
    setup({ targetId: REPLIES[1].id });
    expect(screen.getByText("Message 3")).toBeTruthy();
  });

  it("rattache une reponse a une reponse au commentaire racine et deplie le fil", async () => {
    const { user, onReply } = setup();
    await user.click(screen.getByRole("button", { name: "2 réponses" }));
    const replyButtons = screen.getAllByRole("button", { name: "Répondre" });
    // 1er : commentaire racine ; suivants : les reponses.
    await user.click(replyButtons[1]);
    await user.type(screen.getByLabelText("Répondre à @alex.rivera"), "Merci");
    const form = screen.getByRole("article", {
      name: "Commentaire de @alex.rivera",
    });
    await user.click(
      within(form).getAllByRole("button", { name: "Répondre" })[1],
    );
    expect(onReply).toHaveBeenCalledWith(ROOT.id, "@alex.rivera Merci");
  });

  it("n'offre « Masquer » qu'avec le droit de moderation, et « Signaler » pas sur ses propres commentaires", async () => {
    const { user, onHide } = setup({
      canModerate: true,
      currentUserId: ROOT.authorId,
    });
    await user.click(
      screen.getByRole("button", {
        name: "Actions sur le commentaire de @sophie.martin",
      }),
    );
    await screen.findByRole("menuitem", { name: "Copier le lien" });
    expect(screen.queryByRole("menuitem", { name: "Signaler" })).toBeNull();
    await user.click(
      await screen.findByRole("menuitem", { name: "Masquer le commentaire" }),
    );
    await user.click(screen.getByRole("button", { name: "Masquer" }));
    expect(onHide).toHaveBeenCalledWith(ROOT.id);
  });
});
