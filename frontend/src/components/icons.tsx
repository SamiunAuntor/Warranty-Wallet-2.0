import type { SVGProps } from "react";

type IconName = "sparkles" | "arrow" | "scan" | "calendar" | "vault" | "support" | "receipt" | "warning" | "check" | "dashboard" | "products" | "documents" | "notifications" | "profile" | "settings" | "logout";

const paths: Record<IconName, React.ReactNode> = {
  sparkles: <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Zm-6 9 .8 2.2L9 15l-2.2.8L6 18l-.8-2.2L3 15l2.2-.8L6 12Zm11 2 .8 2.2L20 17l-2.2.8L17 20l-.8-2.2L14 17l2.2-.8L17 14Z" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  scan: <><path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3"/><path d="M7 9h10v6H7zM9 12h6"/></>,
  calendar: <><path d="M5 5h14v15H5zM8 3v4m8-4v4M5 9h14"/><path d="m9 14 2 2 4-4"/></>,
  vault: <><path d="M4 7h16v13H4zM7 4h10v3M8 11h8M8 15h5"/></>,
  support: <><path d="M5 12a7 7 0 0 1 14 0v5h-3v-5M5 12v5h3v-5"/><path d="M16 19c-1 1-2 1-4 1"/></>,
  receipt: <><path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1V3Z"/><path d="M9 8h6m-6 4h6"/></>,
  warning: <><path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v5m0 3v.01"/></>,
  check: <path d="m5 12 4 4L19 6" />,
  dashboard: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
  products: <><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/></>,
  documents: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4M9 13h6m-6 4h6"/></>,
  notifications: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6A8 8 0 0 0 8.8 7L6.5 6l-2 3.4L6.6 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1A8 8 0 0 0 10.4 18l.3 2.5h4L15 18a8 8 0 0 0 1.6-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"/></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4m4-4H9"/></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
