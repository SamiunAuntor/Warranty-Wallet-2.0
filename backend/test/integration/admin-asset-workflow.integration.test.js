const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("admin asset workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("admin asset workflow integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let admin;
        let owner;
        let asset;

        before(async () => {
            api = await startTestServer(app);
            admin = await database.createUser({ role: "ADMIN" });
            owner = await database.createUser({ name: "Asset Owner" });
            const category = await database.createCategory();
            asset = await database.createProduct(owner.id, category.id, { name: "Managed Camera", brand: "Contoso" });
            await database.createDocument(owner.id, asset.id);
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = admin) => ({ uid: account.firebaseUid, email: account.email });

        it("rejects the admin asset list for ordinary users", async () => {
            const { response, body } = await api.request("/admin/products", identity(owner));
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("searches assets across all owners", async () => {
            const { response, body } = await api.request("/admin/products?search=Managed&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 1);
            assert.equal(body.data[0].id, asset.id);
            assert.equal(body.data[0].user.id, owner.id);
        });

        it("loads asset details with documents and owner", async () => {
            const { response, body } = await api.request(`/admin/products/${asset.id}`, identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.id, asset.id);
            assert.equal(body.data.documents.length, 1);
            assert.equal(body.data.user.email, owner.email);
        });

        it("returns a stable not-found error for an unknown asset", async () => {
            const { response, body } = await api.request("/admin/products/cm00000000000000000000000", identity());
            assert.equal(response.status, 404);
            assert.equal(body.code, "NOT_FOUND");
        });

        it("soft deletes an asset and writes an administrator activity", async () => {
            const { response } = await api.request(`/admin/products/${asset.id}`, { ...identity(), method: "DELETE" });
            assert.equal(response.status, 200);
            assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: asset.id } })).isDeleted, true);
            const activity = await prisma.activityLog.findFirst({ where: { userId: admin.id, entityId: asset.id } });
            assert.equal(activity.type, "PRODUCT_DELETED");
        });

        it("omits the deleted asset from subsequent admin lists", async () => {
            const { response, body } = await api.request("/admin/products?search=Managed&page=1&limit=10", identity());
            assert.equal(response.status, 200);
            assert.equal(body.data.length, 0);
        });
    });
}
