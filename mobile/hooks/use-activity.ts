import { getActivities } from "../lib/activity-api";
import { keys, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export function useActivityList() {
  return usePagedQuery(keys.activities, (page) => getActivities(page), { enabled: useSignedIn() });
}
