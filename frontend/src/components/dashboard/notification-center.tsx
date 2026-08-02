"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { getNotifications, getUnreadCount, readAllNotifications, readNotification, type Notification } from "@/lib/notifications-api";
const time = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
export function NotificationCenter() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const key = ["notifications", firebaseUser?.uid] as const;
  const { data, isPending, isError } = useQuery({ queryKey: key, enabled: Boolean(firebaseUser), staleTime: 30_000, refetchInterval: 60_000, queryFn: async () => { const token = await firebaseUser!.getIdToken(); const [items, count] = await Promise.all([getNotifications(token), getUnreadCount(token)]); return { items, unread: count.unread }; } });
  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;
  const markOne = async (item: Notification) => { if (!firebaseUser || item.isRead) return; await readNotification(await firebaseUser.getIdToken(), item.id); queryClient.setQueryData(key, { items: items.map((value) => value.id === item.id ? { ...value, isRead: true } : value), unread: Math.max(0, unread - 1) }); };
  const markAll = async () => {
    if (!firebaseUser || unread === 0) return;
    queryClient.setQueryData(key, { items: items.map((item) => ({ ...item, isRead: true })), unread: 0 });
    try { await readAllNotifications(await firebaseUser.getIdToken()); }
    catch { void queryClient.invalidateQueries({ queryKey: key }); }
  };
  const toggleNotifications = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && unread > 0) void markAll();
  };
  return <div className="relative ml-auto">
    <button onClick={toggleNotifications} aria-label="Notifications" aria-expanded={open} className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-[#27364b] transition ${open ? "bg-[#eeecff] text-[#5141df]" : "hover:bg-[#f1f3f8]"}`}>
      <Icon name="notifications" className="h-5 w-5"/>
      {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d83b46] px-1 text-[9px] font-bold text-white ring-2 ring-white">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#e1e4ed] bg-white shadow-[0_16px_45px_rgba(33,40,66,.16)]">
      <div className="flex items-center justify-between border-b border-[#eceef4] px-4 py-3.5"><div><h2 className="font-semibold text-[#17243a]">Notifications</h2><p className="mt-0.5 text-[11px] text-[#747b89]">Recent warranty and account updates</p></div></div>
      <div className="max-h-[420px] overflow-y-auto">
        {isPending ? <div className="flex min-h-36 items-center justify-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#ddd9ff] border-t-[#5141df]" aria-label="Loading notifications"/></div> : isError ? <div className="p-7 text-center"><p className="text-sm font-medium text-[#9f3038]">Notifications could not be loaded.</p><button onClick={() => void queryClient.invalidateQueries({ queryKey: key })} className="mt-3 text-xs font-semibold text-[#5141df]">Try again</button></div> : items.length ? items.map((item) => <button key={item.id} onClick={() => void markOne(item)} className={`relative block w-full border-b border-[#f0f1f5] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-[#fafaff] ${item.isRead ? "bg-white" : "bg-[#f7f6ff]"}`}>{!item.isRead && <span className="absolute left-2 top-5 h-1.5 w-1.5 rounded-full bg-[#5b47ee]"/>}<div className="pl-2"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-[#273247]">{item.title}</p><span className="shrink-0 rounded-full bg-[#f0eeff] px-2 py-0.5 text-[9px] font-semibold uppercase text-[#5b47ee]">{item.type.toLowerCase()}</span></div><p className="mt-1 text-xs leading-5 text-[#626a78]">{item.message}</p><p className="mt-2 text-[10px] text-[#9297a1]">{time.format(new Date(item.createdAt))}</p></div></button>) : <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0eeff] text-[#5b47ee]"><Icon name="notifications" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-[#394254]">No notifications</p><p className="mt-1 text-xs text-[#7a808c]">Warranty reminders and account updates will appear here.</p></div>}
      </div>
    </div>}
  </div>;
}
