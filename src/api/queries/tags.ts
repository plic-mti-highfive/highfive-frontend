import { useQuery } from "@tanstack/react-query";
import * as tagsApi from "../tags";
import { queryKeys } from "./keys";

/** Liste fermee (R-T1/R-T2) : `staleTime` long, ca ne change jamais en session. */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: tagsApi.listTags,
    staleTime: 10 * 60 * 1000,
  });
}
