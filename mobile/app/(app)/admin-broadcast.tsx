import { Megaphone } from "lucide-react-native";
import { useState } from "react";
import { AdminGate } from "../../components/AdminGate";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { InlineMessage } from "../../components/ui/ScreenStates";
import { Text } from "../../components/ui/Text";
import { TextField } from "../../components/ui/TextField";
import { useBroadcast } from "../../hooks/use-admin-dashboard";
import { errorMessage } from "../../lib/api";
import { confirm } from "../../lib/confirm";
import { colors } from "../../lib/theme";
import { useToast } from "../../providers/toast-provider";

export default function AdminBroadcastScreen() {
  return (
    <AdminGate>
      <Broadcast />
    </AdminGate>
  );
}

function Broadcast() {
  const toast = useToast();
  const broadcast = useBroadcast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (title.trim().length < 3) {
      setError("Enter a title of at least 3 characters.");
      return;
    }
    if (message.trim().length < 5) {
      setError("Enter a message of at least 5 characters.");
      return;
    }
    setError(null);
    const ok = await confirm({
      title: "Send to every user?",
      message: "Each user gets this notification in their inbox.",
      confirmLabel: "Send",
    });
    if (!ok) return;
    try {
      await broadcast.mutateAsync({ title: title.trim(), message: message.trim() });
      toast.success("Announcement sent.");
      setTitle("");
      setMessage("");
    } catch (cause) {
      setError(errorMessage(cause, "Could not send the announcement."));
    }
  }

  return (
    <Screen
      header={<ScreenHeader title="Broadcast" fallbackHref="/(app)/admin" />}
      footer={
        <Button title="Send announcement" icon={Megaphone} fullWidth loading={broadcast.isPending} onPress={() => void send()} />
      }
    >
      <Text variant="bodySmall" color={colors.muted}>
        Announcements appear in every user&apos;s notification inbox.
      </Text>
      <InlineMessage message={error} />
      <Card>
        <TextField label="Title" maxLength={100} value={title} onChangeText={setTitle} />
        <TextField
          label="Message"
          multiline
          maxLength={1000}
          hint={`${message.length}/1000`}
          value={message}
          onChangeText={setMessage}
        />
      </Card>
    </Screen>
  );
}
