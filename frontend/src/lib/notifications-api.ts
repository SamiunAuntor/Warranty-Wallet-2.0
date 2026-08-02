export type Notification = { id: string; title: string; message: string; type: string; isRead: boolean; entityId: string | null; createdAt: string };
type Envelope<T> = { data: T; message: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
async function request<T>(path: string, token: string, method = "GET") {
  const response = await fetch(`${API_URL}${path}`, { method, cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
  const payload = await response.json().catch(() => null) as Envelope<T> | null;
  if (!response.ok || !payload) throw new Error(payload?.message || "Notification request failed.");
  return payload.data;
}
export const getNotifications = (token: string) => request<Notification[]>("/notifications?page=1&limit=10", token);
export const getUnreadCount = (token: string) => request<{ unread: number }>("/notifications/unread-count", token);
export const readNotification = (token: string, id: string) => request<Notification>(`/notifications/${id}/read`, token, "PATCH");
export const readAllNotifications = (token: string) => request<null>("/notifications/read-all", token, "PATCH");
