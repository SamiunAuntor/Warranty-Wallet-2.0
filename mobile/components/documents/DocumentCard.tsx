import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DocumentRecord } from "../../lib/documents-api";
import { colors, spacing } from "../../lib/theme";

type DocumentCardProps = {
  document: DocumentRecord;
  onDelete: () => void;
  onOpen: () => void;
};

export function DocumentCard({ document, onDelete, onOpen }: DocumentCardProps) {
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.fileName}>{document.fileName}</Text>
        <Text style={styles.muted}>
          {document.product.name} - {document.fileType.replaceAll("_", " ")}
        </Text>
        <Text style={styles.muted}>{new Date(document.createdAt).toLocaleDateString()}</Text>
      </View>
      <Pressable onPress={onDelete}>
        <Text style={styles.delete}>Delete</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  fileName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  delete: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
});
