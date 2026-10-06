import { Camera, FileText, Image as ImageIcon } from "lucide-react-native";
import { FileSelectionError, pickFile, type FileSource } from "../../lib/files";
import type { NativeFile } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";
import { ActionSheet, type SheetAction } from "../ui/Sheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPicked: (file: NativeFile) => void;
  title?: string;
  imagesOnly?: boolean;
};

/** Lets the user take a photo, choose one, or pick a PDF from files. */
export function FileSourceSheet({ visible, onClose, onPicked, title = "Add a file", imagesOnly }: Props) {
  const toast = useToast();

  async function choose(source: FileSource) {
    try {
      // Let the sheet finish closing before the system picker opens.
      await new Promise((resolve) => setTimeout(resolve, 350));
      const file = await pickFile(source, { imagesOnly });
      if (file) onPicked(file);
    } catch (error) {
      toast.error(error instanceof FileSelectionError ? error.message : error, "Could not open the file.");
    }
  }

  const actions: SheetAction[] = [
    { label: "Take a photo", description: "Use the camera", icon: Camera, onPress: () => void choose("camera") },
    {
      label: "Choose from photos",
      description: "JPG, PNG, or WebP",
      icon: ImageIcon,
      onPress: () => void choose("library"),
    },
  ];
  if (!imagesOnly) {
    actions.push({
      label: "Browse files",
      description: "PDF or image, up to 4 MB",
      icon: FileText,
      onPress: () => void choose("files"),
    });
  }

  return <ActionSheet visible={visible} onClose={onClose} title={title} actions={actions} />;
}
