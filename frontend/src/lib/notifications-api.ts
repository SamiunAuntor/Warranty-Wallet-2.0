import { apiRequest } from "@/lib/api-client";

export type Notification = { id: string; title: string; message: string; type: string; isRead: boolean; entityId: string | null; createdAt: string };
async function request<T>(path: string, token: string, method = "GET") {
  return apiRequest<T>(path, { method, cache: "no-store", token });
}
export const getNotifications = (token: string) => request<Notification[]>("/notifications?page=1&limit=10", token);
export const getUnreadCount = (token: string) => request<{ unread: number }>("/notifications/unread-count", token);
export const readNotification = (token: string, id: string) => request<Notification>(`/notifications/${id}/read`, token, "PATCH");
export const readAllNotifications = (token: string) => request<null>("/notifications/read-all", token, "PATCH");
