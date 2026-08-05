"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Search, Trash2 } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { Loading } from "@/components/ui/loading";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminPagination, AdminTable, AdminTableHead, adminCard, adminInput } from "@/components/admin/admin-ui";
import { useAuth } from "@/contexts/auth-context";
import { deleteAdminUser, getAdminUsers, setUserBlocked, type AdminUser, type Meta } from "@/lib/admin-api";
import { dialog, toast } from "@/lib/notifications";

const statusTone = (status: string) => status === "ACTIVE" ? "success" : status === "BLOCKED" ? "danger" : "neutral";

export default function UsersPage() {
  const { firebaseUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!firebaseUser) return;
    const timer = setTimeout(() => {
      setLoading(true);
      firebaseUser.getIdToken().then((token) => getAdminUsers(token, { page, limit: 15, search, status, plan }))
        .then((result) => { setUsers(result.data); setMeta(result.meta); })
        .catch((error) => toast.error(error instanceof Error ? error.message : "Users could not be loaded."))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [firebaseUser, page, plan, reload, search, status]);

  const toggle = async (user: AdminUser) => {
    if (!firebaseUser) return;
    const blocking = user.status !== "BLOCKED";
    if (!(await dialog.confirm(blocking ? "Block this user?" : "Restore this user?", blocking ? `${user.email} will be signed out and unable to sign in.` : `${user.email} will be able to sign in again.`)).isConfirmed) return;
    try {
      await setUserBlocked(await firebaseUser.getIdToken(), user.id, blocking);
      toast.success(blocking ? "User blocked and sessions revoked." : "User access restored.");
      setReload((value) => value + 1);
    } catch (error) { toast.error(error instanceof Error ? error.message : "User access could not be updated."); }
  };

  const remove = async (user: AdminUser) => {
    if (!firebaseUser || !(await dialog.confirm("Delete this user?", `${user.email} will permanently lose access.`)).isConfirmed) return;
    try { await deleteAdminUser(await firebaseUser.getIdToken(), user.id); toast.success("User deleted."); setReload((value) => value + 1); }
    catch (error) { toast.error(error instanceof Error ? error.message : "User could not be deleted."); }
  };

  return <div className="mx-auto max-w-[1440px] pb-10">
    <AdminPageHeader title="User management" description="Manage customer access, plans, and account status."/>
    <section className={`${adminCard} mt-6 flex flex-col gap-3 p-4 lg:flex-row`}>
      <label className="relative flex-1"><Search className="absolute left-3 top-3 h-5 w-5 text-[#858b98]"/><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or email" className={`${adminInput} w-full pl-10`}/></label>
      <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={adminInput}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="BLOCKED">Blocked</option><option value="DELETED">Deleted</option></select>
      <select value={plan} onChange={(event) => { setPlan(event.target.value); setPage(1); }} className={adminInput}><option value="">All plans</option><option value="BASIC">Basic</option><option value="PLUS">Plus</option><option value="PRO">Pro</option></select>
    </section>
    {loading ? <Loading fullScreen={false} label="Loading users"/> : users.length === 0 ? <AdminEmpty title="No users found" description="Try changing the search or account filters."/> : <AdminTable><AdminTableHead><th className="px-5 py-4">User</th><th className="px-4 py-4">Plan</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Joined</th><th className="px-5 py-4 text-right">Actions</th></AdminTableHead><tbody className="divide-y divide-[#edf0f5]">{users.map((user) => <tr key={user.id} className="transition hover:bg-[#fafaff]"><td className="px-5 py-4"><div className="flex items-center gap-3">{user.photoURL ? <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover"/> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeecff] font-bold text-[#5949df]">{user.name.slice(0, 1).toUpperCase()}</span>}<div><p className="font-semibold text-[#182238]">{user.name}</p><p className="text-xs text-[#747b89]">{user.email}</p></div></div></td><td className="px-4 py-4"><AdminBadge tone={user.plan === "PRO" ? "primary" : user.plan === "PLUS" ? "warning" : "neutral"}>{user.plan}</AdminBadge></td><td className="px-4 py-4"><AdminBadge tone={statusTone(user.status)}>{user.status}</AdminBadge></td><td className="px-4 py-4 text-[#606878]">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex justify-end gap-1">{user.role !== "ADMIN" && <><ActionIconButton icon={user.status === "BLOCKED" ? CheckCircle2 : Ban} label={user.status === "BLOCKED" ? "Unblock user" : "Block user"} tone={user.status === "BLOCKED" ? "primary" : "default"} onClick={() => void toggle(user)}/><ActionIconButton icon={Trash2} label="Delete user" tone="danger" onClick={() => void remove(user)}/></>}</div></td></tr>)}</tbody></AdminTable>}
    <AdminPagination page={page} totalPages={meta?.totalPages ?? 1} onChange={setPage}/>
  </div>;
}
