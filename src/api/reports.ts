import { apiFetch } from "./client";
import { reportSchema, type Report, type ReportCreateInput } from "@/domain";

/** Signaler un contenu (doc 05 §3.1/§3.4, R-S1) : ouvert a toute personne connectee. */
export function createReport(input: ReportCreateInput): Promise<Report> {
  return apiFetch("/reports", {
    method: "POST",
    body: input,
    schema: reportSchema,
  });
}
