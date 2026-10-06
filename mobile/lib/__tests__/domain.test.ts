import { validateRegistrationInput } from "../auth-validation";
import { createEmptyClaimDraft, validateClaimUpdate, validateNewClaim } from "../claim-validation";
import { documentUploadBlocker } from "../document-validation";
import { formatDate, fromIsoDate, toIsoDate } from "../format";
import type { AssetDocumentSummary, DocumentType } from "../types";

const doc = (fileType: DocumentType): AssetDocumentSummary => ({
  id: Math.random().toString(),
  fileName: "file.pdf",
  fileType,
  fileUrl: "https://example.com/file.pdf",
  fileSize: 100,
  ocrProcessed: false,
  createdAt: "2025-01-01",
});

describe("claims", () => {
  it("requires an asset before filing", () => {
    expect(validateNewClaim({ ...createEmptyClaimDraft(), title: "Broken", issueDescription: "It stopped working" })).toEqual({
      valid: false,
      message: "Choose the asset this claim is for.",
    });
  });

  it("converts cleared fields to null on update", () => {
    const result = validateClaimUpdate({
      ...createEmptyClaimDraft("asset_1"),
      title: "Broken screen",
      issueDescription: "The screen flickers and goes dark.",
    });
    expect(result.valid && result.value.serviceCenter).toBeNull();
  });
});

describe("document limits", () => {
  it("allows only one invoice per asset", () => {
    expect(documentUploadBlocker("INVOICE", [doc("INVOICE")])).toMatch(/already has/);
    expect(documentUploadBlocker("RECEIPT", [doc("INVOICE")])).toBeNull();
  });

  it("caps purchase documents at three", () => {
    const existing = [doc("INVOICE"), doc("RECEIPT"), doc("OTHER")];
    expect(documentUploadBlocker("RECEIPT", existing)).toMatch(/up to 3/);
    expect(documentUploadBlocker("PRODUCT_IMAGE", existing)).toBeNull();
  });
});

describe("dates", () => {
  it("round-trips calendar dates without a timezone shift", () => {
    expect(toIsoDate(fromIsoDate("2025-03-01") as Date)).toBe("2025-03-01");
  });

  it("follows the user's date format", () => {
    expect(formatDate("2025-03-14T12:00:00", "DD_MM_YYYY")).toBe("14/03/2025");
    expect(formatDate("2025-03-14T12:00:00", "MMM_D_YYYY")).toBe("Mar 14, 2025");
  });
});

describe("registration", () => {
  it("requires matching passwords", () => {
    expect(validateRegistrationInput("Ada Lovelace", "ada@example.com", "password1", "password2")).toBe(
      "The passwords do not match.",
    );
  });
});
