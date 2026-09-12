import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
export async function downloadReport(token: string, report: string, format: "PDF" | "EXCEL") {
  const extension = format === "PDF" ? "pdf" : "xlsx";
  const destination = `${FileSystem.cacheDirectory ?? ""}${report.replaceAll("/", "-")}.${extension}`;
  const result = await FileSystem.downloadAsync(`${apiUrl}/reports/${report}?format=${format}`, destination, { headers: { Authorization: `Bearer ${token}` } });
  if (result.status !== 200) throw new Error("Report download failed.");
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri);
}
