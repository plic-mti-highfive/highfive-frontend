// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectSummary } from "@/domain";
import { ProjectsSection } from "./ProjectsSection";

const PROJECTS = [
  {
    id: "p1",
    slug: "fresque",
    title: "Fresque murale",
    tagline: "Un mur",
    state: "active",
    membersCount: 3,
    highfiveCount: 7,
    owner: { username: "alex" },
  },
  {
    id: "p2",
    slug: "jardin",
    title: "Jardin partage",
    tagline: "Des bacs",
    state: "draft",
    membersCount: 1,
    highfiveCount: 0,
    owner: { username: "camille" },
  },
] as unknown as ProjectSummary[];

vi.mock("@/api/queries/admin", () => ({
  useAdminProjectsInfinite: () => ({
    data: { pages: [{ items: PROJECTS }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
  useDeleteProjectAsAdmin: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("./ProjectMediaDialog", () => ({
  ProjectMediaDialog: ({
    project,
    onClose,
  }: {
    project: ProjectSummary;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="medias">
      Médias de {project.title}
      <button type="button" onClick={onClose}>
        fermer-medias
      </button>
    </div>
  ),
}));

afterEach(cleanup);

function setup() {
  render(
    <MemoryRouter>
      <ProjectsSection />
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe("ProjectsSection : medias", () => {
  it("propose un bouton Medias par projet", () => {
    setup();
    expect(screen.getAllByRole("button", { name: "Médias" })).toHaveLength(2);
  });

  it("ouvre la moderation des medias du projet de la ligne, puis la ferme", async () => {
    const user = setup();
    await user.click(screen.getAllByRole("button", { name: "Médias" })[1]);
    expect(screen.getByText("Médias de Jardin partage")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "fermer-medias" }));
    expect(screen.queryByRole("dialog", { name: "medias" })).toBeNull();
  });

  it("n'ouvre rien tant qu'on ne clique pas", () => {
    setup();
    expect(screen.queryByRole("dialog", { name: "medias" })).toBeNull();
  });
});
