import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type DocumentRecord,
  type DocumentType,
  type NativeFile,
} from "../../lib/documents-api";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

const types: DocumentType[] = ["INVOICE", "WARRANTY_CARD", "RECEIPT", "OTHER"];
export default function DocumentsScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<DocumentType>("INVOICE");
  const [file, setFile] = useState<NativeFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setDocuments((await getDocuments(await user.getIdToken(), search)).data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [search, user]);
  useEffect(() => {
    void load();
  }, [load]);
  async function pick() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ["application/pdf", "image/*"],
    });
    if (!result.canceled)
      setFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        mimeType: result.assets[0].mimeType,
        size: result.assets[0].size,
      });
  }
  async function upload() {
    if (!user || !productId.trim() || !file)
      return setError("Enter the asset ID and choose a file.");
    setUploading(true);
    setError("");
    try {
      const [created] = await uploadDocument(await user.getIdToken(), productId.trim(), type, file);
      setDocuments((current) => [created, ...current]);
      setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload document.");
    } finally {
      setUploading(false);
    }
  }
  function remove(document: DocumentRecord) {
    if (!user) return;
    Alert.alert("Delete document?", document.fileName, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDocument(await user.getIdToken(), document.id);
            setDocuments((current) => current.filter((item) => item.id !== document.id));
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not delete document.");
          }
        },
      },
    ]);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PURCHASE RECORDS</Text>
      <Text style={styles.title}>Documents</Text>
      <TextInput
        onChangeText={setSearch}
        placeholder="Search documents"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={search}
      />
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
          {types.map((item) => (
            <Pressable
              key={item}
              onPress={() => setType(item)}
              style={[styles.type, type === item && styles.typeSelected]}
            >
              <Text style={type === item ? styles.typeTextSelected : styles.typeText}>
                {item.replaceAll("_", " ")}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => void pick()} style={styles.choose}>
          <Text style={styles.chooseText}>{file ? file.name : "Choose PDF or image"}</Text>
        </Pressable>
        <Pressable disabled={uploading} onPress={() => void upload()} style={styles.save}>
          <Text style={styles.saveText}>{uploading ? "Uploading..." : "Upload document"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={documents}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No documents found.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => void Linking.openURL(item.fileUrl)} style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.fileName}>{item.fileName}</Text>
                <Text style={styles.muted}>
                  {item.product.name} · {item.fileType.replaceAll("_", " ")}
                </Text>
                <Text style={styles.muted}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Pressable onPress={() => remove(item)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    flex: 1,
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
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
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
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
  loader: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
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
  empty: {
    color: colors.muted,
    padding: spacing.xl,
    textAlign: "center",
  },
});
