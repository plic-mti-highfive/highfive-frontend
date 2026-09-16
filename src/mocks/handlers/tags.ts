import { http, HttpResponse } from "msw";
import { getDb } from "../db";
import { apiUrl, simulateLatency } from "./utils";

export const tagHandlers = [
  http.get(apiUrl("/tags"), async () => {
    await simulateLatency();
    return HttpResponse.json(getDb().tags.all());
  }),
];
