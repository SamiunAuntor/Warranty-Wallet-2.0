export const API_ERROR_CODES = [
  "VALIDATION_FAILED",
  "UNAUTHORIZED",
  "AUTH_SESSION_INVALID",
  "USER_NOT_FOUND",
  "ACCOUNT_SUSPENDED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "PAYMENT_REQUIRED",
  "RATE_LIMITED",
  "UPLOAD_INVALID",
  "UPLOAD_TOO_LARGE",
  "DATABASE_CONFLICT",
  "DATABASE_UNAVAILABLE",
  "DATABASE_ERROR",
  "PAYMENT_FAILED",
  "PAYMENT_PROVIDER_ERROR",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number] | (string & {});

export type ApiSuccess<TData, TMeta = never> = {
  success: true;
  statusCode: number;
  message: string;
  data: TData;
} & ([TMeta] extends [never] ? { meta?: never } : { meta: TMeta });

export type ApiFailure<TDetails = unknown> = {
  success: false;
  code: ApiErrorCode;
  message: string;
  details?: TDetails;
};

export type ApiEnvelope<TData, TMeta = never, TDetails = unknown> =
  | ApiSuccess<TData, TMeta>
  | ApiFailure<TDetails>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

export type ValidationIssue = {
  code?: string;
  path?: Array<string | number>;
  message: string;
  expected?: string;
  received?: string;
};

export type ValidationDetails = ValidationIssue[];

export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  token?: string;
  headers?: HeadersInit;
  fallbackMessage?: string;
};

export class ApiClientError<TDetails = unknown> extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: TDetails;

  constructor(input: {
    status: number;
    code: ApiErrorCode;
    message: string;
    details?: TDetails;
    cause?: unknown;
  }) {
    super(input.message, { cause: input.cause });
    this.name = "ApiClientError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
  }

  get isAuthenticationError() {
    return this.status === 401 || this.code === "AUTH_SESSION_INVALID";
  }

  get isAuthorizationError() {
    return this.status === 403;
  }

  get isValidationError() {
    return this.status === 400 || this.code === "VALIDATION_FAILED";
  }

  get isRetryable() {
    return this.status === 429 || this.status >= 500;
  }
}

export function isApiFailure(value: unknown): value is ApiFailure {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.success === false
    && typeof candidate.code === "string"
    && typeof candidate.message === "string";
}

export function isApiSuccess<TData>(value: unknown): value is ApiSuccess<TData> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.success === true
    && typeof candidate.message === "string"
    && "data" in candidate;
}

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
export type UserPlan = "BASIC" | "PLUS" | "PRO";
export type AvatarSource = "NONE" | "GOOGLE" | "CUSTOM";
export type WarrantyStatus = "NO_WARRANTY" | "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type WarrantyType = "MANUFACTURER" | "EXTENDED";
export type AssetLifecycleStatus = "ADDED" | "ARCHIVED";
export type ClaimStatus = "SUBMITTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type SubscriptionStatus = "ACTIVE" | "INCOMPLETE" | "PAST_DUE" | "EXPIRED" | "CANCELLED";
export type NotificationType = "REMINDER" | "PAYMENT" | "SUBSCRIPTION" | "SYSTEM";
export type DocumentType =
  | "INVOICE"
  | "WARRANTY_CARD"
  | "PRODUCT_IMAGE"
  | "RECEIPT"
  | "OTHER"
  | "CLAIM_EVIDENCE"
  | "CLAIM_CONDITION";

export type ResourceId = string;
export type IsoDate = string;
export type IsoDateTime = string;

export type ApiUser = {
  id: ResourceId;
  firebaseUid: string;
  name: string;
  email: string;
  phone?: string | null;
  photoURL: string | null;
  avatarSource?: AvatarSource;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan;
  lastLoginAt?: IsoDateTime | null;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type ApiUserPreference = {
  id: ResourceId;
  userId: ResourceId;
  warrantyReminders: boolean;
  reminderDays: number[];
  timezone: string;
  currency: "USD" | "BDT" | "EUR" | "GBP" | "CAD" | "AUD";
  dateFormat: "MMM_D_YYYY" | "DD_MM_YYYY" | "MM_DD_YYYY";
};

export type ApiCategory = {
  id: ResourceId;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
  _count?: { products: number };
};

export type ApiBrand = {
  id: ResourceId;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
  _count?: { products: number };
};

export type ApiPayment = {
  id: ResourceId;
  userId: ResourceId;
  stripeSessionId: string;
  stripePaymentIntent?: string | null;
  stripeInvoiceId?: string | null;
  amount: string | number;
  currency: string;
  paymentMethod: string;
  plan: UserPlan | null;
  status: PaymentStatus;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type ApiSubscription = {
  id: ResourceId;
  userId: ResourceId;
  plan: UserPlan;
  scheduledPlan: UserPlan | null;
  pendingPlan: UserPlan | null;
  status: SubscriptionStatus;
  startsAt: IsoDateTime;
  expiresAt: IsoDateTime;
  currentPeriodStart: IsoDateTime | null;
  currentPeriodEnd: IsoDateTime | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: IsoDateTime | null;
  isActive: boolean;
};
