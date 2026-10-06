import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { FileText, MoreVertical } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useFormatters } from "../../hooks/use-preferences";
import { formatFileSize } from "../../lib/format";
import { documentTypeLabels } from "../../lib/labels";
import { colors, radius, spacing } from "../../lib/theme";
import type { DocumentType } from "../../lib/types";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";

type DocumentLike = {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileUrl: string;
  fileSize: number | null;
  createdAt: string;
  product?: { id: string; name: string };
};

const IMAGE_PATTERN = /\.(jpe?g|png|webp)(\?|$)/i;

export const isImageDocument = (document: { fileUrl: string; fileName: string }) =>
  IMAGE_PATTERN.test(document.fileUrl) || IMAGE_PATTERN.test(document.fileName);

/** Opens a stored file in the in-app browser, which can show PDFs and images. */
export function openDocument(document: { fileUrl: string }) {
  return WebBrowser.openBrowserAsync(document.fileUrl, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: colors.primary,
  });
}

export function DocumentCard({
  document,
  onMore,
  showAsset = false,
}: {
  document: DocumentLike;
  onMore?: () => void;
  showAsset?: boolean;
}) {
  const format = useFormatters();
  const details = [
    documentTypeLabels[document.fileType],
    format.date(document.createdAt),
    formatFileSize(document.fileSize),
  ].filter(Boolean);

  return (
    <Card
      onPress={() => void openDocument(document)}
      accessibilityLabel={`Open ${document.fileName}`}
      style={styles.card}
    >
      <View style={styles.row}>
        {isImageDocument(document) ? (
          <Image source={{ uri: document.fileUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.icon]}>
            <FileText size={22} color={colors.primary} />
          </View>
        )}
        <View style={styles.body}>
          <Text variant="subheading" numberOfLines={1}>
            {document.fileName}
          </Text>
          {showAsset && document.product ? (
            <Text variant="caption" color={colors.primary} numberOfLines={1}>
              {document.product.name}
            </Text>
          ) : null}
          <Text variant="caption" numberOfLines={1}>
            {details.join(" · ")}
          </Text>
        </View>
        {onMore ? (
          <Pressable
            accessibilityLabel={`More actions for ${document.fileName}`}
            hitSlop={12}
            onPress={onMore}
            style={styles.more}
          >
            <MoreVertical size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.sm + 2 },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  thumb: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, height: 48, width: 48 },
  icon: { alignItems: "center", backgroundColor: colors.primaryTint, justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  more: { padding: spacing.xxs },
});
