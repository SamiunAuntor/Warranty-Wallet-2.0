import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  validateDocumentUpload,
  type DocumentUploadDraft,
} from "../../lib/document-validation";
import type { DocumentType, NativeFile } from "../../lib/documents-api";
import { colors, spacing } from "../../lib/theme";

const documentTypes: DocumentType[] = ["INVOICE", "WARRANTY_CARD", "RECEIPT", "OTHER"];

type DocumentUploadFormProps = {
  onUpload: (draft: DocumentUploadDraft) => Promise<void>;
};

export function DocumentUploadForm({ onUpload }: DocumentUploadFormProps) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<DocumentType>("INVOICE");
  const [file, setFile] = useState<NativeFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/pdf", "image/*"],
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      setFile({
        uri: selected.uri,
        name: selected.name,
        mimeType: selected.mimeType,
        size: selected.size,
      });
    }
  }

  async function submit() {
    const draft = { productId, type, file };
    const validationError = validateDocumentUpload(draft);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      await onUpload(draft);
      setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Upload a document</Text>
      <TextInput
        onChangeText={setProductId}
        placeholder="Asset ID"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={productId}
      />
      <View style={styles.typeRow}>
        {documentTypes.map((item) => {
          const selected = type === item;

          return (
            <Pressable
              key={item}
              onPress={() => setType(item)}
              style={[styles.type, selected && styles.typeSelected]}
            >
              <Text style={selected ? styles.typeTextSelected : styles.typeText}>
                {item.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={() => void pickFile()} style={styles.choose}>
        <Text style={styles.chooseText}>{file ? file.name : "Choose PDF or image"}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={uploading} onPress={() => void submit()} style={styles.save}>
        <Text style={styles.saveText}>{uploading ? "Uploading..." : "Upload document"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  formTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  input: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  type: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  typeText: {
    color: colors.muted,
    fontSize: 10,
  },
  typeTextSelected: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: "700",
  },
  choose: {
    borderColor: colors.brand,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  chooseText: {
    color: colors.brand,
    fontSize: 13,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  save: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  saveText: {
    color: colors.surface,
    fontWeight: "700",
  },
});
