export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type Plan = "BASIC" | "PLUS" | "PRO";
export type PaidPlan = Exclude<Plan, "BASIC">;
export type WarrantyStatus = "NO_WARRANTY" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type WarrantyType = "MANUFACTURER" | "EXTENDED";
export type LifecycleStatus = "ADDED" | "ARCHIVED";
export type ClaimStatus = "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type SubscriptionStatus = "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "EXPIRED" | "CANCELLED";
export type EvidenceType =
  | "SUPPORTING_DOCUMENT"
  | "CONDITION_PHOTO"
  | "DAMAGE_PHOTO"
  | "CORRESPONDENCE"
  | "OTHER";
export type DocumentType =
  | "INVOICE"
  | "WARRANTY_CARD"
  | "PRODUCT_IMAGE"
  | "RECEIPT"
  | "OTHER"
  | "CLAIM_EVIDENCE"
  | "CLAIM_CONDITION";
export type Currency = "USD" | "BDT" | "EUR" | "GBP" | "CAD" | "AUD";
export type DateFormat = "MMM_D_YYYY" | "DD_MM_YYYY" | "MM_DD_YYYY";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type AppUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone?: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  plan: Plan;
  emailVerified: boolean;
  createdAt?: string;
};

export type UserPreferences = {
  id: string;
  userId: string;
  warrantyReminders: boolean;
  reminderDays: number[];
  timezone: string;
  currency: Currency;
  dateFormat: DateFormat;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  _count?: { products: number };
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  _count?: { products: number };
};

export type AssetDocumentSummary = {
  id: string;
  fileName: string;
  fileType: DocumentType;
  fileUrl: string;
  fileSize: number | null;
  ocrProcessed: boolean;
  createdAt: string;
  _count?: { claims: number };
};

export type AssetClaimSummary = {
  id: string;
  claimNumber: string;
  title: string;
  status: ClaimStatus;
  updatedAt: string;
};

export type Asset = {
  id: string;
  userId: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  purchasePrice: string;
  purchaseDate: string;
  hasWarranty: boolean;
  warrantyDuration: number | null;
  warrantyType: WarrantyType | null;
  expiryDate: string | null;
  warrantyStatus: WarrantyStatus;
  lifecycleStatus: LifecycleStatus;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerAddress: string | null;
  productImageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brandReference?: Brand | null;
  documents?: AssetDocumentSummary[];
  claims?: AssetClaimSummary[];
  _count?: { claims: number; documents: number };
};

export type AssetInput = {
  name: string;
  brand: string;
  brandId?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  categoryId: string;
  purchasePrice: number;
  purchaseDate: string;
  hasWarranty: boolean;
  warrantyDuration?: number | null;
  warrantyType?: WarrantyType | null;
  lifecycleStatus?: LifecycleStatus;
  sellerName?: string | null;
  sellerPhone?: string | null;
  sellerAddress?: string | null;
  notes?: string | null;
};

export type DocumentRecord = {
  id: string;
  productId: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number | null;
  fileUrl: string;
  ocrProcessed: boolean;
  createdAt: string;
  product?: { id: string; name: string };
};

export type ClaimTimelineEvent = {
  id: string;
  claimId: string;
  status: ClaimStatus | null;
  title: string;
  description: string | null;
  createdAt: string;
};

export type ClaimEvidence = {
  claimId: string;
  documentId: string;
  attachedAt: string;
  evidenceType: EvidenceType;
  claimStage: ClaimStatus | null;
  note: string | null;
  document: DocumentRecord;
};

export type Claim = {
  id: string;
  claimNumber: string;
  userId: string;
  productId: string;
  title: string;
  issueDescription: string;
  serviceCenter: string | null;
  providerReference: string | null;
  submittedCondition: string | null;
  resolution: string | null;
  status: ClaimStatus;
  filedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: Pick<Asset, "id" | "name" | "brand"> & Partial<Asset>;
  user?: { id: string; name: string; email: string };
  timeline?: ClaimTimelineEvent[];
  documents?: ClaimEvidence[];
  _count?: { timeline: number; documents: number };
};

export type ClaimInput = {
  productId: string;
  title: string;
  issueDescription: string;
  serviceCenter?: string;
  providerReference?: string;
  submittedCondition?: string;
  evidence?: Array<{ documentId: string; evidenceType: EvidenceType }>;
};

export type ClaimUpdate = {
  title?: string;
  issueDescription?: string;
  serviceCenter?: string | null;
  providerReference?: string | null;
  submittedCondition?: string | null;
  resolution?: string | null;
  status?: ClaimStatus;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "REMINDER" | "PAYMENT" | "SUBSCRIPTION" | "SYSTEM" | (string & {});
  isRead: boolean;
  entityId: string | null;
  createdAt: string;
};

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
};

export type PlanInfo = {
  id: Plan;
  name: string;
  price: number;
  assetLimit: number;
};

export type Subscription = {
  id: string;
  plan: Plan;
  scheduledPlan: Plan | null;
  pendingPlan: Plan | null;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  isActive: boolean;
};

export type Payment = {
  id: string;
  amount: string | number;
  currency: string;
  plan: Plan | null;
  status: PaymentStatus;
  createdAt: string;
  user?: { id: string; name: string; email: string };
};

export type ExtractedAssetData = {
  productName?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  sellerAddress?: string | null;
  invoiceNumber?: string | null;
  warrantyDuration?: number | null;
  warrantyType?: WarrantyType | null;
  confidence?: number | null;
};

/** A file chosen on the device and ready for multipart upload. */
export type NativeFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number | null;
};
