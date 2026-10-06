import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { ApiError } from "./api";
import { API_URL } from "./config";

export type ReportFormat = "PDF" | "EXCEL";

export type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  adminOnly: boolean;
};

export const reports: ReportDefinition[] = [
  {
    id: "products",
    title: "Asset inventory",
    description: "Every asset with purchase and warranty details.",
    adminOnly: false,
  },
  {
    id: "warranty",
    title: "Warranty status",
    description: "Active, expiring, and expired warranties.",
    adminOnly: false,
  },
  {
    id: "payments",
    title: "Payment history",
    description: "Your subscription payments.",
    adminOnly: false,
  },
  {
    id: "admin/users",
    title: "User directory",
    description: "All accounts with plan and status.",
    adminOnly: true,
  },
  {
    id: "admin/revenue",
    title: "Revenue",
    description: "Successful payments by month.",
    adminOnly: true,
  },
  {
    id: "admin/categories",
    title: "Categories",
    description: "Asset counts per category.",
    adminOnly: true,
  },
];

/** Downloads a report to the cache directory and opens the share sheet. */
export async function downloadReport(token: string, report: string, format: ReportFormat) {
  const extension = format === "PDF" ? "pdf" : "xlsx";
  const stamp = new Date().toISOString().slice(0, 10);
  const destination = `${FileSystem.cacheDirectory}${report.replaceAll("/", "-")}-${stamp}.${extension}`;
  const result = await FileSystem.downloadAsync(
    `${API_URL}/reports/${report}?format=${format}`,
    destination,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (result.status !== 200) {
    const message = await FileSystem.readAsStringAsync(result.uri)
      .then((text) => (JSON.parse(text) as { message?: string }).message)
      .catch(() => undefined);
    await FileSystem.deleteAsync(result.uri, { idempotent: true });
    throw new ApiError(
      message ?? "The report could not be generated.",
      result.status,
      "REPORT_FAILED",
    );
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      dialogTitle: "Share report",
      mimeType:
        format === "PDF"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
  return result.uri;
}
