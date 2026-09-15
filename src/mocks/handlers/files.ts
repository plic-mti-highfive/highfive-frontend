import { http, HttpResponse } from "msw";
import { nextId } from "../data/ids";
import { getDb } from "../db";
import {
  apiUrl,
  errors,
  getAuthUser,
  hasAtLeastRole,
  simulateLatency,
} from "./utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // R-F1
const MAX_PROJECT_TOTAL = 200 * 1024 * 1024;
const FORBIDDEN_MIME = ["application/x-msdownload", "application/x-executable"];

function roleOf(projectId: string, userId: string | undefined) {
  if (!userId) return undefined;
  return getDb().memberships.findOne(
    (m) => m.projectId === projectId && m.userId === userId,
  )?.role;
}

export const fileHandlers = [
  http.get(apiUrl("/projects/:slug/files"), async ({ params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    return HttpResponse.json(db.files.find((f) => f.projectId === project.id));
  }),

  http.post(apiUrl("/projects/:slug/files"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const project = db.projects.findOne((p) => p.slug === params.slug);
    if (!project) return errors.notFound("Ce projet n'existe pas.");
    const user = getAuthUser(request);
    if (!hasAtLeastRole(roleOf(project.id, user?.id) ?? "observer", "member"))
      return errors.forbidden();

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return errors.validation({ file: "Fichier requis." });
    if (FORBIDDEN_MIME.includes(file.type)) {
      return errors.validation({
        file: "Ce type de fichier n'est pas autorise (R-F2).",
      });
    }
    if (file.size > MAX_FILE_SIZE)
      return errors.validation({ file: "20 Mo maximum par fichier." });
    const currentTotal = db.files
      .find((f) => f.projectId === project.id)
      .reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + file.size > MAX_PROJECT_TOTAL) {
      return errors.validation({ file: "200 Mo maximum par projet." });
    }

    const record = {
      id: nextId(),
      projectId: project.id,
      uploadedBy: user!.id,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    };
    db.files.insert(record);
    return HttpResponse.json(record, { status: 201 });
  }),

  http.delete(apiUrl("/files/:fileId"), async ({ request, params }) => {
    await simulateLatency();
    const db = getDb();
    const file = db.files.findOne((f) => f.id === params.fileId);
    if (!file) return errors.notFound("Fichier introuvable.");
    const user = getAuthUser(request);
    const role = roleOf(file.projectId, user?.id);
    // R-F3 : le deposant, le porteur ou le co-porteur.
    const canDelete =
      user?.id === file.uploadedBy ||
      hasAtLeastRole(role ?? "observer", "co_owner");
    if (!canDelete) return errors.forbidden();

    db.files.remove((f) => f.id === file.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(apiUrl("/me/avatar"), async ({ request }) => {
    await simulateLatency();
    const user = getAuthUser(request);
    if (!user) return errors.unauthorized();

    const form = await request.formData();
    const file = form.get("avatar");
    if (!(file instanceof File))
      return errors.validation({ avatar: "Fichier requis." });

    const avatar = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.username)}-${Date.now()}`;
    getDb().users.update((u) => u.id === user.id, { avatar });
    return HttpResponse.json({ avatar });
  }),
];
