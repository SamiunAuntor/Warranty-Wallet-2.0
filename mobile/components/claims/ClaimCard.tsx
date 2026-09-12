import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Claim, ClaimStatus } from "../../lib/claims-api";
import { colors, spacing } from "../../lib/theme";

const statuses: ClaimStatus[] = [
  "SUBMITTED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "CANCELLED",
];

type ClaimCardProps = {
  claim: Claim;
  onPress: () => void;
  onStatusChange: (status: ClaimStatus) => void;
};

export function ClaimCard({ claim, onPress, onStatusChange }: ClaimCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.claimNumber}>{claim.claimNumber}</Text>
      <Text style={styles.claimTitle}>{claim.title}</Text>
      <Text style={styles.muted}>
        {claim.product.name} - {claim.product.brand}
      </Text>
      <Text style={styles.muted}>{claim.issueDescription}</Text>
      <View style={styles.statusRow}>
        {statuses.map((status) => {
          const selected = claim.status === status;

          return (
            <Pressable
              key={status}
              onPress={() => onStatusChange(status)}
              style={[styles.status, selected && styles.statusSelected]}
            >
              <Text style={selected ? styles.statusTextSelected : styles.statusText}>
                {status.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  claimNumber: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  claimTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  status: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
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
});
