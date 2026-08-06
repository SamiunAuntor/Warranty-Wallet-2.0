const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("HTTP security integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const app = require("../../src/app");
    const { startTestServer } = require("./helpers/server");

    describe("HTTP security integration suite", () => {
        let api;

        before(async () => {
            api = await startTestServer(app);
        });

        after(async () => {
            await api.close();
        });

        it("sets defensive headers on successful responses", async () => {
            const { response } = await api.request("/health");
            assert.equal(response.status, 200);
            assert.equal(response.headers.get("x-content-type-options"), "nosniff");
            assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
            assert.ok(response.headers.get("content-security-policy"));
        });

        it("sets defensive headers on error responses", async () => {
            const { response } = await api.request("/does-not-exist");
            assert.equal(response.status, 404);
            assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        });

        it("allows the configured browser origin", async () => {
            const { response } = await api.request("/health", { headers: { Origin: "http://localhost:3000" } });
            assert.equal(response.status, 200);
            assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3000");
            assert.equal(response.headers.get("access-control-allow-credentials"), "true");
        });

        it("allows non-browser requests without an Origin header", async () => {
            const { response } = await api.request("/health");
            assert.equal(response.status, 200);
            assert.equal(response.headers.get("access-control-allow-origin"), null);
        });

        it("rejects an unconfigured browser origin", async () => {
            const { response, body } = await api.request("/health", { headers: { Origin: "https://attacker.example" } });
            assert.equal(response.status, 500);
            assert.equal(body.code, "INTERNAL_ERROR");
        });

        it("handles a CORS preflight for the configured frontend", async () => {
            const { response } = await api.request("/users/me", {
                method: "OPTIONS",
                headers: {
                    Origin: "http://localhost:3000",
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "authorization",
                },
            });
            assert.equal(response.status, 204);
            assert.match(response.headers.get("access-control-allow-methods"), /GET/);
            assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3000");
        });

        it("publishes standard rate-limit headers", async () => {
            const { response } = await api.request("/health");
            assert.ok(response.headers.get("ratelimit-limit"));
            assert.ok(response.headers.get("ratelimit-remaining"));
            assert.ok(response.headers.get("ratelimit-reset"));
        });
    });
}
