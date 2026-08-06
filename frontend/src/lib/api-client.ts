import {
  ApiClientError,
  type ApiErrorCode,
  type ApiFailure,
  type ApiRequestOptions,
  type ApiSuccess,
} from "@/lib/api-contracts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const fallbackCode = (status: number): ApiErrorCode => {
  if (status === 400) return "VALIDATION_FAILED";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 413) return "UPLOAD_TOO_LARGE";
  if (status === 429) return "RATE_LIMITED";
  if (status === 503) return "DATABASE_UNAVAILABLE";
  return "INTERNAL_ERROR";
};

const shouldSetJsonContentType = (body: BodyInit | null | undefined) => (
  body !== undefined
  && body !== null
  && !(body instanceof FormData)
  && !(body instanceof URLSearchParams)
  && !(body instanceof Blob)
);

const parseJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
};

export async function apiRequest<TData>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TData> {
  const { token, fallbackMessage = "The request could not be completed.", headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (shouldSetJsonContentType(init.body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      headers: requestHeaders,
    });
  } catch (cause) {
    throw new ApiClientError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Could not reach Warranty Wallet. Check your connection and try again.",
      cause,
    });
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    const failure = (payload && typeof payload === "object" ? payload : {}) as Partial<ApiFailure>;
    throw new ApiClientError({
      status: response.status,
      code: failure.code ?? fallbackCode(response.status),
      message: failure.message ?? fallbackMessage,
      details: failure.details,
    });
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiClientError({
      status: response.status,
      code: "INVALID_API_RESPONSE",
      message: "Warranty Wallet returned an invalid response.",
      details: payload,
    });
  }

  return (payload as ApiSuccess<TData>).data;
}

export async function apiRequestEnvelope<TData, TMeta>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<{ data: TData; meta: TMeta }> {
  const { token, fallbackMessage = "The request could not be completed.", headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (shouldSetJsonContentType(init.body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, cache: init.cache ?? "no-store", headers: requestHeaders });
  const payload = await parseJson(response);

  if (!response.ok) {
    const failure = (payload && typeof payload === "object" ? payload : {}) as Partial<ApiFailure>;
    throw new ApiClientError({
      status: response.status,
      code: failure.code ?? fallbackCode(response.status),
      message: failure.message ?? fallbackMessage,
      details: failure.details,
    });
  }

  if (!payload || typeof payload !== "object" || !("data" in payload) || !("meta" in payload)) {
    throw new ApiClientError({ status: response.status, code: "INVALID_API_RESPONSE", message: "Warranty Wallet returned an invalid paginated response." });
  }

  const success = payload as ApiSuccess<TData, TMeta>;
  return { data: success.data, meta: success.meta as TMeta };
}
