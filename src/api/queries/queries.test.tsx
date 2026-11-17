// @vitest-environment jsdom
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/client";
import { tokenStorage } from "@/api/token-storage";
import { apiUrl } from "@/mocks/handlers/utils";
import { getDb } from "@/mocks/db";
import { loginAs, recordRequests, server, setupMswServer } from "@/test/msw";
import { createTestQueryClient } from "@/test/render";
import { useLogin, useLogout, useSession } from "./auth";
import {
  useAcceptJoinRequest,
  useCreateJoinRequest,
  useJoinRequests,
  useMembers,
} from "./memberships";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "./notifications";
import { useProject, useProjects } from "./projects";
import {
  useColumns,
  useCreateTask,
  useMoveTask,
  useTasks,
  useUpdateTask,
} from "./tasks";
import { queryKeys } from "./keys";

setupMswServer();

const ALEX = "alex.rivera@example.com";
const YANIS = "yanis.f@example.com";
const FRESQUE = "fresque-murale-collaborative";
const JARDIN = "jardin-partage-derriere-lecole";

function setup() {
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

function isInvalidated(client: QueryClient, key: readonly unknown[]) {
  return client.getQueryState(key)?.isInvalidated ?? false;
}

describe("queries/auth", () => {
  it("useLogin : stocke le jeton, alimente le cache de session", async () => {
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ email: ALEX, password: "demo1234" }),
    );
    expect(tokenStorage.getAccessToken()).toBeTruthy();
    expect(
      client.getQueryData<{ username: string }>(queryKeys.auth.me())?.username,
    ).toBe("alex.rivera");
  });

  it("useLogin : identifiants faux -> ApiError 401, aucun jeton", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current
        .mutateAsync({ email: ALEX, password: "mauvais-mot-de-passe" })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).status).toBe(401);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("useSession : 401 -> session null et jeton efface (pas d'erreur)", async () => {
    tokenStorage.setAccessToken("perime");
    const { wrapper } = setup();
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("useSession : une erreur serveur (500) reste une erreur et garde le jeton", async () => {
    await loginAs(ALEX);
    server.use(
      http.get(apiUrl("/me"), () =>
        HttpResponse.json({ code: "x", message: "Panne." }, { status: 500 }),
      ),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(tokenStorage.getAccessToken()).toBeTruthy();
  });

  it("useLogout : efface le jeton et vide le cache", async () => {
    await loginAs(ALEX);
    const { client, wrapper } = setup();
    client.setQueryData(["autre"], 1);
    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(() => result.current.mutateAsync());
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(client.getQueryData(["autre"])).toBeUndefined();
  });
});

describe("queries/projects", () => {
  it("useProjects : transmet q et tags dans l'URL", async () => {
    const rec = recordRequests();
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useProjects({ q: "mur", tags: ["dessin", "quartier"] }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rec.stop();
    const call = rec.log.find((l) => l.startsWith("GET /api/projects?"));
    expect(call).toBeDefined();
    const params = new URLSearchParams(call!.split("?")[1]);
    expect(params.get("q")).toBe("mur");
    expect(params.get("tags")).toBe("dessin,quartier");
  });

  it("useProject : retourne le projet par slug", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useProject(FRESQUE), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.slug).toBe(FRESQUE);
  });

  it("useProject : slug inconnu -> erreur 404 en francais", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useProject("inexistant"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).status).toBe(404);
    expect(result.current.error?.message).toBe("Ce projet n'existe pas.");
  });

  it("useProject : slug vide -> aucune requete", async () => {
    const rec = recordRequests();
    const { wrapper } = setup();
    const { result } = renderHook(() => useProject(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
    rec.stop();
    expect(rec.log).toEqual([]);
  });
});

describe("queries/memberships — candidature et acceptation", () => {
  it("useCreateJoinRequest (projet sur demande) : POST avec message, demande en attente creee, cache invalide", async () => {
    await loginAs(YANIS);
    const rec = recordRequests();
    const { client, wrapper } = setup();
    client.setQueryData(queryKeys.projects.joinRequests(JARDIN), []);
    client.setQueryData(queryKeys.projects.members(JARDIN), []);
    const { result } = renderHook(() => useCreateJoinRequest(JARDIN), {
      wrapper,
    });
    await act(() => result.current.mutateAsync({ message: "Je suis motive." }));
    rec.stop();

    expect(rec.log).toContain(`POST /api/projects/${JARDIN}/join-requests`);
    const stored = getDb().joinRequests.find(
      (r) => r.message === "Je suis motive.",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].status).toBe("pending");
    expect(isInvalidated(client, queryKeys.projects.joinRequests(JARDIN))).toBe(
      true,
    );
    expect(isInvalidated(client, queryKeys.projects.members(JARDIN))).toBe(
      true,
    );
  });

  it("useCreateJoinRequest : visiteur non connecte -> ApiError 401", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateJoinRequest(JARDIN), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({}).catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).status).toBe(401);
  });

  it("useCreateJoinRequest : projet sur invitation -> 403 avec message francais", async () => {
    await loginAs(YANIS);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => useCreateJoinRequest("album-de-reprises-au-local"),
      { wrapper },
    );
    await act(async () => {
      await result.current.mutateAsync({}).catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe(
      "Ce projet ne se rejoint que sur invitation.",
    );
  });

  it("useAcceptJoinRequest : le demandeur devient membre et les listes sont rafraichies", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        requests: useJoinRequests(FRESQUE),
        members: useMembers(FRESQUE),
        accept: useAcceptJoinRequest(FRESQUE),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.requests.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.members.isSuccess).toBe(true));
    const pending = result.current.requests.data!.find(
      (r) => r.status === "pending",
    )!;
    const before = result.current.members.data!.length;

    await act(() => result.current.accept.mutateAsync(pending.id));

    await waitFor(() =>
      expect(result.current.members.data!.length).toBe(before + 1),
    );
    await waitFor(() =>
      expect(
        result.current.requests.data!.find((r) => r.id === pending.id)?.status,
      ).toBe("accepted"),
    );
  });

  it("useAcceptJoinRequest : un simple membre n'a pas le droit (403)", async () => {
    await loginAs(YANIS);
    const { wrapper } = setup();
    const { result } = renderHook(() => useAcceptJoinRequest(FRESQUE), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync("id-quelconque").catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).status).toBe(403);
  });
});

