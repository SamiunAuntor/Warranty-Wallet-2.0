import { apiList, apiRequest, queryString } from "./api";
import type { Notification } from "./types";

export const getNotifications = (page = 1, limit = 20) =>
  apiList<Notification>(`/notifications${queryString({ page, limit })}`);

export const getUnreadCount = () => apiRequest<{ unread: number }>("/notifications/unread-count");

export const readNotification = (id: string) =>
  apiRequest<Notification>(`/notifications/${id}/read`, { method: "PATCH" });

export const readAllNotifications = () =>
  apiRequest<null>("/notifications/read-all", { method: "PATCH" });

export const deleteNotification = (id: string) =>
  apiRequest<null>(`/notifications/${id}`, { method: "DELETE" });
