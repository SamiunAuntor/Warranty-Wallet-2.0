const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("catalog administration integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("catalog administration integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let admin;
        let user;
        let categoryId;
        let brandId;

        before(async () => {
            api = await startTestServer(app);
            admin = await database.createUser({ role: "ADMIN" });
            user = await database.createUser();
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account) => ({ uid: account.firebaseUid, email: account.email });

        it("rejects category creation by an ordinary user", async () => {
            const { response, body } = await api.request("/categories", {
                ...identity(user), method: "POST", body: JSON.stringify({ name: database.unique("Denied") }),
            });
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("creates a category as an administrator", async () => {
            const name = database.unique("Computers");
            const { response, body } = await api.request("/categories", {
                ...identity(admin), method: "POST", body: JSON.stringify({ name, description: "Portable computers" }),
            });
            assert.equal(response.status, 201);
            assert.equal(body.data.name, name);
            assert.match(body.data.slug, /computers/);
            categoryId = body.data.id;
        });

        it("rejects a duplicate category name with a conflict code", async () => {
            const category = await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });
            const { response, body } = await api.request("/categories", {
                ...identity(admin), method: "POST", body: JSON.stringify({ name: category.name }),
            });
            assert.equal(response.status, 409);
            assert.equal(body.code, "CONFLICT");
        });

        it("updates a category and exposes it in the public catalog", async () => {
            const { response } = await api.request(`/categories/${categoryId}`, {
                ...identity(admin), method: "PATCH", body: JSON.stringify({ description: "Updated description" }),
            });
            assert.equal(response.status, 200);
            const catalog = await api.request("/categories");
            assert.ok(catalog.body.data.some((item) => item.id === categoryId && item.description === "Updated description"));
        });

        it("creates and updates a brand as an administrator", async () => {
            const name = database.unique("Acme");
            const created = await api.request("/brands", {
                ...identity(admin), method: "POST", body: JSON.stringify({ name, websiteUrl: "https://example.com" }),
            });
            assert.equal(created.response.status, 201);
            brandId = created.body.data.id;
            const updated = await api.request(`/brands/${brandId}`, {
                ...identity(admin), method: "PATCH", body: JSON.stringify({ description: "Updated brand" }),
            });
            assert.equal(updated.response.status, 200);
            assert.equal(updated.body.data.description, "Updated brand");
        });

        it("lists the new brand in the public catalog", async () => {
            const { response, body } = await api.request("/brands");
            assert.equal(response.status, 200);
            assert.ok(body.data.some((item) => item.id === brandId));
        });

        it("deactivates catalog entries through delete endpoints", async () => {
            const brandResult = await api.request(`/brands/${brandId}`, { ...identity(admin), method: "DELETE" });
            const categoryResult = await api.request(`/categories/${categoryId}`, { ...identity(admin), method: "DELETE" });
            assert.equal(brandResult.response.status, 200);
            assert.equal(categoryResult.response.status, 200);
            assert.equal((await prisma.brand.findUniqueOrThrow({ where: { id: brandId } })).isActive, false);
            assert.equal((await prisma.category.findUniqueOrThrow({ where: { id: categoryId } })).isActive, false);
        });
    });
}
