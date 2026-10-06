import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClaimForm } from "../../../components/claims/ClaimForm";
import { Button } from "../../../components/ui/Button";
import { Screen } from "../../../components/ui/Screen";
import { ScreenHeader } from "../../../components/ui/ScreenHeader";
import { ErrorState, InlineMessage, LoadingState } from "../../../components/ui/ScreenStates";
import { useAssetList } from "../../../hooks/use-assets";
import { useClaim, useCreateClaim, useUpdateClaim, type PendingEvidence } from "../../../hooks/use-claims";
import { errorMessage } from "../../../lib/api";
import {
  claimToDraft,
  createEmptyClaimDraft,
  validateClaimUpdate,
  validateNewClaim,
  type ClaimDraft,
} from "../../../lib/claim-validation";
import { useToast } from "../../../providers/toast-provider";

/** File a claim, or edit one when opened with ?id=. ?productId= preselects the asset. */
export default function ClaimFormScreen() {
  const params = useLocalSearchParams<{ id?: string; productId?: string }>();
  const editing = Boolean(params.id);
  const toast = useToast();
  const claim = useClaim(params.id);
  const assets = useAssetList({ limit: 100 });
  const create = useCreateClaim();
  const update = useUpdateClaim(params.id ?? "");

  const [draft, setDraft] = useState<ClaimDraft>(() => createEmptyClaimDraft(params.productId ?? ""));
  const [evidence, setEvidence] = useState<PendingEvidence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (editing && claim.data && !initialized.current) {
      initialized.current = true;
      setDraft(claimToDraft(claim.data));
    }
  }, [claim.data, editing]);

  const assetOptions = useMemo(
    () =>
      assets.items.map((asset) => ({
        value: asset.id,
        label: asset.name,
        description: [asset.brand, asset.model].filter(Boolean).join(" · "),
      })),
    [assets.items],
  );

  async function submit() {
    setError(null);
    try {
      if (editing) {
        const result = validateClaimUpdate(draft);
        if (!result.valid) {
          setError(result.message);
          return;
        }
        await update.mutateAsync(result.value);
        toast.success("Claim updated.");
        router.back();
        return;
      }
      const result = validateNewClaim(draft);
      if (!result.valid) {
        setError(result.message);
        return;
      }
      const created = await create.mutateAsync({ input: result.value, evidence });
      toast.success("Claim filed.");
      router.replace(`/(app)/claims/${created.id}`);
    } catch (cause) {
      setError(errorMessage(cause, "Could not save the claim."));
    }
  }

  const header = (
    <ScreenHeader title={editing ? "Edit claim" : "New claim"} fallbackHref="/(app)/claims" />
  );

  if (editing && claim.isPending) return <Screen header={header}><LoadingState /></Screen>;
  if (editing && claim.isError) {
    return (
      <Screen header={header}>
        <ErrorState error={claim.error} onRetry={() => void claim.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen
      header={header}
      footer={
        <Button
          title={editing ? "Save changes" : "Submit claim"}
          loading={create.isPending || update.isPending}
          fullWidth
          onPress={() => void submit()}
        />
      }
    >
      <InlineMessage message={error} />
      <ClaimForm
        draft={draft}
        onChange={setDraft}
        mode={editing ? "edit" : "create"}
        assetOptions={assetOptions}
        assetsLoading={assets.isPending}
        evidence={evidence}
        onEvidenceChange={setEvidence}
      />
    </Screen>
  );
}
