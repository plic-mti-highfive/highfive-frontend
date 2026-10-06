import { useMutation } from "@tanstack/react-query";
import * as reportsApi from "../reports";
import type { ReportCreateInput } from "@/domain";

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: ReportCreateInput) => reportsApi.createReport(input),
  });
}
