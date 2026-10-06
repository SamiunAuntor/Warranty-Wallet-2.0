import { useMutation } from "@tanstack/react-query";
import { updateProfile, uploadProfilePhoto } from "../lib/auth-api";
import type { NativeFile } from "../lib/types";
import { useAuth } from "../providers/auth-provider";

export function useProfileActions() {
  const { setAppUser } = useAuth();

  const save = useMutation({
    mutationFn: (input: { name: string; phone: string | null }) => updateProfile(input),
    onSuccess: setAppUser,
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: NativeFile) => uploadProfilePhoto(file),
    onSuccess: setAppUser,
  });

  return { save, uploadPhoto };
}
