"use client";

import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { updateAppUser, updateUserPreferences, uploadProfilePhoto, type UserPreferences } from "@/lib/auth-api";
import { toast } from "@/lib/notifications";
import { prepareUploadFile } from "@/lib/upload-files";
import { Loading } from "@/components/ui/loading";
import { usePreferences } from "@/contexts/preferences-context";

const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]";
const reminderOptions = [30, 14, 7, 3, 1];

export default function SettingsPage() {
  const { firebaseUser, appUser, setCurrentAppUser } = useAuth();
  const { preferences, setPreferences } = usePreferences();
  const photoInput = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!firebaseUser) return;
    const form = new FormData(event.currentTarget); setSavingProfile(true);
    try {
      const updated = await updateAppUser(await firebaseUser.getIdToken(), { name: String(form.get("name")).trim(), phone: String(form.get("phone")).trim() || null });
      setCurrentAppUser(updated); toast.success("Profile updated.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update profile."); } finally { setSavingProfile(false); }
  };

  const uploadPhoto = async (file: File) => {
    if (!firebaseUser) return; setUploadingPhoto(true);
    try {
      const prepared = await prepareUploadFile(file);
      if (!prepared.type.startsWith("image/")) throw new Error("Choose a JPG, PNG, or WebP profile photo.");
      const updated = await uploadProfilePhoto(await firebaseUser.getIdToken(), prepared);
      await firebaseUser.reload(); setCurrentAppUser(updated); toast.success("Profile photo updated in Firebase and Warranty Wallet.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload profile photo."); } finally { setUploadingPhoto(false); if (photoInput.current) photoInput.current.value = ""; }
  };

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!firebaseUser || !preferences) return;
    const form = new FormData(event.currentTarget); setSavingPreferences(true);
    try {
      const updated = await updateUserPreferences(await firebaseUser.getIdToken(), {
        warrantyReminders: form.get("warrantyReminders") === "on", claimUpdates: form.get("claimUpdates") === "on",
        reminderDays: form.getAll("reminderDays").map(Number), timezone: String(form.get("timezone")),
        currency: String(form.get("currency")) as UserPreferences["currency"], dateFormat: String(form.get("dateFormat")) as UserPreferences["dateFormat"],
      });
      setPreferences(updated); toast.success("Preferences saved.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save preferences."); } finally { setSavingPreferences(false); }
  };

  if (!appUser || !preferences) return <Loading label="Loading settings"/>;
  const initial = appUser.name.charAt(0).toUpperCase();
  const provider = firebaseUser?.providerData.some((item) => item.providerId === "google.com") ? "Google" : "Email and password";

  return <div className="mx-auto w-full max-w-4xl pb-10"><header><h1 className="text-3xl font-semibold text-[#111d32]">Settings</h1><p className="mt-1 text-sm text-[#626773]">Manage your profile and how Warranty Wallet communicates with you.</p></header>
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#dfe2ea] bg-white shadow-sm"><div className="border-b bg-[#f7f7ff] p-6"><h2 className="text-lg font-semibold text-[#17243a]">Profile</h2><p className="mt-1 text-sm text-[#686d77]">Your photo appears throughout your account.</p></div><div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e5ff] text-2xl font-bold text-[#5141df]">{appUser.photoURL ? <img src={appUser.photoURL} alt={appUser.name} className="h-full w-full object-cover"/> : initial}</div><div><input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); }}/><button disabled={uploadingPhoto} onClick={() => photoInput.current?.click()} className="rounded-lg bg-[#5141df] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{uploadingPhoto ? "Uploading…" : "Upload new photo"}</button><p className="mt-2 text-xs text-[#737985]">JPG, PNG, or WebP. Large phone photos are optimized automatically.</p></div></div><form onSubmit={saveProfile} className="grid gap-5 border-t p-6 sm:grid-cols-2"><label className="text-sm font-medium">Full name <span className="text-red-600">*</span><input name="name" required minLength={2} maxLength={100} defaultValue={appUser.name} className={inputClass}/></label><label className="text-sm font-medium">Email<input disabled value={appUser.email} className={`${inputClass} bg-[#f1f2f5] text-[#737985]`}/></label><label className="text-sm font-medium">Phone<input name="phone" minLength={7} maxLength={30} defaultValue={appUser.phone ?? ""} className={inputClass}/></label><label className="text-sm font-medium">Sign-in method<input disabled value={provider} className={`${inputClass} bg-[#f1f2f5] text-[#737985]`}/></label><div className="border-t pt-5 sm:col-span-2"><button disabled={savingProfile} className="rounded-lg bg-[#5141df] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingProfile ? "Saving…" : "Save profile"}</button></div></form></section>
    <form onSubmit={savePreferences} className="mt-6 overflow-hidden rounded-2xl border border-[#dfe2ea] bg-white shadow-sm"><div className="border-b bg-[#f7f7ff] p-6"><h2 className="text-lg font-semibold text-[#17243a]">Preferences</h2><p className="mt-1 text-sm text-[#686d77]">These settings control reminders and dashboard formatting.</p></div><div className="grid gap-6 p-6 sm:grid-cols-2"><label className="flex items-start gap-3 rounded-xl border p-4"><input name="warrantyReminders" type="checkbox" defaultChecked={preferences.warrantyReminders} className="mt-1 h-4 w-4 accent-[#5141df]"/><span><strong className="block text-sm">Warranty reminders</strong><span className="mt-1 block text-xs text-[#686d77]">Receive alerts before warranty coverage expires.</span></span></label><label className="flex items-start gap-3 rounded-xl border p-4"><input name="claimUpdates" type="checkbox" defaultChecked={preferences.claimUpdates} className="mt-1 h-4 w-4 accent-[#5141df]"/><span><strong className="block text-sm">Claim updates</strong><span className="mt-1 block text-xs text-[#686d77]">Receive notifications when claim status changes.</span></span></label><fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Warranty reminder schedule</legend><div className="mt-3 flex flex-wrap gap-2">{reminderOptions.map((day) => <label key={day} className="rounded-full border bg-[#fafaff] px-3 py-2 text-xs font-medium"><input name="reminderDays" value={day} type="checkbox" defaultChecked={preferences.reminderDays.includes(day)} className="mr-2 accent-[#5141df]"/>{day} day{day === 1 ? "" : "s"} before</label>)}</div></fieldset><label className="text-sm font-medium">Time zone<select name="timezone" defaultValue={preferences.timezone} className={inputClass}><option value="UTC">UTC</option><option value="Asia/Dhaka">Asia/Dhaka</option><option value="America/New_York">America/New York</option><option value="Europe/London">Europe/London</option><option value="Asia/Kolkata">Asia/Kolkata</option></select></label><label className="text-sm font-medium">Currency<select name="currency" defaultValue={preferences.currency} className={inputClass}>{["USD", "BDT", "EUR", "GBP", "CAD", "AUD"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-sm font-medium">Date format<select name="dateFormat" defaultValue={preferences.dateFormat} className={inputClass}><option value="MMM_D_YYYY">Aug 2, 2026</option><option value="DD_MM_YYYY">02/08/2026</option><option value="MM_DD_YYYY">08/02/2026</option></select></label></div><div className="border-t bg-[#fafbfe] p-6"><button disabled={savingPreferences} className="rounded-lg bg-[#5141df] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingPreferences ? "Saving…" : "Save preferences"}</button></div></form>
  </div>;
}
