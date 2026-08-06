const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("notification workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("notification workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let user;
        let otherUser;
        let first;
        let second;

        before(async () => {
            api = await startTestServer(app);
            user = await database.createUser();
            otherUser = await database.createUser();
            first = await database.createNotification(user.id, { title: "Warranty reminder" });
            second = await database.createNotification(user.id, { title: "Payment received", type: "PAYMENT" });
            await database.createNotification(otherUser.id, { title: "Private notification" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = () => ({ uid: user.firebaseUid, email: user.email });

        it("lists only notifications owned by the authenticated user", async () => {
            const { response, body } = await api.request("/notifications?page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.equal(body.success, true);
            assert.equal(body.data.length, 2);
            assert.deepEqual(new Set(body.data.map((item) => item.id)), new Set([first.id, second.id]));
            assert.equal(body.meta.total, 2);
        });

        it("returns an unread count scoped to the current user", async () => {
            const { response, body } = await api.request("/notifications/unread-count", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.unread, 2);
        });

        it("marks one owned notification as read", async () => {
            const { response, body } = await api.request(`/notifications/${first.id}/read`, { ...identity(), method: "PATCH" });
            assert.equal(response.status, 200);
            assert.equal(body.data.id, first.id);
            assert.equal(body.data.isRead, true);
        });

        it("does not expose another user's notification", async () => {
            const foreign = await prisma.notification.findFirstOrThrow({ where: { userId: otherUser.id } });
            const { response, body } = await api.request(`/notifications/${foreign.id}/read`, { ...identity(), method: "PATCH" });
            assert.equal(response.status, 404);
            assert.equal(body.code, "NOT_FOUND");
        });

        it("marks every remaining notification as read", async () => {
            const { response } = await api.request("/notifications/read-all", { ...identity(), method: "PATCH" });
            assert.equal(response.status, 200);
            assert.equal(await prisma.notification.count({ where: { userId: user.id, isRead: false } }), 0);
        });

        it("deletes a notification without affecting other users", async () => {
            const { response } = await api.request(`/notifications/${second.id}`, { ...identity(), method: "DELETE" });
            assert.equal(response.status, 200);
            assert.equal(await prisma.notification.count({ where: { id: second.id } }), 0);
            assert.equal(await prisma.notification.count({ where: { userId: otherUser.id } }), 1);
        });
    });
}
