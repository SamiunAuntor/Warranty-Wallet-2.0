import { apiRequest } from "./api";
export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  entityId: string | null;
  createdAt: string;
};
export function getNotifications(token: string) {
  return apiRequest<Notification[]>("/notifications?page=1&limit=50", {
    token,
  });
}
export function readNotification(token: string, id: string) {
  return apiRequest<Notification>(`/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}
export function readAllNotifications(token: string) {
  return apiRequest<null>("/notifications/read-all", {
    method: "PATCH",
    token,
  });
}
