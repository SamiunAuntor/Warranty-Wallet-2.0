"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { getNotifications, getUnreadCount, readAllNotifications, readNotification, type Notification } from "@/lib/notifications-api";
const time = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
export function NotificationCenter() {
  const { firebaseUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then(async (token) => Promise.all([getNotifications(token), getUnreadCount(token)])).then(([list, count]) => { setItems(list.data); setUnread(count.unread); }).catch(() => undefined); }, [firebaseUser]);
  const markOne = async (item: Notification) => { if (!firebaseUser || item.isRead) return; await readNotification(await firebaseUser.getIdToken(), item.id); setItems((all) => all.map((value) => value.id === item.id ? { ...value, isRead: true } : value)); setUnread((value) => Math.max(0, value - 1)); };
  const markAll = async () => { if (!firebaseUser) return; await readAllNotifications(await firebaseUser.getIdToken()); setItems((all) => all.map((item) => ({ ...item, isRead: true }))); setUnread(0); };
  return <div className="relative ml-auto"><button onClick={() => setOpen((value) => !value)} aria-label="Notifications" className="relative rounded-lg p-2 text-[#27364b] hover:bg-[#eff2ff]"><Icon name="notifications" className="h-5 w-5"/>{unread > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}</button>{open && <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-white shadow-xl"><div className="flex justify-between border-b p-4"><h2 className="font-semibold">Notifications</h2>{unread > 0 && <button onClick={() => void markAll()} className="text-xs font-semibold text-[#4b41e1]">Mark all read</button>}</div><div className="max-h-96 overflow-y-auto">{items.length ? items.map((item) => <button key={item.id} onClick={() => void markOne(item)} className={`block w-full border-b p-4 text-left ${item.isRead ? "bg-white" : "bg-[#f5f4ff]"}`}><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#626773]">{item.message}</p><p className="mt-2 text-[10px] text-[#8a8f99]">{time.format(new Date(item.createdAt))}</p></button>) : <p className="p-8 text-center text-sm text-[#626773]">No notifications yet.</p>}</div></div>}</div>;
}
