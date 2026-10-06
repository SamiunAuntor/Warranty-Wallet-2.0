import { apiList, queryString } from "./api";
import type { Activity } from "./types";

export const getActivities = (page = 1, limit = 20) =>
  apiList<Activity>(`/activities${queryString({ page, limit })}`);
