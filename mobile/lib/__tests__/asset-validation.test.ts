import {
  applyExtraction,
  createEmptyAssetDraft,
  toAssetUpdate,
  validateAssetDraft,
  type AssetDraft,
} from "../asset-validation";

const validDraft = (): AssetDraft => ({
  ...createEmptyAssetDraft(),
  name: "MacBook Air",
  brand: "Apple",
  categoryId: "cat_1",
  purchasePrice: "1199.99",
  purchaseDate: "2025-01-15",
});

describe("validateAssetDraft", () => {
  it("builds a create payload that includes the warranty", () => {
    const result = validateAssetDraft(validDraft());
    expect(result).toEqual({
      valid: true,
      value: expect.objectContaining({
        purchasePrice: 1199.99,
        hasWarranty: true,
        warrantyDuration: 12,
        warrantyType: "MANUFACTURER",
      }),
    });
  });

  it("clears warranty fields when the asset has no warranty", () => {
    const result = validateAssetDraft({ ...validDraft(), hasWarranty: false });
    expect(result.valid && result.value).toMatchObject({
      hasWarranty: false,
      warrantyDuration: null,
      warrantyType: null,
    });
  });

  it.each([
    [{ purchasePrice: "0" }, "purchasePrice"],
    [{ categoryId: "" }, "categoryId"],
    [{ name: "A" }, "name"],
    [{ warrantyDuration: "0" }, "warrantyDuration"],
    [{ purchaseDate: "2999-01-01" }, "purchaseDate"],
  ] as const)("rejects %p", (override, field) => {
    const result = validateAssetDraft({ ...validDraft(), ...override });
    expect(result).toMatchObject({ valid: false, field });
  });

  it("omits empty optional fields when creating", () => {
    const result = validateAssetDraft(validDraft());
    expect(result.valid && result.value.model).toBeUndefined();
  });
});

describe("toAssetUpdate", () => {
  it("sends null so the API clears optional fields", () => {
    const result = validateAssetDraft(validDraft());
    if (!result.valid) throw new Error("expected a valid draft");
    expect(toAssetUpdate(result.value)).toMatchObject({ model: null, notes: null });
  });
});

describe("applyExtraction", () => {
  it("fills empty fields from an invoice without clearing existing ones", () => {
    const draft = { ...createEmptyAssetDraft(), notes: "Gift" };
    const next = applyExtraction(
      draft,
      { productName: "Galaxy S24", brand: "Samsung", purchasePrice: 799, warrantyDuration: 24 },
      { categoryId: "phones", brandId: "brand_samsung" },
    );
    expect(next).toMatchObject({
      name: "Galaxy S24",
      brand: "Samsung",
      brandId: "brand_samsung",
      categoryId: "phones",
      purchasePrice: "799",
      warrantyDuration: "24",
      notes: "Gift",
    });
  });
});
