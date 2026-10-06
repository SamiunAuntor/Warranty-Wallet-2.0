import { Alert } from "react-native";

/** Shows a native confirmation dialog and resolves true when the user confirms. */
export function confirm({
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
}: {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
