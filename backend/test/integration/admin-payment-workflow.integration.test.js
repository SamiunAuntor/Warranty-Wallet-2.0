const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("admin payment workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("admin payment workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let admin;
        let customer;
        let successfulPayment;

        before(async () => {
            api = await startTestServer(app);
            admin = await database.createUser({ role: "ADMIN" });
            customer = await database.createUser({ name: "Billing Customer" });
            successfulPayment = await database.createPayment(customer.id, { amount: 20, plan: "PRO" });
            await database.createPayment(customer.id, { amount: 5, plan: "PLUS", status: "FAILED" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = admin) => ({ uid: account.firebaseUid, email: account.email });

        it("denies payment administration to ordinary users", async () => {
            const { response, body } = await api.request("/admin/payments", identity(customer));
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("searches payment history by customer email", async () => {
            const { response, body } = await api.request(`/admin/payments?search=${encodeURIComponent(customer.email)}&page=1&limit=10`, identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 2);
            assert.ok(body.data.every((payment) => payment.user.id === customer.id));
        });

        it("filters administrative payments by status", async () => {
            const { response, body } = await api.request("/admin/payments?status=SUCCESS&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.ok(body.data.some((payment) => payment.id === successfulPayment.id));
            assert.ok(body.data.every((payment) => payment.status === "SUCCESS"));
        });

        it("loads a payment with its customer details", async () => {
            const { response, body } = await api.request(`/admin/payments/${successfulPayment.id}`, identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.id, successfulPayment.id);
            assert.equal(body.data.user.email, customer.email);
        });

        it("rejects malformed status filters", async () => {
            const { response, body } = await api.request("/admin/payments?status=UNKNOWN", identity());
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
        });

        it("returns not found for an unknown payment", async () => {
            const { response, body } = await api.request("/admin/payments/cm00000000000000000000000", identity());
            assert.equal(response.status, 404);
            assert.equal(body.code, "NOT_FOUND");
        });
    });
}
