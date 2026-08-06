const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("dashboard workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("dashboard workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let user;
        let admin;

        before(async () => {
            api = await startTestServer(app);
            user = await database.createUser({ plan: "PLUS" });
            admin = await database.createUser({ role: "ADMIN" });
            const category = await database.createCategory({ name: database.unique("Laptops") });
            const active = await database.createProduct(user.id, category.id, { name: "Active laptop", purchasePrice: 1200 });
            await database.createProduct(user.id, category.id, {
                name: "Expired monitor",
                warrantyStatus: "EXPIRED",
                expiryDate: new Date("2025-01-01T00:00:00.000Z"),
                purchasePrice: 300,
            });
            await database.createDocument(user.id, active.id);
            await database.createNotification(user.id);
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = user) => ({ uid: account.firebaseUid, email: account.email });

        it("summarizes the authenticated user's assets and plan", async () => {
            const { response, body } = await api.request("/dashboard", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.products.total, 2);
            assert.equal(body.data.products.expired, 1);
            assert.equal(body.data.documents.total, 1);
            assert.equal(body.data.notifications.unread, 1);
            assert.equal(body.data.plan, "PLUS");
        });

        it("returns warranty timeline analytics", async () => {
            const { response, body } = await api.request("/dashboard/warranty", identity());
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
            assert.ok(body.data.some((item) => item.warrantyStatus === "EXPIRED"));
        });

        it("returns category distribution analytics", async () => {
            const { response, body } = await api.request("/dashboard/categories", identity());
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
            assert.equal(body.data.reduce((sum, item) => sum + Number(item._count.id), 0), 2);
        });

        it("prevents ordinary users from opening admin analytics", async () => {
            const { response, body } = await api.request("/dashboard/admin", identity());
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("allows administrators to view system totals", async () => {
            const { response, body } = await api.request("/dashboard/admin", identity(admin));
            assert.equal(response.status, 200);
            assert.ok(body.data.overview.totalUsers >= 2);
            assert.ok(body.data.overview.totalProducts >= 2);
        });

        it("returns revenue records for a selected year", async () => {
            const { response, body } = await api.request("/dashboard/admin/revenue?year=2026", identity(admin));
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
        });

        it("returns product-growth records for a selected year", async () => {
            const { response, body } = await api.request("/dashboard/admin/product-growth?year=2026", identity(admin));
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
        });
    });
}
