const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("billing read model integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("billing read model integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let user;
        let otherUser;
        let subscription;

        before(async () => {
            api = await startTestServer(app);
            user = await database.createUser({ plan: "PLUS" });
            otherUser = await database.createUser();
            const latest = await database.createPayment(user.id, { amount: 9.99, plan: "PLUS" });
            await database.createPayment(user.id, { amount: 19.99, plan: "PRO", status: "FAILED" });
            await database.createPayment(otherUser.id, { amount: 49.99, plan: "PRO" });
            subscription = await database.createSubscription(user.id, { latestPaymentId: latest.id });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = user) => ({ uid: account.firebaseUid, email: account.email });

        it("publishes plan definitions without authentication", async () => {
            const { response, body } = await api.request("/payments/plans");
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
            assert.ok(body.data.some((plan) => plan.id === "BASIC"));
            assert.ok(body.data.some((plan) => plan.id === "PRO"));
        });

        it("lists only the current user's payment history", async () => {
            const { response, body } = await api.request("/payments?page=1&limit=20", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 2);
            assert.equal(body.meta.total, 2);
            assert.ok(body.data.every((payment) => payment.userId === user.id));
        });

        it("filters payment history by status", async () => {
            const { response, body } = await api.request("/payments?status=SUCCESS&page=1&limit=20", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 1);
            assert.equal(body.data[0].status, "SUCCESS");
        });

        it("returns the active subscription read model", async () => {
            const { response, body } = await api.request("/payments/subscription", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.id, subscription.id);
            assert.equal(body.data.plan, "PLUS");
            assert.equal(body.data.isActive, true);
        });

        it("returns null when a user has no subscription", async () => {
            const { response, body } = await api.request("/payments/subscription", identity(otherUser));
            assert.equal(response.status, 200);
            assert.equal(body.data, null);
        });

        it("validates checkout plan input before contacting Stripe", async () => {
            const { response, body } = await api.request("/payments/create-checkout", {
                ...identity(), method: "POST", body: JSON.stringify({ plan: "BASIC" }),
            });
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
        });

        it("requires a checkout session identifier", async () => {
            const { response, body } = await api.request("/payments/confirm-checkout", {
                ...identity(), method: "POST", body: JSON.stringify({}),
            });
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
        });
    });
}
