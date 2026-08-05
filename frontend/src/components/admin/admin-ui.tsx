"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox, X } from "lucide-react";

export const adminCard = "rounded-2xl border border-[#e4e7f0] bg-white shadow-[0_8px_30px_rgba(25,32,56,0.05)]";
export const adminInput = "h-11 rounded-xl border border-[#dfe3ed] bg-white px-3 text-sm text-[#182238] outline-none transition focus:border-[#7768f2] focus:ring-4 focus:ring-[#5b47ee]/10";

export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-[#111d32]">{title}</h1><p className="mt-1.5 text-sm text-[#697080]">{description}</p></div>{action}</header>;
}

const badgeTones = {
  neutral: "bg-[#f0f2f7] text-[#566070]",
  success: "bg-[#eaf8f0] text-[#28794d]",
  warning: "bg-[#fff6e5] text-[#9a5b08]",
  danger: "bg-[#fff0f1] text-[#ad2831]",
  primary: "bg-[#eeecff] text-[#5141df]",
};
export function AdminBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${badgeTones[tone]}`}>{children}</span>;
}

export function AdminTable({ children }: { children: ReactNode }) {
  return <div className={`${adminCard} mt-5 overflow-hidden`}><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">{children}</table></div></div>;
}
export function AdminTableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#f7f8fc] text-[11px] uppercase tracking-[0.08em] text-[#707788]"><tr>{children}</tr></thead>;
}
export function AdminEmpty({ title, description }: { title: string; description: string }) {
  return <div className={`${adminCard} mt-5 flex min-h-60 flex-col items-center justify-center p-8 text-center`}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeecff] text-[#5b47ee]"><Inbox className="h-5 w-5"/></span><h2 className="mt-4 font-semibold text-[#182238]">{title}</h2><p className="mt-1 max-w-sm text-sm text-[#747b89]">{description}</p></div>;
}

export function AdminPagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="mt-5 flex items-center justify-end gap-3 text-sm text-[#687080]"><span>Page {page} of {totalPages}</span><button aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3ed] bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4"/></button><button aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe3ed] bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4"/></button></div>;
}

export function AdminModal({ open, title, description, children, onClose, size = "md" }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void; size?: "sm" | "md" | "lg" }) {
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#11182c]/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl ${widths[size]}`}><header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#eceef4] bg-white px-6 py-5"><div><h2 className="text-xl font-bold text-[#172033]">{title}</h2>{description && <p className="mt-1 text-sm text-[#727986]">{description}</p>}</div><button type="button" aria-label="Close" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#687080] hover:bg-[#f1f2f7]"><X className="h-5 w-5"/></button></header><div className="p-6">{children}</div></section></div>;
}
