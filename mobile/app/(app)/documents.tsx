import * as Linking from "expo-linking";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DocumentCard } from "../../components/documents/DocumentCard";
import { DocumentUploadForm } from "../../components/documents/DocumentUploadForm";
import { useDocuments } from "../../hooks/use-documents";
import { colors, spacing } from "../../lib/theme";

export default function DocumentsScreen() {
  const [search, setSearch] = useState("");
  const { addDocument, documents, error, loading, removeDocument } = useDocuments(search);

  function confirmDelete(document: (typeof documents)[number]) {
    Alert.alert("Delete document?", document.fileName, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removeDocument(document).catch(() => undefined);
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
      <DocumentUploadForm
        onUpload={(draft) => addDocument(draft.productId, draft.type, draft.file!)}
      />
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
            <DocumentCard
              document={item}
              onDelete={() => confirmDelete(item)}
              onOpen={() => void Linking.openURL(item.fileUrl)}
            />
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
  empty: {
    color: colors.muted,
    padding: spacing.xl,
    textAlign: "center",
  },
});
