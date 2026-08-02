"use client";

import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePreferences } from "@/contexts/preferences-context";
import { updateAppUser, updateUserPreferences, uploadProfilePhoto, type UserPreferences } from "@/lib/auth-api";
import { toast } from "@/lib/notifications";
import { prepareUploadFile } from "@/lib/upload-files";
import { Loading } from "@/components/ui/loading";

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-[#d8dbea] bg-[#fbfbff] px-3.5 text-sm text-[#17243a] outline-none transition focus:border-[#7668ef] focus:bg-white focus:ring-3 focus:ring-[#e9e6ff]";
const reminderOptions = [30, 14, 7, 3, 1];

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f8f8fd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a8090]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#26334a]">{value || "Not provided"}</p></div>;
}

export default function SettingsPage() {
  const { firebaseUser, appUser, setCurrentAppUser } = useAuth();
  const { preferences, setPreferences } = usePreferences();
  const photoInput = useRef<HTMLInputElement>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [preferencesEditing, setPreferencesEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!firebaseUser) return;
    const form = new FormData(event.currentTarget); setSavingProfile(true);
    try {
      const updated = await updateAppUser(await firebaseUser.getIdToken(), { name: String(form.get("name")).trim(), phone: String(form.get("phone")).trim() || null });
      setCurrentAppUser(updated); setProfileEditing(false); toast.success("Profile updated.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update profile."); } finally { setSavingProfile(false); }
  };

  const uploadPhoto = async (file: File) => {
    if (!firebaseUser) return; setUploadingPhoto(true);
    try {
      const prepared = await prepareUploadFile(file);
      if (!prepared.type.startsWith("image/")) throw new Error("Choose a JPG, PNG, or WebP profile photo.");
      const updated = await uploadProfilePhoto(await firebaseUser.getIdToken(), prepared);
      await firebaseUser.reload(); setCurrentAppUser(updated); toast.success("Profile photo updated.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload profile photo."); } finally { setUploadingPhoto(false); if (photoInput.current) photoInput.current.value = ""; }
  };

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!firebaseUser || !preferences) return;
    const form = new FormData(event.currentTarget); const reminderDays = form.getAll("reminderDays").map(Number);
    if (form.get("warrantyReminders") === "on" && reminderDays.length === 0) return void toast.warning("Choose at least one reminder day.");
    setSavingPreferences(true);
    try {
      const updated = await updateUserPreferences(await firebaseUser.getIdToken(), {
        warrantyReminders: form.get("warrantyReminders") === "on", reminderDays,
        timezone: String(form.get("timezone")), currency: String(form.get("currency")) as UserPreferences["currency"], dateFormat: String(form.get("dateFormat")) as UserPreferences["dateFormat"],
      });
      setPreferences(updated); setPreferencesEditing(false); toast.success("Preferences saved.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save preferences."); } finally { setSavingPreferences(false); }
  };

  if (!appUser || !preferences) return <Loading label="Loading settings"/>;
  const initial = appUser.name.charAt(0).toUpperCase();
  const provider = firebaseUser?.providerData.some((item) => item.providerId === "google.com") ? "Google" : "Email and password";
  const cardClass = "overflow-hidden rounded-2xl border border-[#e0e3ef] bg-white shadow-[0_8px_28px_rgba(54,55,100,.06)]";

  return <div className="mx-auto w-full max-w-[1180px] pb-10"><header><h1 className="text-3xl font-semibold text-[#111d32]">Settings</h1><p className="mt-1 text-sm text-[#626773]">Manage your account and reminder preferences.</p></header>
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
      <section className={cardClass}><div className="flex items-start justify-between gap-4 bg-[#f7f7ff] px-5 py-4"><div><h2 className="text-lg font-semibold text-[#17243a]">Profile</h2><p className="mt-1 text-sm text-[#707686]">Your personal account information.</p></div>{!profileEditing && <button onClick={() => setProfileEditing(true)} className="rounded-lg border border-[#d5d2f5] bg-white px-3.5 py-2 text-xs font-semibold text-[#5141df] hover:bg-[#f0eeff]">Edit</button>}</div>
        <div className="border-t border-[#ececf4] p-5"><div className="flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e8e5ff] text-xl font-bold text-[#5141df]">{appUser.photoURL ? <img src={appUser.photoURL} alt={appUser.name} className="h-full w-full object-cover"/> : initial}</div><div className="min-w-0"><p className="truncate text-lg font-semibold text-[#17243a]">{appUser.name}</p><p className="truncate text-sm text-[#6c7280]">{appUser.email}</p>{profileEditing && <><input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); }}/><button disabled={uploadingPhoto} onClick={() => photoInput.current?.click()} className="mt-2 text-xs font-semibold text-[#5141df] disabled:opacity-50">{uploadingPhoto ? "Uploading…" : "Change photo"}</button></>}</div></div></div>
        {profileEditing ? <form onSubmit={saveProfile} className="space-y-4 border-t border-[#ececf4] p-5"><label className="block text-sm font-medium text-[#394254]">Full name <span className="text-[#ba1a1a]">*</span><input name="name" required minLength={2} maxLength={100} defaultValue={appUser.name} className={inputClass}/></label><label className="block text-sm font-medium text-[#394254]">Phone<input name="phone" minLength={7} maxLength={30} defaultValue={appUser.phone ?? ""} className={inputClass}/></label><Field label="Email" value={appUser.email}/><Field label="Sign-in method" value={provider}/><div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setProfileEditing(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#626b7a] hover:bg-[#f3f4f8]">Cancel</button><button disabled={savingProfile} className="rounded-lg bg-[#5141df] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingProfile ? "Saving…" : "Save"}</button></div></form> : <div className="grid gap-3 border-t border-[#ececf4] p-5"><Field label="Phone" value={appUser.phone ?? ""}/><Field label="Sign-in method" value={provider}/></div>}
      </section>

      <section className={cardClass}><div className="flex items-start justify-between gap-4 bg-[#f7f7ff] px-5 py-4"><div><h2 className="text-lg font-semibold text-[#17243a]">Preferences</h2><p className="mt-1 text-sm text-[#707686]">Choose how dates, values, and reminders appear.</p></div>{!preferencesEditing && <button onClick={() => setPreferencesEditing(true)} className="rounded-lg border border-[#d5d2f5] bg-white px-3.5 py-2 text-xs font-semibold text-[#5141df] hover:bg-[#f0eeff]">Edit</button>}</div>
        {preferencesEditing ? <form onSubmit={savePreferences} className="space-y-5 border-t border-[#ececf4] p-5"><label className="flex items-start gap-3 rounded-xl bg-[#f8f8fd] p-4"><input name="warrantyReminders" type="checkbox" defaultChecked={preferences.warrantyReminders} className="mt-1 h-4 w-4 accent-[#5141df]"/><span><strong className="block text-sm text-[#26334a]">Warranty reminders</strong><span className="mt-1 block text-xs text-[#707686]">Get reminders before warranty coverage ends.</span></span></label><fieldset><legend className="text-sm font-medium text-[#394254]">Reminder schedule</legend><div className="mt-2 flex flex-wrap gap-2">{reminderOptions.map((day) => <label key={day} className="rounded-full border border-[#dedfec] bg-[#fafaff] px-3 py-2 text-xs font-medium text-[#454d60]"><input name="reminderDays" value={day} type="checkbox" defaultChecked={preferences.reminderDays.includes(day)} className="mr-2 accent-[#5141df]"/>{day} day{day === 1 ? "" : "s"}</label>)}</div></fieldset><label className="block text-sm font-medium text-[#394254]">Time zone<select name="timezone" defaultValue={preferences.timezone} className={inputClass}><option value="UTC">UTC</option><option value="Asia/Dhaka">Asia/Dhaka</option><option value="America/New_York">America/New York</option><option value="Europe/London">Europe/London</option><option value="Asia/Kolkata">Asia/Kolkata</option></select></label><label className="block text-sm font-medium text-[#394254]">Currency<select name="currency" defaultValue={preferences.currency} className={inputClass}>{["USD", "BDT", "EUR", "GBP", "CAD", "AUD"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="block text-sm font-medium text-[#394254]">Date format<select name="dateFormat" defaultValue={preferences.dateFormat} className={inputClass}><option value="MMM_D_YYYY">Aug 2, 2026</option><option value="DD_MM_YYYY">02/08/2026</option><option value="MM_DD_YYYY">08/02/2026</option></select></label><div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setPreferencesEditing(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#626b7a] hover:bg-[#f3f4f8]">Cancel</button><button disabled={savingPreferences} className="rounded-lg bg-[#5141df] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{savingPreferences ? "Saving…" : "Save"}</button></div></form> : <div className="grid gap-3 border-t border-[#ececf4] p-5"><Field label="Warranty reminders" value={preferences.warrantyReminders ? `On · ${preferences.reminderDays.join(", ")} days before` : "Off"}/><Field label="Time zone" value={preferences.timezone}/><Field label="Currency" value={preferences.currency}/><Field label="Date format" value={preferences.dateFormat === "DD_MM_YYYY" ? "Day / Month / Year" : preferences.dateFormat === "MM_DD_YYYY" ? "Month / Day / Year" : "Month name, Day, Year"}/></div>}
      </section>
    </div>
  </div>;
}
