import { z } from "zod";
import { apiFetch } from "./client";
import {
  announcementSchema,
  userSummarySchema,
  type Announcement,
  type AnnouncementCreateInput,
} from "@/domain";

const announcementWithAuthorSchema = announcementSchema.extend({
  author: userSummarySchema,
});
export type AnnouncementWithAuthor = z.infer<
  typeof announcementWithAuthorSchema
>;

export function listAnnouncements(
  slug: string,
): Promise<AnnouncementWithAuthor[]> {
  return apiFetch(`/projects/${slug}/announcements`, {
    schema: z.array(announcementWithAuthorSchema),
  });
}

export function createAnnouncement(
  slug: string,
  input: AnnouncementCreateInput,
): Promise<Announcement> {
  return apiFetch(`/projects/${slug}/announcements`, {
    method: "POST",
    body: input,
    schema: announcementSchema,
  });
}

/** R-A2 : epingler une annonce depingle automatiquement l'ancienne (cote handler). */
export function pinAnnouncement(announcementId: string): Promise<Announcement> {
  return apiFetch(`/announcements/${announcementId}/pin`, {
    method: "POST",
    schema: announcementSchema,
  });
}

export function deleteAnnouncement(announcementId: string): Promise<void> {
  return apiFetch(`/announcements/${announcementId}`, { method: "DELETE" });
}
