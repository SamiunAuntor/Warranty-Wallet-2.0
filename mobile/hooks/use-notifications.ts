import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  readAllNotifications,
  readNotification,
} from "../lib/notifications-api";
import { keys, useInvalidate, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export function useNotificationList() {
  return usePagedQuery(keys.notifications, (page) => getNotifications(page), {
    enabled: useSignedIn(),
  });
}

export const useUnreadCount = () =>
  useQuery({
    queryKey: keys.unread,
    queryFn: getUnreadCount,
    enabled: useSignedIn(),
    refetchInterval: 60_000,
    select: (data) => data.unread,
  });

export function useNotificationActions() {
  const invalidate = useInvalidate();
  const refresh = () => invalidate.notifications();
  return {
    markRead: useMutation({ mutationFn: readNotification, onSuccess: refresh }),
    markAllRead: useMutation({ mutationFn: readAllNotifications, onSuccess: refresh }),
    remove: useMutation({ mutationFn: deleteNotification, onSuccess: refresh }),
  };
}
