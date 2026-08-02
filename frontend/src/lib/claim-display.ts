import type { ClaimStatus } from "@/lib/claims-api";

export const claimStatusLabels: Record<ClaimStatus, string> = {
  SUBMITTED: "Submitted",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const claimStatusStyles: Record<ClaimStatus, string> = {
  SUBMITTED: "bg-[#edf0ff] text-[#4438b8]",
  IN_PROGRESS: "bg-[#fff4df] text-[#9a5a00]",
  RESOLVED: "bg-[#e8f7ef] text-[#28724d]",
  REJECTED: "bg-[#fdeced] text-[#a23843]",
  CANCELLED: "bg-[#f0f1f4] text-[#656b76]",
};
