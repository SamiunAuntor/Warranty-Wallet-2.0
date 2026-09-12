import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { updateAppUser, uploadProfilePhoto } from "../lib/auth-api";
import { useAuth } from "../providers/auth-provider";

export function useProfile() {
  const { user, appUser, setAppUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const save = useCallback(
    async (name: string, phone: string) => {
      if (!user) return;
      if (!name.trim()) {
        setError("Name is required.");
        return;
      }

      setSaving(true);
      setError("");

      try {
        const updatedUser = await updateAppUser(await user.getIdToken(), {
          name: name.trim(),
          phone: phone.trim() || null,
        });
        setAppUser(updatedUser);
        setMessage("Profile updated.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update profile.");
      } finally {
        setSaving(false);
      }
    },
    [setAppUser, user],
  );

  const choosePhoto = useCallback(async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Photo access is required to choose a profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled) return;

    setSaving(true);
    setError("");

    try {
      const asset = result.assets[0];
      const updatedUser = await uploadProfilePhoto(await user.getIdToken(), {
        uri: asset.uri,
        name: asset.fileName ?? "profile.jpg",
        mimeType: asset.mimeType,
        size: asset.fileSize,
      });
      setAppUser(updatedUser);
      setMessage("Profile photo updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update photo.");
    } finally {
      setSaving(false);
    }
  }, [setAppUser, user]);

  return {
    appUser,
    choosePhoto,
    error,
    message,
    save,
    saving,
  };
}
