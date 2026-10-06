import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import type { NativeFile } from "./types";

export type FileSource = "camera" | "library" | "files";

/** Matches the API upload limit (Vercel caps request bodies at 4.5 MB). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export class FileSelectionError extends Error {}

function inferMimeType(name: string, reported?: string | null) {
  if (reported && reported !== "application/octet-stream") {
    return reported === "image/jpg" ? "image/jpeg" : reported;
  }
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

function ensureFileName(name: string | null | undefined, mimeType: string) {
  if (name) return name;
  const extension = mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1] ?? "jpg";
  return `upload-${Date.now()}.${extension}`;
}

function finalize(file: NativeFile, imagesOnly: boolean): NativeFile {
  if (!SUPPORTED_TYPES.includes(file.mimeType) || (imagesOnly && !file.mimeType.startsWith("image/"))) {
    throw new FileSelectionError(
      imagesOnly ? "Choose a JPG, PNG, or WebP image." : "Choose a PDF, JPG, PNG, or WebP file.",
    );
  }
  if (file.size && file.size > MAX_UPLOAD_BYTES) {
    throw new FileSelectionError("This file is larger than 4 MB. Choose a smaller file.");
  }
  return file;
}

/**
 * Opens the camera, photo library, or file browser. Resolves null when the
 * user cancels, and throws FileSelectionError for permission or type problems.
 */
export async function pickFile(source: FileSource, options: { imagesOnly?: boolean } = {}) {
  const imagesOnly = options.imagesOnly ?? false;

  if (source === "files") {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: imagesOnly ? ["image/jpeg", "image/png", "image/webp"] : SUPPORTED_TYPES,
    });
    if (result.canceled) return null;
    const asset = result.assets[0];
    const mimeType = inferMimeType(asset.name, asset.mimeType);
    return finalize(
      { uri: asset.uri, name: ensureFileName(asset.name, mimeType), mimeType, size: asset.size },
      imagesOnly,
    );
  }

  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new FileSelectionError(
      source === "camera"
        ? "Camera access is needed. Enable it in your device settings."
        : "Photo access is needed. Enable it in your device settings.",
    );
  }

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.7,
    // Returns JPEG instead of HEIC on iOS, which the API does not accept.
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled) return null;

  const asset = result.assets[0];
  const mimeType = inferMimeType(asset.fileName ?? "", asset.mimeType);
  return finalize(
    {
      uri: asset.uri,
      name: ensureFileName(asset.fileName, mimeType),
      mimeType,
      size: asset.fileSize,
    },
    imagesOnly,
  );
}
