import { ApiError, apiList, apiRequest, queryString, registerAuthBridge } from "../api";

type MockResponse = { status: number; body: unknown };

function mockFetch(...responses: MockResponse[]) {
  const queue = [...responses];
  const fetchMock = jest.fn(async () => {
    const next = queue.shift();
    if (!next) throw new Error("No more mocked responses");
    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      json: async () => next.body,
    } as Response;
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const bridge = { getToken: jest.fn(async () => "token"), onSessionRejected: jest.fn() };

beforeEach(() => {
  bridge.getToken.mockClear();
  bridge.onSessionRejected.mockClear();
  registerAuthBridge(bridge);
});

describe("apiList", () => {
  const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };

  it("reads lists nested inside data, as products and claims return them", async () => {
    mockFetch({ status: 200, body: { success: true, data: { data: [{ id: "a" }], meta } } });
    await expect(apiList("/products")).resolves.toEqual({ data: [{ id: "a" }], meta });
  });

  it("reads lists with meta beside data, as admin and notifications return them", async () => {
    mockFetch({ status: 200, body: { success: true, data: [{ id: "u" }], meta } });
    await expect(apiList("/admin/users")).resolves.toEqual({ data: [{ id: "u" }], meta });
  });

  it("fills in pagination when an endpoint returns a bare array", async () => {
    mockFetch({ status: 200, body: { success: true, data: [{ id: "x" }] } });
    const result = await apiList("/categories");
    expect(result.meta).toEqual({ page: 1, limit: 1, total: 1, totalPages: 1 });
  });
});

describe("apiRequest", () => {
  it("sends the bearer token and JSON body", async () => {
    const fetchMock = mockFetch({ status: 200, body: { success: true, data: { ok: true } } });
    await apiRequest("/claims", { method: "POST", body: { title: "Broken" } });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token");
    expect(init.body).toBe(JSON.stringify({ title: "Broken" }));
  });

  it("retries once with a refreshed token after a 401", async () => {
    mockFetch(
      { status: 401, body: { success: false, code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 200, body: { success: true, data: 1 } },
    );
    await expect(apiRequest("/dashboard")).resolves.toBe(1);
    expect(bridge.getToken).toHaveBeenLastCalledWith(true);
  });

  it("explains the first validation issue instead of a generic message", async () => {
    mockFetch({
      status: 400,
      body: {
        success: false,
        code: "VALIDATION_FAILED",
        message: "Validation Failed",
        details: [{ path: ["body", "purchasePrice"], message: "Number must be greater than 0" }],
      },
    });
    await expect(apiRequest("/products")).rejects.toThrow(
      "Purchase price: Number must be greater than 0",
    );
  });

  it("ends the session when the account is suspended", async () => {
    mockFetch({
      status: 403,
      body: { success: false, code: "ACCOUNT_SUSPENDED", message: "Account suspended" },
    });
    await expect(apiRequest("/dashboard")).rejects.toBeInstanceOf(ApiError);
    expect(bridge.onSessionRejected).toHaveBeenCalledTimes(1);
  });

  it("reports network failures with a clear code", async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError("Network request failed");
    }) as unknown as typeof fetch;
    await expect(apiRequest("/dashboard")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});

describe("queryString", () => {
  it("drops empty values", () => {
    expect(queryString({ page: 1, search: "", status: undefined, limit: 20 })).toBe(
      "?page=1&limit=20",
    );
  });
});
