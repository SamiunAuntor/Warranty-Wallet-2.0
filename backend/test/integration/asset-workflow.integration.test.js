const assert = require("node:assert/strict");
const test = require("node:test");

const {
    configureIntegrationEnvironment,
    integrationEnabled,
} = require("./helpers/environment");

if (!integrationEnabled()) {
    test("asset workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();

    const app = require("../../src/app");
    const prisma = require("../../src/config/prisma");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    const harness = createDatabaseHarness(prisma);
    let server;
    let user;
    let category;
    let brand;
    let assetId;

    test.before(async () => {
        await prisma.$queryRaw`SELECT 1`;
        user = await harness.createUser();
        category = await harness.createCategory();
        brand = await harness.createBrand();
        server = await startTestServer(app);
    });

    test.after(async () => {
        await harness.cleanup();
        await server.close();
        await prisma.$disconnect();
    });

    const auth = () => ({ uid: user.firebaseUid });

    test("public catalog endpoints expose active values", async () => {
        const categories = await server.request("/categories");
        const brands = await server.request("/brands");

        assert.equal(categories.response.status, 200);
        assert.equal(brands.response.status, 200);
        assert.ok(categories.body.data.some((item) => item.id === category.id));
        assert.ok(brands.body.data.some((item) => item.id === brand.id));
    });

    test("creates an asset and derives warranty fields", async () => {
        const { response, body } = await server.request("/products", {
            method: "POST",
            ...auth(),
            body: JSON.stringify({
                name: "Integration Headphones",
                brand: "Ignored when brandId is selected",
                brandId: brand.id,
                model: "TEST-1000",
                serialNumber: harness.unique("workflow-serial"),
                categoryId: category.id,
                purchasePrice: "499.95",
                purchaseDate: "2026-01-15",
                hasWarranty: true,
                warrantyDuration: 12,
                warrantyType: "MANUFACTURER",
            }),
        });

        assert.equal(response.status, 201);
        assert.equal(body.success, true);
        assert.equal(body.data.userId, user.id);
        assert.equal(body.data.brand, brand.name);
        assert.equal(body.data.warrantyStatus, "ACTIVE");
        assert.match(body.data.expiryDate, /^2027-01-15/);
        assetId = body.data.id;
    });

    test("lists the new asset with pagination metadata", async () => {
        const { response, body } = await server.request("/products?page=1&limit=10&search=Integration", auth());

        assert.equal(response.status, 200);
        assert.equal(body.success, true);
        assert.ok(body.data.data.some((item) => item.id === assetId));
        assert.equal(body.data.meta.page, 1);
        assert.equal(body.data.meta.limit, 10);
        assert.ok(body.data.meta.total >= 1);
    });

    test("updates an owned asset", async () => {
        const { response, body } = await server.request(`/products/${assetId}`, {
            method: "PATCH",
            ...auth(),
            body: JSON.stringify({ notes: "Verified through HTTP integration test" }),
        });

        assert.equal(response.status, 200);
        assert.equal(body.data.notes, "Verified through HTTP integration test");
    });

    test("another user cannot read the asset", async () => {
        const other = await harness.createUser();
        const { response, body } = await server.request(`/products/${assetId}`, {
            uid: other.firebaseUid,
        });

        assert.equal(response.status, 403);
        assert.equal(body.code, "FORBIDDEN");
    });

    test("deletes the asset through its lifecycle policy", async () => {
        const result = await server.request(`/products/${assetId}`, {
            method: "DELETE",
            ...auth(),
        });

        assert.equal(result.response.status, 200);

        const stored = await prisma.product.findUnique({ where: { id: assetId } });
        assert.equal(stored.isDeleted, true);
    });
}
