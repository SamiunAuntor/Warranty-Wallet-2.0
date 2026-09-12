import { useCallback, useState } from "react";
import { downloadReport } from "../lib/reports-api";
import { useAuth } from "../providers/auth-provider";

export function useReports() {
  const { user } = useAuth();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const download = useCallback(
    async (report: string, format: "PDF" | "EXCEL") => {
      if (!user) return;

      setBusy(`${report}-${format}`);
      setError("");

      try {
        await downloadReport(await user.getIdToken(), report, format);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not download report.");
      } finally {
        setBusy("");
      }
    },
    [user],
  );

  return { busy, download, error };
}