describe("queries/tasks", () => {
  async function loadBoard(wrapper: ReturnType<typeof setup>["wrapper"]) {
    const hook = renderHook(
      () => ({
        columns: useColumns(FRESQUE),
        tasks: useTasks(FRESQUE),
        create: useCreateTask(FRESQUE),
        update: useUpdateTask(FRESQUE),
        move: useMoveTask(FRESQUE),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(hook.result.current.columns.isSuccess).toBe(true),
    );
    await waitFor(() => expect(hook.result.current.tasks.isSuccess).toBe(true));
    return hook;
  }

  it("useCreateTask : POST /tasks puis la liste contient la nouvelle tache", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    const column = result.current.columns.data![0];
    const before = result.current.tasks.data!.length;

    await act(() =>
      result.current.create.mutateAsync({
        columnId: column.id,
        title: "Acheter la peinture",
      }),
    );
    await waitFor(() =>
      expect(result.current.tasks.data!.length).toBe(before + 1),
    );
    expect(
      result.current.tasks.data!.some((t) => t.title === "Acheter la peinture"),
    ).toBe(true);
  });

  it("useCreateTask : titre vide -> erreur 400 de validation", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    await act(async () => {
      await result.current.create
        .mutateAsync({
          columnId: result.current.columns.data![0].id,
          title: "",
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.create.isError).toBe(true));
    expect((result.current.create.error as ApiError).status).toBe(400);
  });

  it("useUpdateTask : PATCH puis la liste reflete le nouveau titre", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    const task = result.current.tasks.data![0];
    await act(() =>
      result.current.update.mutateAsync({
        taskId: task.id,
        input: { title: "Titre modifie" },
      }),
    );
    await waitFor(() =>
      expect(
        result.current.tasks.data!.find((t) => t.id === task.id)?.title,
      ).toBe("Titre modifie"),
    );
  });

  it("useMoveTask : mise a jour optimiste immediate", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    const task = result.current.tasks.data![0];
    const target = result.current.columns.data!.find(
      (c) => c.id !== task.columnId,
    )!;
    await act(async () => {
      result.current.move.mutate({
        taskId: task.id,
        input: { columnId: target.id, order: 0 },
      });
    });
    await waitFor(() =>
      expect(
        result.current.tasks.data!.find((t) => t.id === task.id)?.columnId,
      ).toBe(target.id),
    );
  });

  it("useMoveTask : en cas d'erreur serveur, la liste revient a l'etat precedent", async () => {
    await loginAs(ALEX);
    server.use(
      http.post(apiUrl("/tasks/:taskId/move"), () =>
        HttpResponse.json({ code: "x", message: "Panne." }, { status: 500 }),
      ),
    );
    const { client, wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    const task = result.current.tasks.data![0];
    const target = result.current.columns.data!.find(
      (c) => c.id !== task.columnId,
    )!;
    await act(async () => {
      await result.current.move
        .mutateAsync({
          taskId: task.id,
          input: { columnId: target.id, order: 0 },
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.move.isError).toBe(true));
    const cached = client.getQueryData<{ id: string; columnId: string }[]>(
      queryKeys.projects.tasks(FRESQUE),
    );
    expect(cached?.find((t) => t.id === task.id)?.columnId).toBe(task.columnId);
  });

  it("useCreateTask : un visiteur n'est pas autorise (403)", async () => {
    const { wrapper } = setup();
    const { result } = await loadBoard(wrapper);
    await act(async () => {
      await result.current.create
        .mutateAsync({
          columnId: result.current.columns.data![0].id,
          title: "x",
        })
        .catch(() => undefined);
    });
    await waitFor(() => expect(result.current.create.isError).toBe(true));
    expect((result.current.create.error as ApiError).status).toBe(403);
  });
});

describe("queries/notifications", () => {
  it("useNotifications : 401 sans session", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as ApiError).status).toBe(401);
  });

  it("useNotifications : liste de la personne connectee, compteur de non-lues coherent", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        list: useNotifications(),
        unread: useUnreadNotificationsCount(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const items = result.current.list.data!.items;
    expect(items.length).toBeGreaterThan(0);
    expect(result.current.unread).toBe(items.filter((n) => !n.read).length);
  });

  it("useMarkNotificationRead : la notification passe a lue et le compteur baisse", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        list: useNotifications(),
        unread: useUnreadNotificationsCount(),
        mark: useMarkNotificationRead(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const target = result.current.list.data!.items.find((n) => !n.read)!;
    const before = result.current.unread;
    await act(() => result.current.mark.mutateAsync(target.id));
    await waitFor(() => expect(result.current.unread).toBe(before - 1));
  });

  it("useMarkAllNotificationsRead : compteur a zero", async () => {
    await loginAs(ALEX);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        list: useNotifications(),
        unread: useUnreadNotificationsCount(),
        markAll: useMarkAllNotificationsRead(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(result.current.unread).toBeGreaterThan(0);
    await act(() => result.current.markAll.mutateAsync());
    await waitFor(() => expect(result.current.unread).toBe(0));
  });
});
