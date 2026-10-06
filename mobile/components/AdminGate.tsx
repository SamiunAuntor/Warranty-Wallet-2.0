import { ShieldAlert } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { useAuth } from "../providers/auth-provider";
import { EmptyState } from "./ui/ScreenStates";
import { Screen } from "./ui/Screen";
import { ScreenHeader } from "./ui/ScreenHeader";

/** Renders admin screens only for administrators. The API enforces this too. */
export function AdminGate({ children }: PropsWithChildren) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <>{children}</>;
  return (
    <Screen header={<ScreenHeader title="Admin" fallbackHref="/(app)/more" />}>
      <EmptyState
        icon={ShieldAlert}
        title="Administrator access required"
        message="This area is only available to Warranty Wallet administrators."
      />
    </Screen>
  );
}
