const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("activity workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("activity workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let user;
        let otherUser;
        let ownedActivity;

        before(async () => {
            api = await startTestServer(app);
            user = await database.createUser();
            otherUser = await database.createUser();
            ownedActivity = await database.createActivity(user.id, { title: "Profile changed" });
            await database.createActivity(user.id, { title: "Asset created", type: "PRODUCT_CREATED", entity: "PRODUCT" });
            await database.createActivity(otherUser.id, { title: "Other user's activity" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = () => ({ uid: user.firebaseUid, email: user.email });

        it("lists a paginated activity feed for the current user", async () => {
            const { response, body } = await api.request("/activities?page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 2);
            assert.equal(body.meta.total, 2);
            assert.ok(body.data.every((activity) => activity.userId === user.id));
        });

        it("returns the recent activity subset", async () => {
            const { response, body } = await api.request("/activities/recent", identity());
            assert.equal(response.status, 200);
            assert.ok(Array.isArray(body.data));
            assert.equal(body.data.length, 2);
        });

        it("returns an owned activity by identifier", async () => {
            const { response, body } = await api.request(`/activities/${ownedActivity.id}`, identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.id, ownedActivity.id);
            assert.equal(body.data.title, "Profile changed");
        });

        it("hides activity records owned by another user", async () => {
            const foreign = await prisma.activityLog.findFirstOrThrow({ where: { userId: otherUser.id } });
            const { response, body } = await api.request(`/activities/${foreign.id}`, identity());
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("returns a validation error for a malformed activity identifier", async () => {
            const { response, body } = await api.request("/activities/not-a-cuid", identity());
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
            assert.ok(Array.isArray(body.details));
        });
    });
}
