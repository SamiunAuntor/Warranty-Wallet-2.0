const assert = require("node:assert/strict");
const test = require("node:test");

const {
    configureIntegrationEnvironment,
    integrationEnabled,
} = require("./helpers/environment");

if (!integrationEnabled()) {
    test("user and preferences integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();

    const app = require("../../src/app");
    const prisma = require("../../src/config/prisma");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    const harness = createDatabaseHarness(prisma);
    const identity = {
        uid: harness.unique("firebase"),
        email: `${harness.unique("email")}@integration.test`,
        name: "Integration Student",
    };
    let server;

    test.before(async () => {
        await prisma.$queryRaw`SELECT 1`;
        server = await startTestServer(app);
    });

    test.after(async () => {
        const user = await prisma.user.findUnique({ where: { firebaseUid: identity.uid } });
        if (user) await prisma.user.delete({ where: { id: user.id } });
        await harness.cleanup();
        await server.close();
        await prisma.$disconnect();
    });

    test("synchronizes identity claims into an application user", async () => {
        const { response, body } = await server.request("/users/sync", {
            method: "POST",
            ...identity,
            body: JSON.stringify({ name: identity.name }),
        });

        assert.ok([200, 201].includes(response.status));
        assert.equal(body.success, true);
        assert.equal(body.data.firebaseUid, identity.uid);
        assert.equal(body.data.email, identity.email);
        assert.equal(body.data.name, identity.name);
        assert.equal(body.data.role, "USER");
        assert.equal(body.data.plan, "BASIC");
    });

    test("reads the synchronized profile through authentication middleware", async () => {
        const { response, body } = await server.request("/users/profile", identity);

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.equal(body.data.firebaseUid, identity.uid);
        assert.equal(body.data.email, identity.email);
    });

    test("updates profile fields and persists normalized data", async () => {
        const { response, body } = await server.request("/users/profile", {
            method: "PATCH",
            ...identity,
            body: JSON.stringify({
                name: "Updated Integration Student",
                phone: "+8801700000000",
            }),
        });

        assert.equal(response.status, 200);
        assert.equal(body.data.name, "Updated Integration Student");
        assert.equal(body.data.phone, "+8801700000000");

        const stored = await prisma.user.findUnique({ where: { firebaseUid: identity.uid } });
        assert.equal(stored.name, "Updated Integration Student");
        assert.equal(stored.phone, "+8801700000000");
    });

    test("creates default preferences on first read", async () => {
        const { response, body } = await server.request("/users/preferences", identity);

        assert.equal(response.status, 200);
        assert.equal(body.data.warrantyReminders, true);
        assert.deepEqual(body.data.reminderDays, [30, 14, 3]);
        assert.equal(body.data.timezone, "UTC");
        assert.equal(body.data.currency, "USD");
    });

    test("updates and normalizes regional preferences", async () => {
        const { response, body } = await server.request("/users/preferences", {
            method: "PATCH",
            ...identity,
            body: JSON.stringify({
                warrantyReminders: true,
                reminderDays: [3, 30, 14, 30],
                timezone: "Asia/Dhaka",
                currency: "BDT",
                dateFormat: "DD_MM_YYYY",
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(body.data.reminderDays, [30, 14, 3]);
        assert.equal(body.data.timezone, "Asia/Dhaka");
        assert.equal(body.data.currency, "BDT");
        assert.equal(body.data.dateFormat, "DD_MM_YYYY");
    });

    test("invalid preference input returns typed validation details", async () => {
        const { response, body } = await server.request("/users/preferences", {
            method: "PATCH",
            ...identity,
            body: JSON.stringify({ timezone: "Not/A_Real_Timezone" }),
        });

        assert.equal(response.status, 400);
        assert.equal(body.success, false);
        assert.equal(body.code, "VALIDATION_FAILED");
        assert.ok(Array.isArray(body.details));
    });
}
