"use client";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { updateAppUser } from "@/lib/auth-api";
import { toast } from "@/lib/notifications";
const inputClass = "h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]";
export default function SettingsPage() {
  const { firebaseUser, appUser, setCurrentAppUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const updated = await updateAppUser(await firebaseUser.getIdToken(), {
        name: String(form.get("name")).trim(),
        phone: String(form.get("phone")).trim() || null,
        photoURL: String(form.get("photoURL")).trim() || null,
      });
      setCurrentAppUser(updated);
      toast.success("Profile updated.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update profile."); } finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-3xl pb-10"><header><h1 className="text-3xl font-semibold text-[#111d32]">Settings</h1><p className="mt-1 text-sm text-[#626773]">Manage your Warranty Wallet profile.</p></header><form onSubmit={submit} className="mt-6 grid gap-5 rounded-xl border bg-white p-6 sm:grid-cols-2"><label className="text-sm font-medium">Full name <span className="text-red-600">*</span><input name="name" required minLength={2} maxLength={100} defaultValue={appUser?.name} className={`mt-2 ${inputClass}`}/></label><label className="text-sm font-medium">Email<input disabled value={appUser?.email ?? ""} className={`mt-2 ${inputClass} bg-[#f1f2f5] text-[#737985]`}/></label><label className="text-sm font-medium">Phone<input name="phone" minLength={7} maxLength={30} defaultValue={appUser?.phone ?? ""} className={`mt-2 ${inputClass}`}/></label><label className="text-sm font-medium">Photo URL<input name="photoURL" type="url" defaultValue={appUser?.photoURL ?? ""} className={`mt-2 ${inputClass}`}/></label><div className="border-t pt-5 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-[#5b47ee] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div></form></div>;
}
