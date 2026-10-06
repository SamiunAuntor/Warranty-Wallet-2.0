import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { AssetDraft } from "../../lib/asset-validation";
import { warrantyTypeLabels } from "../../lib/labels";
import { spacing } from "../../lib/theme";
import type { Brand, Category, WarrantyType } from "../../lib/types";
import { Card } from "../ui/Card";
import { Segmented } from "../ui/Chips";
import { DateField } from "../ui/DateField";
import { SwitchRow } from "../ui/Rows";
import { SelectField } from "../ui/SelectField";
import { Text } from "../ui/Text";
import { TextField } from "../ui/TextField";

type Props = {
  draft: AssetDraft;
  onChange: (draft: AssetDraft) => void;
  categories: Category[];
  brands: Brand[];
  errorField?: keyof AssetDraft;
  error?: string;
};

const OTHER_BRAND = "__other__";

/** Every field the API accepts for an asset, grouped the way the web form is. */
export function AssetForm({ draft, onChange, categories, brands, errorField, error }: Props) {
  const set = <K extends keyof AssetDraft>(field: K, value: AssetDraft[K]) =>
    onChange({ ...draft, [field]: value });
  const fieldError = (field: keyof AssetDraft) => (errorField === field ? error : null);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.isActive || category.id === draft.categoryId)
        .map((category) => ({ value: category.id, label: category.name })),
    [categories, draft.categoryId],
  );
  const brandOptions = useMemo(
    () => [
      ...brands
        .filter((brand) => brand.isActive || brand.id === draft.brandId)
        .map((brand) => ({ value: brand.id, label: brand.name })),
      { value: OTHER_BRAND, label: "Other brand", description: "Type the brand name yourself" },
    ],
    [brands, draft.brandId],
  );
  const usingCatalogBrand = Boolean(draft.brandId);

  return (
    <View style={styles.form}>
      <Card style={styles.section}>
        <Text variant="overline">Product</Text>
        <TextField
          label="Product name"
          placeholder="e.g. MacBook Air 13-inch"
          value={draft.name}
          onChangeText={(value) => set("name", value)}
          error={fieldError("name")}
        />
        <SelectField
          label="Brand"
          placeholder="Choose a brand"
          value={draft.brandId ?? (draft.brand ? OTHER_BRAND : null)}
          options={brandOptions}
          searchable
          onChange={(value) => {
            if (value === OTHER_BRAND) {
              onChange({ ...draft, brandId: null, brand: usingCatalogBrand ? "" : draft.brand });
              return;
            }
            const brand = brands.find((item) => item.id === value);
            onChange({ ...draft, brandId: value, brand: brand?.name ?? draft.brand });
          }}
        />
        {!usingCatalogBrand ? (
          <TextField
            label="Brand name"
            placeholder="e.g. Apple"
            value={draft.brand}
            onChangeText={(value) => set("brand", value)}
            error={fieldError("brand")}
          />
        ) : null}
        <SelectField
          label="Category"
          placeholder="Choose a category"
          value={draft.categoryId}
          options={categoryOptions}
          onChange={(value) => set("categoryId", value)}
          error={fieldError("categoryId")}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Model"
              optional
              placeholder="A2681"
              value={draft.model}
              onChangeText={(value) => set("model", value)}
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="Serial number"
              optional
              autoCapitalize="characters"
              value={draft.serialNumber}
              onChangeText={(value) => set("serialNumber", value)}
            />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="overline">Purchase</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Price"
              keyboardType="decimal-pad"
              placeholder="0.00"
              value={draft.purchasePrice}
              onChangeText={(value) => set("purchasePrice", value)}
              error={fieldError("purchasePrice")}
            />
          </View>
          <View style={styles.half}>
            <DateField
              label="Purchase date"
              value={draft.purchaseDate}
              maximumDate={new Date()}
              onChange={(value) => set("purchaseDate", value)}
              error={fieldError("purchaseDate")}
            />
          </View>
        </View>
        <TextField
          label="Seller"
          optional
          placeholder="Store or website"
          value={draft.sellerName}
          onChangeText={(value) => set("sellerName", value)}
        />
        <TextField
          label="Seller phone"
          optional
          keyboardType="phone-pad"
          value={draft.sellerPhone}
          onChangeText={(value) => set("sellerPhone", value)}
        />
        <TextField
          label="Seller address"
          optional
          value={draft.sellerAddress}
          onChangeText={(value) => set("sellerAddress", value)}
        />
      </Card>

      <Card style={styles.section}>
        <Text variant="overline">Warranty</Text>
        <SwitchRow
          title="This purchase has a warranty"
          subtitle="We'll remind you before it expires."
          value={draft.hasWarranty}
          onValueChange={(value) => set("hasWarranty", value)}
        />
        {draft.hasWarranty ? (
          <>
            <Segmented<WarrantyType>
              options={(Object.keys(warrantyTypeLabels) as WarrantyType[]).map((value) => ({
                value,
                label: warrantyTypeLabels[value],
              }))}
              value={draft.warrantyType}
              onChange={(value) => set("warrantyType", value)}
            />
            <TextField
              label="Warranty length (months)"
              keyboardType="number-pad"
              placeholder="12"
              value={draft.warrantyDuration}
              onChangeText={(value) => set("warrantyDuration", value.replace(/[^0-9]/g, ""))}
              error={fieldError("warrantyDuration")}
            />
          </>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text variant="overline">Notes</Text>
        <TextField
          multiline
          placeholder="Anything worth remembering about this purchase"
          value={draft.notes}
          onChangeText={(value) => set("notes", value)}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  section: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
});
