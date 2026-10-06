import { CheckCircle2, Info, XCircle } from "lucide-react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../components/ui/Text";
import { errorMessage } from "../lib/api";
import { colors, radius, shadow, spacing } from "../lib/theme";

type ToastTone = "success" | "error" | "info";
type ToastState = { id: number; message: string; tone: ToastTone } | null;

type ToastApi = {
  success: (message: string) => void;
  error: (messageOrError: unknown, fallback?: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
const VISIBLE_MS = 3200;

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setToast(null),
    );
  }, [opacity]);

  const show = useCallback(
    (message: string, tone: ToastTone) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ id: Date.now(), message, tone });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, VISIBLE_MS);
    },
    [hide, opacity],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show(message, "success"),
      error: (value, fallback) =>
        show(typeof value === "string" ? value : errorMessage(value, fallback), "error"),
      info: (message) => show(message, "info"),
    }),
    [show],
  );

  const Icon = toast?.tone === "success" ? CheckCircle2 : toast?.tone === "error" ? XCircle : Info;
  const tint =
    toast?.tone === "success" ? colors.success : toast?.tone === "error" ? colors.danger : colors.primary;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.container, { top: insets.top + spacing.sm, opacity }]}
        >
          <Pressable accessibilityRole="alert" onPress={hide} style={styles.toast}>
            <Icon size={20} color={tint} />
            <Text variant="bodySmall" color={colors.heading} weight="medium" style={styles.text}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}

const styles = StyleSheet.create({
  container: { left: spacing.md, position: "absolute", right: spacing.md, zIndex: 1000 },
  toast: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    ...shadow.raised,
  },
  text: { flex: 1 },
});
