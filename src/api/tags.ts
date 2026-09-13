import { apiFetch } from "./client";
import { tagSchema, type Tag } from "@/domain";
import { z } from "zod";

const tagsResponseSchema = z.array(tagSchema);

export function listTags(): Promise<Tag[]> {
  return apiFetch("/tags", { schema: tagsResponseSchema });
}
