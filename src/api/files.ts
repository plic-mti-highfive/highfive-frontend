import { z } from "zod";
import { apiFetch } from "./client";
import { projectFileSchema, type ProjectFile } from "@/domain";

export function listFiles(slug: string): Promise<ProjectFile[]> {
  return apiFetch(`/projects/${slug}/files`, {
    schema: z.array(projectFileSchema),
  });
}

/** R-F1/R-F2 : 20 Mo/fichier, 200 Mo/projet, executables refuses (verifie cote handler). */
export function uploadFile(slug: string, file: File): Promise<ProjectFile> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch(`/projects/${slug}/files`, {
    method: "POST",
    body,
    schema: projectFileSchema,
  });
}

export function deleteFile(fileId: string): Promise<void> {
  return apiFetch(`/files/${fileId}`, { method: "DELETE" });
}

const avatarResponseSchema = z.object({ avatar: z.url() });

export function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const body = new FormData();
  body.append("avatar", file);
  return apiFetch("/me/avatar", {
    method: "POST",
    body,
    schema: avatarResponseSchema,
  });
}
