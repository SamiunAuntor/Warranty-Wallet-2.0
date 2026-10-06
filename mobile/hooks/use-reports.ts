import { useState } from "react";
import { downloadReport, type ReportFormat } from "../lib/reports-api";
import { getFirebaseAuth } from "../lib/firebase";
import { useToast } from "../providers/toast-provider";

/** Downloads a report and opens the share sheet. Tracks which one is running. */
export function useReports() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function download(report: string, format: ReportFormat) {
    const user = getFirebaseAuth().currentUser;
    if (!user || busy) return;
    setBusy(`${report}:${format}`);
    try {
      await downloadReport(await user.getIdToken(), report, format);
    } catch (error) {
      toast.error(error, "Could not download the report.");
    } finally {
      setBusy(null);
    }
  }

  return { busy, download };
}
