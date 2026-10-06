// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommentWithAuthor } from "@/api/comments";
import { CommentItem } from "./CommentItem";

vi.mock("./ReportDialog", () => ({
  ReportDialog: ({ onSent }: { onSent: () => void }) => (
    <button type="button" onClick={onSent}>
      REPORT-DIALOG
    </button>
  ),
}));

afterEach(cleanup);

const COMMENT: CommentWithAuthor = {
  id: "00000000-0000-4000-8000-000000000501",
  projectId: "00000000-0000-4000-8000-000000000100",
  authorId: "00000000-0000-4000-8000-000000000301",
  body: "Est-ce qu'il faut apporter ses pinceaux ?",
  publishedAt: "2026-09-08T10:00:00.000Z",
  hidden: false,
  author: {
    id: "00000000-0000-4000-8000-000000000301",
    username: "thomas.dupont",
    avatar: "https://example.test/a.png",
  } as CommentWithAuthor["author"],
};

type Props = Partial<Parameters<typeof CommentItem>[0]>;

function setup(props: Props = {}) {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <CommentItem comment={COMMENT} canReply canReport={false} {...props} />
    </MemoryRouter>,
  );
  return user;
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", {
      name: "Actions sur le commentaire de @thomas.dupont",
    }),
  );
}

describe("CommentItem — menu d'actions", () => {
  it("ne propose que « Copier le lien » sans droit particulier", async () => {
    const user = setup();
    await openMenu(user);
    expect(
      await screen.findByRole("menuitem", { name: "Copier le lien" }),
    ).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Signaler" })).toBeNull();
    expect(
      screen.queryByRole("menuitem", { name: "Masquer le commentaire" }),
    ).toBeNull();
  });

  it("propose « Signaler » a une personne connectee qui n'en est pas l'auteur", async () => {
    const user = setup({ canReport: true });
    await openMenu(user);
    await user.click(await screen.findByRole("menuitem", { name: "Signaler" }));
    await user.click(screen.getByText("REPORT-DIALOG"));
    expect(screen.getByRole("status").textContent).toBe("Signalement envoyé");
  });

  it("masque apres confirmation, jamais directement", async () => {
    const onHide = vi.fn();
    const user = setup({ onHide });
    await openMenu(user);
    await user.click(
      await screen.findByRole("menuitem", { name: "Masquer le commentaire" }),
    );
    expect(onHide).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Masquer ce commentaire ?")).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Masquer" }));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("copie le lien du commentaire et le confirme", async () => {
    const user = setup();
    await openMenu(user);
    await user.click(
      await screen.findByRole("menuitem", { name: "Copier le lien" }),
    );
    // `userEvent.setup()` remplace le presse-papiers par un double lisible.
    expect(await navigator.clipboard.readText()).toContain(
      `#comment-${COMMENT.id}`,
    );
    expect(await screen.findByText("Lien copié")).toBeTruthy();
  });
});

describe("CommentItem — reponses", () => {
  it("rend une mention en tete de message comme un lien vers le profil", () => {
    setup({
      comment: { ...COMMENT, body: "@alex.rivera Parfait, viens à 9 h." },
      isReply: true,
    });
    const mention = screen.getByRole("link", { name: "@alex.rivera" });
    expect(mention.getAttribute("href")).toBe("/u/alex.rivera");
  });

  it("pre-remplit la mention en repondant a une reponse, pas a un commentaire racine", async () => {
    const onReply = vi.fn();
    const user = setup({ isReply: true, onReply });
    await user.click(screen.getByRole("button", { name: "Répondre" }));
    const field = screen.getByLabelText("Répondre à @thomas.dupont");
    expect((field as HTMLTextAreaElement).value).toBe("@thomas.dupont ");
    await user.type(field, "Oui !");
    await user.click(screen.getAllByRole("button", { name: "Répondre" })[1]);
    expect(onReply).toHaveBeenCalledWith("@thomas.dupont Oui !");
  });

  it("n'ajoute pas de mention en repondant a un commentaire racine", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Répondre" }));
    expect(
      (
        screen.getByLabelText(
          "Répondre à @thomas.dupont",
        ) as HTMLTextAreaElement
      ).value,
    ).toBe("");
  });
});
