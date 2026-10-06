import type { Currency, DateFormat } from "./types";

export type FormatOptions = { currency?: Currency; dateFormat?: DateFormat };

const MS_PER_DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function formatDate(value: string | Date | null | undefined, format: DateFormat = "MMM_D_YYYY") {
  if (!value) return "—";
  const date = toDate(value);
  if (!date) return "—";
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (format === "DD_MM_YYYY") return `${pad(day)}/${pad(month + 1)}/${year}`;
  if (format === "MM_DD_YYYY") return `${pad(month + 1)}/${pad(day)}/${year}`;
  return `${MONTHS[month]} ${day}, ${year}`;
}

export function formatDateTime(value: string | Date | null | undefined, format?: DateFormat) {
  const date = value ? toDate(value) : null;
  if (!date) return "—";
  return `${formatDate(date, format)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatMoney(value: string | number | null | undefined, currency: Currency = "USD") {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat("en-US").format(amount) : "—";
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Whole days from today until the date. Negative once the date has passed. */
export function daysUntil(value: string | Date) {
  const date = toDate(value);
  if (!date) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
}

export function describeDaysUntil(value: string | Date) {
  const days = daysUntil(value);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 0) return `In ${days} days`;
  if (days === -1) return "Yesterday";
  return `${Math.abs(days)} days ago`;
}

export function relativeTime(value: string | Date) {
  const date = toDate(value);
  if (!date) return "";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/** Formats a local calendar date as YYYY-MM-DD without a timezone shift. */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses YYYY-MM-DD (or an ISO timestamp) as a local calendar date. */
export function fromIsoDate(value: string | null | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
