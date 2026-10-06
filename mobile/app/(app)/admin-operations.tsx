import { CreditCard, Package, ShieldCheck, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdminGate } from "../../components/AdminGate";
import { ClaimBadge, Badge, WarrantyBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chips, Segmented } from "../../components/ui/Chips";
import { SearchBar } from "../../components/ui/Display";
import { PagedList } from "../../components/ui/PagedList";
import { EmptyState } from "../../components/ui/ScreenStates";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SelectField } from "../../components/ui/SelectField";
import { Text } from "../../components/ui/Text";
import {
  useAdminActions,
  useAdminAssets,
  useAdminClaims,
  useAdminPayments,
} from "../../hooks/use-admin-operations";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { confirm } from "../../lib/confirm";
import { formatDate, formatMoney } from "../../lib/format";
import { claimStatuses, claimStatusLabels, paymentStatusLabels, planNames } from "../../lib/labels";
import { colors, spacing } from "../../lib/theme";
import type { ClaimStatus, PaymentStatus } from "../../lib/types";
import { useToast } from "../../providers/toast-provider";

type Tab = "assets" | "claims" | "payments";

export default function AdminOperationsScreen() {
  return (
    <AdminGate>
      <Operations />
    </AdminGate>
  );
}

function Operations() {
  const [tab, setTab] = useState<Tab>("claims");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());

  const controls = (
    <View style={styles.header}>
      <Segmented<Tab>
        options={[
          { value: "claims", label: "Claims" },
          { value: "assets", label: "Assets" },
          { value: "payments", label: "Payments" },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setSearch("");
        }}
      />
      <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${tab}`} />
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScreenHeader title="Operations" fallbackHref="/(app)/admin" />
      {tab === "claims" ? (
        <ClaimsList search={debounced} controls={controls} />
      ) : tab === "assets" ? (
        <AssetsList search={debounced} controls={controls} />
      ) : (
        <PaymentsList search={debounced} controls={controls} />
      )}
    </SafeAreaView>
  );
}

type ListProps = { search: string; controls: React.ReactElement };

function ClaimsList({ search, controls }: ListProps) {
  const toast = useToast();
  const [status, setStatus] = useState<"ALL" | ClaimStatus>("ALL");
  const claims = useAdminClaims(search, status === "ALL" ? undefined : status);
  const actions = useAdminActions();
  return (
    <PagedList
      query={claims}
      keyExtractor={(claim) => claim.id}
      header={
        <View style={styles.header}>
          {controls}
          <Chips
            scrollable
            options={[
              { value: "ALL" as const, label: "All" },
              ...claimStatuses.map((value) => ({ value, label: claimStatusLabels[value].label })),
            ]}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      renderItem={(claim) => (
        <Card>
          <View style={styles.rowBetween}>
            <Text variant="caption" weight="semibold" color={colors.primary}>
              #{claim.claimNumber}
            </Text>
            <ClaimBadge status={claim.status} />
          </View>
          <Text variant="subheading">{claim.title}</Text>
          <Text variant="caption">
            {claim.product.name} · {claim.user.name} ({claim.user.email})
          </Text>
          <SelectField
            value={claim.status}
            options={claimStatuses.map((value) => ({ value, label: claimStatusLabels[value].label }))}
            onChange={(value) =>
              actions.setClaimStatus.mutate(
                { id: claim.id, status: value as ClaimStatus },
                {
                  onSuccess: () => toast.success("Claim status updated."),
                  onError: (error) => toast.error(error, "Could not update the claim."),
                },
              )
            }
          />
        </Card>
      )}
      empty={<EmptyState icon={ShieldCheck} title="No claims found" />}
    />
  );
}

function AssetsList({ search, controls }: ListProps) {
  const toast = useToast();
  const assets = useAdminAssets(search);
  const actions = useAdminActions();

  async function remove(id: string, name: string) {
    const ok = await confirm({
      title: `Delete ${name}?`,
      message: "The asset and its documents and claims are removed for this user.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    actions.deleteAsset.mutate(id, {
      onSuccess: () => toast.success("Asset deleted."),
      onError: (error) => toast.error(error, "Could not delete the asset."),
    });
  }

  return (
    <PagedList
      query={assets}
      keyExtractor={(asset) => asset.id}
      header={controls}
      renderItem={(asset) => (
        <Card>
          <View style={styles.rowBetween}>
            <Text variant="subheading" numberOfLines={1} style={styles.flex}>
              {asset.name}
            </Text>
            <WarrantyBadge status={asset.warrantyStatus} />
          </View>
          <Text variant="caption">
            {asset.brand} · {formatMoney(asset.purchasePrice)} · {formatDate(asset.purchaseDate)}
          </Text>
          <Text variant="caption">
            Owner: {asset.user.name} ({asset.user.email})
          </Text>
          <Button
            title="Delete asset"
            icon={Trash2}
            size="sm"
            variant="dangerOutline"
            onPress={() => void remove(asset.id, asset.name)}
          />
        </Card>
      )}
      empty={<EmptyState icon={Package} title="No assets found" />}
    />
  );
}

function PaymentsList({ search, controls }: ListProps) {
  const [status, setStatus] = useState<"ALL" | PaymentStatus>("ALL");
  const payments = useAdminPayments(search, status === "ALL" ? undefined : status);
  return (
    <PagedList
      query={payments}
      keyExtractor={(payment) => payment.id}
      header={
        <View style={styles.header}>
          {controls}
          <Chips
            scrollable
            options={[
              { value: "ALL" as const, label: "All" },
              ...(Object.keys(paymentStatusLabels) as PaymentStatus[]).map((value) => ({
                value,
                label: paymentStatusLabels[value].label,
              })),
            ]}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      renderItem={(payment) => {
        const label = paymentStatusLabels[payment.status];
        return (
          <Card>
            <View style={styles.rowBetween}>
              <Text variant="subheading">{formatMoney(payment.amount, payment.currency.toUpperCase() as never)}</Text>
              <Badge label={label.label} tone={label.tone} />
            </View>
            <Text variant="caption">
              {payment.plan ? `${planNames[payment.plan]} plan` : "Payment"} · {formatDate(payment.createdAt)}
            </Text>
            <Text variant="caption">
              {payment.user.name} ({payment.user.email})
            </Text>
          </Card>
        );
      }}
      empty={<EmptyState icon={CreditCard} title="No payments found" />}
    />
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.canvas, flex: 1 },
  header: { gap: spacing.md },
  rowBetween: { alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  flex: { flex: 1 },
});
