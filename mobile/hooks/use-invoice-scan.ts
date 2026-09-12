import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";
import { extractInvoice, type ExtractedAssetData } from "../lib/ai-api";
import { useAuth } from "../providers/auth-provider";

export function useInvoiceScan() {
  const { user } = useAuth();
  const [data, setData] = useState<ExtractedAssetData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = useCallback(async () => {
    if (!user) return;

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/pdf", "image/*"],
    });

    if (result.canceled) return;

    setBusy(true);
    setError("");

    try {
      const item = result.assets[0];
      setData(
        await extractInvoice(await user.getIdToken(), {
          uri: item.uri,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not extract invoice data.");
    } finally {
      setBusy(false);
    }
  }, [user]);

  return { busy, data, error, pick };
}
