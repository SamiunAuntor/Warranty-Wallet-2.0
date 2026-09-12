import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { extractInvoice, type ExtractedAssetData } from "../../lib/ai-api";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function ScanScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<ExtractedAssetData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick() {
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
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>SMART CAPTURE</Text>
      <Text style={styles.title}>Scan an invoice</Text>
      <Text style={styles.copy}>
        Upload an invoice or receipt and use the existing AI extraction service to prefill asset
        details.
      </Text>
      <Pressable disabled={busy} onPress={() => void pick()} style={styles.primary}>
        <Text style={styles.primaryText}>{busy ? "Extracting..." : "Choose invoice"}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {busy ? <ActivityIndicator color={colors.brand} /> : null}
      {data ? (
        <View style={styles.card}>
          {Object.entries(data)
            .filter(([, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => (
              <View key={key} style={styles.row}>
                <Text style={styles.key}>{key}</Text>
                <Text style={styles.value}>{String(value)}</Text>
              </View>
            ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "800",
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  primary: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    padding: spacing.md,
  },
  primaryText: {
    color: colors.surface,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  key: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});
