import Constants from "expo-constants";
import { KeyRound, LogOut, Server, Smartphone } from "lucide-react-native";
import { Platform } from "react-native";
import { Card, Section } from "../../components/ui/Card";
import { ListRow } from "../../components/ui/Rows";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useAccountSettings } from "../../hooks/use-settings";
import { API_URL } from "../../lib/config";
import { confirm } from "../../lib/confirm";
import { useToast } from "../../providers/toast-provider";

export default function SettingsScreen() {
  const toast = useToast();
  const { appUser, sendPasswordReset, signOut } = useAccountSettings();

  async function resetPassword() {
    const ok = await confirm({
      title: "Reset your password?",
      message: `We'll email a reset link to ${appUser?.email}.`,
      confirmLabel: "Send link",
    });
    if (!ok) return;
    sendPasswordReset.mutate(undefined, {
      onSuccess: () => toast.success("Check your email for the reset link."),
      onError: (error) => toast.error(error, "Could not send the reset email."),
    });
  }

  async function logout() {
    const ok = await confirm({ title: "Sign out?", confirmLabel: "Sign out" });
    if (ok) signOut.mutate();
  }

  return (
    <Screen header={<ScreenHeader title="Security and app" fallbackHref="/(app)/more" />}>
      <Section title="Security">
        <Card padded={false}>
          <ListRow
            icon={KeyRound}
            title="Change password"
            subtitle="Email yourself a secure reset link"
            onPress={() => void resetPassword()}
          />
          <ListRow icon={LogOut} title="Sign out" destructive trailing={null} onPress={() => void logout()} />
        </Card>
      </Section>
      <Section title="About">
        <Card padded={false}>
          <ListRow
            icon={Smartphone}
            title="Version"
            subtitle={`${Constants.expoConfig?.version ?? "—"} · ${Platform.OS === "ios" ? "iOS" : "Android"}`}
          />
          <ListRow icon={Server} title="Server" subtitle={API_URL} />
        </Card>
      </Section>
    </Screen>
  );
}
