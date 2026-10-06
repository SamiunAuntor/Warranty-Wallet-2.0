import { API_URL } from "./config";
import type { NativeFile, Paginated, PaginationMeta } from "./types";

type ValidationIssue = { path?: Array<string | number>; message?: string };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isAuthError() {
    return this.status === 401;
  }
}

type AuthBridge = {
  getToken: (forceRefresh?: boolean) => Promise<string | null>;
  onSessionRejected: (error: ApiError) => void;
};

let authBridge: AuthBridge | null = null;

/** Connects the API client to the auth provider without a circular import. */
export function registerAuthBridge(bridge: AuthBridge | null) {
  authBridge = bridge;
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Set to false for public endpoints such as the category list. */
  auth?: boolean;
  /** Overrides the bearer token, used while a sign-in is still finishing. */
  token?: string;
};

const SESSION_REJECTED_CODES = new Set(["ACCOUNT_SUSPENDED", "USER_NOT_FOUND"]);

function describeValidation(details: unknown) {
  if (!Array.isArray(details) || details.length === 0) return null;
  const issue = details[0] as ValidationIssue;
  if (!issue?.message) return null;
  const field = issue.path?.filter((part) => part !== "body" && part !== "query").join(".");
  return field ? `${humanize(field)}: ${issue.message}` : issue.message;
}

function humanize(field: string) {
  const words = field.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll(".", " ");
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) body = options.body;
  else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  try {
    return await fetch(`${API_URL}${path}`, { method: options.method ?? "GET", headers, body });
  } catch (cause) {
    throw new ApiError(
      "Could not reach Warranty Wallet. Check your connection and that the server is running.",
      0,
      "NETWORK_ERROR",
      cause,
    );
  }
}

async function resolveToken(options: RequestOptions, forceRefresh = false) {
  if (options.token && !forceRefresh) return options.token;
  if (options.auth === false) return null;
  const token = await authBridge?.getToken(forceRefresh);
  if (!token && !options.token) {
    throw new ApiError("Your session has ended. Please sign in again.", 401, "UNAUTHORIZED");
  }
  return token ?? options.token ?? null;
}

/** Sends a request and returns the full success envelope. */
async function requestEnvelope(path: string, options: RequestOptions = {}) {
  let response = await send(path, options, await resolveToken(options));

  // Firebase ID tokens expire hourly. Retry once with a refreshed token.
  if (response.status === 401 && options.auth !== false) {
    response = await send(path, options, await resolveToken(options, true));
  }

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const code = typeof payload?.code === "string" ? payload.code : "REQUEST_FAILED";
    const message =
      describeValidation(payload?.details) ??
      (typeof payload?.message === "string" ? payload.message : null) ??
      "The request could not be completed.";
    const error = new ApiError(message, response.status, code, payload?.details);
    if (SESSION_REJECTED_CODES.has(code) || (response.status === 401 && options.auth !== false)) {
      authBridge?.onSessionRejected(error);
    }
    throw error;
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiError(
      "Warranty Wallet returned an unexpected response.",
      response.status,
      "INVALID_API_RESPONSE",
    );
  }
  return payload as { data: unknown; meta?: PaginationMeta };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return (await requestEnvelope(path, options)).data as T;
}

/**
 * Lists come back in two shapes: some endpoints nest `{ data, meta }` inside
 * `data`, others return the array in `data` with `meta` beside it. This
 * accepts both so screens can always rely on `{ data, meta }`.
 */
export async function apiList<T>(path: string, options: RequestOptions = {}): Promise<Paginated<T>> {
  const envelope = await requestEnvelope(path, options);
  const nested = envelope.data as Partial<Paginated<T>> | T[] | null;

  if (Array.isArray(nested)) {
    return {
      data: nested,
      meta: envelope.meta ?? { page: 1, limit: nested.length, total: nested.length, totalPages: 1 },
    };
  }
  if (nested && Array.isArray(nested.data)) {
    const data = nested.data;
    return {
      data,
      meta: nested.meta ?? { page: 1, limit: data.length, total: data.length, totalPages: 1 },
    };
  }
  throw new ApiError("Warranty Wallet returned an unexpected list.", 200, "INVALID_API_RESPONSE");
}

export function queryString(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Builds a multipart form part from a device file. */
export function filePart(file: NativeFile) {
  return { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob;
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
