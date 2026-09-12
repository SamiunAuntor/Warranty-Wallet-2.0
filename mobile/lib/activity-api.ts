import { apiRequest } from "./api";
export type Activity = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  entity: string;
  createdAt: string;
};
export function getActivities(token: string) {
  return apiRequest<Activity[]>("/activities?page=1&limit=30", { token });
}
