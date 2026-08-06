const assert = require("node:assert/strict");
const test = require("node:test");

const {
    configureIntegrationEnvironment,
    integrationEnabled,
} = require("./helpers/environment");

if (!integrationEnabled()) {
    test("health and authentication integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();

    const app = require("../../src/app");
    const prisma = require("../../src/config/prisma");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    const harness = createDatabaseHarness(prisma);
    let server;

    test.before(async () => {
        await prisma.$queryRaw`SELECT 1`;
        server = await startTestServer(app);
    });

    test.after(async () => {
        await harness.cleanup();
        await server.close();
        await prisma.$disconnect();
    });

    test("health endpoint returns runtime information", async () => {
        const { response, body } = await server.request("/health");

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.equal(body.environment, "test");
        assert.match(body.message, /healthy/i);
        assert.doesNotThrow(() => new Date(body.timestamp).toISOString());
    });

    test("protected endpoints return a stable code without identity", async () => {
        const { response, body } = await server.request("/users/profile");

        assert.equal(response.status, 401);
        assert.deepEqual(body, {
            success: false,
            code: "UNAUTHORIZED",
            message: "Unauthorized",
        });
    });

    test("unknown synchronized identities are rejected", async () => {
        const { response, body } = await server.request("/users/profile", {
            uid: harness.unique("unknown-identity"),
        });

        assert.equal(response.status, 401);
        assert.equal(body.success, false);
        assert.equal(body.code, "USER_NOT_FOUND");
    });

    test("blocked users cannot access protected resources", async () => {
        const user = await harness.createUser({ status: "BLOCKED" });
        const { response, body } = await server.request("/users/profile", {
            uid: user.firebaseUid,
        });

        assert.equal(response.status, 403);
        assert.equal(body.success, false);
        assert.equal(body.code, "ACCOUNT_SUSPENDED");
    });

    test("unknown routes use the centralized not-found code", async () => {
        const { response, body } = await server.request("/route-that-does-not-exist");

        assert.equal(response.status, 404);
        assert.equal(body.success, false);
        assert.equal(body.code, "NOT_FOUND");
    });
}
