import { Camera, Mail, Phone, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FileSourceSheet } from "../../components/documents/FileSourceSheet";
import { PlanBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Display";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { InlineMessage } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { TextField } from "../../components/ui/TextField";
import { useProfileActions } from "../../hooks/use-profile";
import { errorMessage } from "../../lib/api";
import { colors, radius, spacing } from "../../lib/theme";
import { useCurrentUser } from "../../providers/auth-provider";
import { useToast } from "../../providers/toast-provider";

export default function ProfileScreen() {
  const user = useCurrentUser();
  const toast = useToast();
  const { save, uploadPhoto } = useProfileActions();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone ?? "");
  }, [user.name, user.phone]);

  const dirty = name.trim() !== user.name || phone.trim() !== (user.phone ?? "");

  async function submit() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setError("Enter a name of at least 2 characters.");
      return;
    }
    if (trimmedPhone && trimmedPhone.length < 7) {
      setError("Enter a full phone number, or leave it empty.");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({ name: trimmedName, phone: trimmedPhone || null });
      toast.success("Profile saved.");
    } catch (cause) {
      setError(errorMessage(cause, "Could not save your profile."));
    }
  }

  return (
    <Screen
      header={<ScreenHeader title="Profile" fallbackHref="/(app)/more" />}
      footer={
        <Button
          title="Save profile"
          fullWidth
          disabled={!dirty}
          loading={save.isPending}
          onPress={() => void submit()}
        />
      }
    >
      <Card style={styles.hero}>
        <Pressable
          accessibilityLabel="Change profile photo"
          onPress={() => setPhotoOpen(true)}
          disabled={uploadPhoto.isPending}
        >
          <Avatar name={user.name} photoUrl={user.photoURL} size={88} />
          <View style={styles.cameraBadge}>
            <Camera size={14} color={colors.white} />
          </View>
        </Pressable>
        <Text variant="heading">{user.name}</Text>
        <PlanBadge plan={user.plan} />
        {uploadPhoto.isPending ? <Text variant="caption">Uploading photo…</Text> : null}
      </Card>

      <InlineMessage message={error} />

      <Card style={styles.form}>
        <TextField label="Full name" icon={UserRound} value={name} onChangeText={setName} autoComplete="name" />
        <TextField
          label="Phone"
          optional
          icon={Phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          value={phone}
          onChangeText={setPhone}
        />
        <TextField
          label="Email"
          icon={Mail}
          value={user.email}
          editable={false}
          hint="Your sign-in email can't be changed here."
        />
      </Card>

      <FileSourceSheet
        visible={photoOpen}
        imagesOnly
        title="Profile photo"
        onClose={() => setPhotoOpen(false)}
        onPicked={(file) =>
          uploadPhoto
            .mutateAsync(file)
            .then(() => toast.success("Profile photo updated."))
            .catch((cause: unknown) => toast.error(cause, "Could not update your photo."))
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: 0,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 30,
  },
  form: { gap: spacing.md },
});
