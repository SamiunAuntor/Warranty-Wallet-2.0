import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  attachClaimDocument,
  deleteClaim,
  detachClaimDocument,
  getClaim,
  updateClaim,
  type Claim,
  type ClaimStatus,
} from "../../../lib/claims-api";
import { uploadDocument } from "../../../lib/documents-api";
import { colors, spacing } from "../../../lib/theme";
import { useAuth } from "../../../providers/auth-provider";

const statuses: ClaimStatus[] = ["SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CANCELLED"];
export default function ClaimDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!user || !id) return;
    try {
      setClaim(await getClaim(await user.getIdToken(), id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load claim.");
    }
  }, [id, user]);
  useEffect(() => {
    void load();
  }, [load]);
  async function status(value: ClaimStatus) {
    if (!user || !claim) return;
    try {
      setClaim(await updateClaim(await user.getIdToken(), claim.id, { status: value }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update claim.");
    }
  }
  async function timeline() {
    if (!user || !claim || !eventTitle.trim()) return;
    try {
      setClaim(
        await (
          await import("../../../lib/claims-api")
        ).addClaimTimelineEvent(await user.getIdToken(), claim.id, eventTitle.trim()),
      );
      setEventTitle("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add timeline event.");
    }
  }
  async function evidence() {
    if (!user || !claim) return;
    const picked = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/pdf", "image/*"],
    });
    if (picked.canceled) return;
    try {
      const file = picked.assets[0];
      const [document] = await uploadDocument(
        await user.getIdToken(),
        claim.productId,
        "CLAIM_EVIDENCE",
        {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
        },
      );
      setClaim(
        await attachClaimDocument(
          await user.getIdToken(),
          claim.id,
          document.id,
          "SUPPORTING_DOCUMENT",
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not attach evidence.");
    }
  }
  async function remove() {
    if (!user || !claim) return;
    try {
      await deleteClaim(await user.getIdToken(), claim.id);
      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete claim.");
    }
  }
  if (!claim)
    return (
      <View style={styles.center}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <ActivityIndicator color={colors.brand} />
        )}
      </View>
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back to claims</Text>
      </Pressable>
      <Text style={styles.eyebrow}>{claim.claimNumber}</Text>
      <Text style={styles.title}>{claim.title}</Text>
      <Text style={styles.muted}>
        {claim.product.name} · {claim.product.brand}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.section}>Status</Text>
        <View style={styles.statusRow}>
          {statuses.map((item) => (
            <Pressable
              key={item}
              onPress={() => void status(item)}
              style={[styles.status, item === claim.status && styles.statusSelected]}
            >
              <Text style={item === claim.status ? styles.statusTextSelected : styles.statusText}>
                {item.replaceAll("_", " ")}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.section}>Issue</Text>
        <Text style={styles.body}>{claim.issueDescription}</Text>
        {claim.resolution ? (
          <>
            <Text style={styles.section}>Resolution</Text>
            <Text style={styles.body}>{claim.resolution}</Text>
          </>
        ) : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Timeline</Text>
        {claim.timeline?.map((item) => (
          <View key={item.id} style={styles.timeline}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
            {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
          </View>
        ))}
        <TextInput
          onChangeText={setEventTitle}
          placeholder="Add timeline event"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={eventTitle}
        />
        <Pressable onPress={() => void timeline()} style={styles.outline}>
          <Text style={styles.outlineText}>Add event</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.section}>Evidence</Text>
        {claim.documents?.map((item) => (
          <View key={item.documentId} style={styles.document}>
            <Pressable onPress={() => void Linking.openURL(item.document.fileUrl)}>
              <Text style={styles.link}>{item.document.fileName}</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                void (async () =>
                  setClaim(
                    await detachClaimDocument(await user!.getIdToken(), claim.id, item.documentId),
                  ))()
              }
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => void evidence()} style={styles.primary}>
          <Text style={styles.primaryText}>Attach evidence</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => void remove()} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete claim</Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  back: {
    color: colors.brand,
    fontWeight: "700",
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
  muted: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.lg,
  },
  section: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  status: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  statusText: {
    color: colors.muted,
    fontSize: 10,
  },
  statusTextSelected: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "700",
  },
  timeline: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  timelineTitle: {
    color: colors.ink,
    fontWeight: "600",
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  outline: {
    alignItems: "center",
    borderColor: colors.brand,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  outlineText: {
    color: colors.brand,
    fontWeight: "700",
  },
  document: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  link: {
    color: colors.brand,
    flex: 1,
    fontWeight: "600",
  },
  remove: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  primary: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  primaryText: {
    color: colors.surface,
    fontWeight: "700",
  },
  deleteButton: {
    alignItems: "center",
    borderColor: colors.danger,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.md,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
  },
});
