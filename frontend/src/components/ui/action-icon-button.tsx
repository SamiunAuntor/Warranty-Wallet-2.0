"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  tone?: "default" | "primary" | "danger";
};

const tones = {
  default: "text-[#394254] hover:bg-[#eef1f6]",
  primary: "text-[#5141df] hover:bg-[#eeecff]",
  danger: "text-[#ad2831] hover:bg-[#fff0f1]",
};

export function ActionIconButton({ icon: Icon, label, tooltip, tone = "default", className = "", ...props }: Props) {
  const tooltipText = tooltip ?? label.split(" ", 1)[0];

  return <span className="group relative inline-flex">
    <button type="button" aria-label={label} className={`flex h-9 w-9 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bcb5ff] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`} {...props}><Icon aria-hidden="true" className="h-4 w-4"/></button>
    <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+6px)] right-0 z-50 whitespace-nowrap rounded-md bg-[#20283a] px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">{tooltipText}</span>
  </span>;
}
