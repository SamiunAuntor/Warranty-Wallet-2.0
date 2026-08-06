const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("admin user workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("admin user workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let admin;
        let target;

        before(async () => {
            api = await startTestServer(app);
            admin = await database.createUser({ role: "ADMIN", name: "Integration Admin" });
            target = await database.createUser({ name: "Managed User" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = admin) => ({ uid: account.firebaseUid, email: account.email });

        it("prevents ordinary users from listing accounts", async () => {
            const { response, body } = await api.request("/admin/users", identity(target));
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("lists users with pagination and search", async () => {
            const { response, body } = await api.request("/admin/users?search=Managed&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.ok(body.data.some((account) => account.id === target.id));
            assert.ok(body.meta.total >= 1);
        });

        it("loads a single user with administrative details", async () => {
            const { response, body } = await api.request(`/admin/users/${target.id}`, identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.id, target.id);
            assert.equal(body.data.email, target.email);
        });

        it("blocks an active user", async () => {
            const { response, body } = await api.request(`/admin/users/${target.id}/block`, { ...identity(), method: "PATCH" });
            assert.equal(response.status, 200);
            assert.equal(body.data.status, "BLOCKED");
        });

        it("a blocked user's next authenticated request is rejected", async () => {
            const { response, body } = await api.request("/users/me", identity(target));
            assert.equal(response.status, 403);
            assert.equal(body.code, "ACCOUNT_SUSPENDED");
        });

        it("unblocks a managed user", async () => {
            const { response, body } = await api.request(`/admin/users/${target.id}/unblock`, { ...identity(), method: "PATCH" });
            assert.equal(response.status, 200);
            assert.equal(body.data.status, "ACTIVE");
        });

        it("prevents an administrator from blocking their own account", async () => {
            const { response, body } = await api.request(`/admin/users/${admin.id}/block`, { ...identity(), method: "PATCH" });
            assert.equal(response.status, 400);
            assert.ok(body.code);
        });

        it("returns not found for an unknown user identifier", async () => {
            const { response, body } = await api.request("/admin/users/cm00000000000000000000000", identity());
            assert.equal(response.status, 404);
            assert.equal(body.code, "NOT_FOUND");
        });
    });
}
