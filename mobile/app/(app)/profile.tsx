import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { updateAppUser, uploadProfilePhoto } from "../../lib/auth-api";
import { colors, spacing } from "../../lib/theme";
import { useAuth } from "../../providers/auth-provider";

export default function ProfileScreen() {
  const { user, appUser, setAppUser } = useAuth();
  const [name, setName] = useState(appUser?.name ?? "");
  const [phone, setPhone] = useState(appUser?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function photo() {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return setError("Photo access is required to choose a profile image.");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setSaving(true);
    try {
      setAppUser(
        await uploadProfilePhoto(await user.getIdToken(), {
          uri: asset.uri,
          name: asset.fileName ?? "profile.jpg",
          mimeType: asset.mimeType,
          size: asset.fileSize,
        }),
      );
      setMessage("Profile photo updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update photo.");
    } finally {
      setSaving(false);
    }
  }
  async function save() {
    if (!user || !name.trim()) return setError("Name is required.");
    setSaving(true);
    setError("");
    try {
      setAppUser(
        await updateAppUser(await user.getIdToken(), {
          name: name.trim(),
          phone: phone.trim() || null,
        }),
      );
      setMessage("Profile updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }
  if (!appUser)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        {appUser.photoURL ? (
          <Image source={{ uri: appUser.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.initial}>{appUser.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Pressable disabled={saving} onPress={() => void photo()} style={styles.outline}>
          <Text style={styles.outlineText}>Change photo</Text>
        </Pressable>
        <Text style={styles.label}>Name</Text>
        <TextInput onChangeText={setName} style={styles.input} value={name} />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          style={styles.input}
          value={phone}
        />
        <Text style={styles.email}>{appUser.email}</Text>
        <Pressable disabled={saving} onPress={() => void save()} style={styles.save}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save profile"}</Text>
        </Pressable>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.canvas,
    gap: spacing.md,
    padding: spacing.lg,
  },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800" },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  avatar: { borderRadius: 48, height: 96, width: 96 },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  initial: { color: colors.brand, fontSize: 36, fontWeight: "800" },
  outline: {
    borderColor: colors.brand,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  outlineText: { color: colors.brand, fontWeight: "700" },
  label: {
    alignSelf: "stretch",
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.md,
  },
  input: {
    alignSelf: "stretch",
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  email: {
    alignSelf: "stretch",
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  save: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 10,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  saveText: { color: colors.surface, fontWeight: "700" },
  message: { color: colors.brand, marginTop: spacing.md },
  error: { color: colors.danger, marginTop: spacing.md },
});
