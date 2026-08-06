const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("admin claim workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("admin claim workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let admin;
        let owner;
        let claim;

        before(async () => {
            api = await startTestServer(app);
            admin = await database.createUser({ role: "ADMIN" });
            owner = await database.createUser({ name: "Claim Owner" });
            const category = await database.createCategory();
            const product = await database.createProduct(owner.id, category.id, { name: "Claimed Television" });
            claim = await database.createClaim(owner.id, product.id, { title: "Screen stopped displaying" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = admin) => ({ uid: account.firebaseUid, email: account.email });

        it("denies the global claim list to ordinary users", async () => {
            const { response, body } = await api.request("/admin/claims", identity(owner));
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("searches claims across owners", async () => {
            const { response, body } = await api.request("/admin/claims?search=Screen&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 1);
            assert.equal(body.data[0].id, claim.id);
            assert.equal(body.data[0].user.id, owner.id);
        });

        it("filters claims by lifecycle status", async () => {
            const { response, body } = await api.request("/admin/claims?status=SUBMITTED&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.ok(body.data.some((item) => item.id === claim.id));
            assert.ok(body.data.every((item) => item.status === "SUBMITTED"));
        });

        it("advances a claim and appends a timeline event", async () => {
            const { response, body } = await api.request(`/admin/claims/${claim.id}/status`, {
                ...identity(), method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }),
            });
            assert.equal(response.status, 200);
            assert.equal(body.data.status, "IN_PROGRESS");
            assert.ok(body.data.timeline.some((event) => event.status === "IN_PROGRESS"));
        });

        it("records the administrator's status-change activity", async () => {
            const activity = await prisma.activityLog.findFirst({ where: { userId: admin.id, entityId: claim.id } });
            assert.equal(activity.entity, "CLAIM");
            assert.match(activity.description, /IN_PROGRESS/);
        });

        it("returns not found when updating an unknown claim", async () => {
            const { response, body } = await api.request("/admin/claims/cm00000000000000000000000/status", {
                ...identity(), method: "PATCH", body: JSON.stringify({ status: "RESOLVED" }),
            });
            assert.equal(response.status, 404);
            assert.equal(body.code, "NOT_FOUND");
        });
    });
}
