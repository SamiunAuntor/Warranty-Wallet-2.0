export type ApiFailure = {
  success: false;
  code?: string;
  message?: string;
  details?: unknown;
};

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
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers);
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      body,
      headers: requestHeaders,
    });
  } catch (error) {
    throw new ApiError(
      "Could not reach Warranty Wallet. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
      error,
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiFailure | { data?: T } | null;
  if (!response.ok) {
    const failure = payload as ApiFailure | null;
    throw new ApiError(
      failure?.message ?? "The request could not be completed.",
      response.status,
      failure?.code ?? "INTERNAL_ERROR",
      failure?.details,
    );
  }
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiError(
      "Warranty Wallet returned an invalid response.",
      response.status,
      "INVALID_API_RESPONSE",
      payload,
    );
  }
  return payload.data as T;
}
