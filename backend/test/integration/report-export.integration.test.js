const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { integrationEnabled, configureIntegrationEnvironment } = require("./helpers/environment");

if (!integrationEnabled()) {
    describe("report export integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();
    const prisma = require("../../src/config/prisma");
    const app = require("../../src/app");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    describe("report export integration suite", () => {
        const database = createDatabaseHarness(prisma);
        let api;
        let user;
        let admin;

        before(async () => {
            api = await startTestServer(app);
            user = await database.createUser();
            admin = await database.createUser({ role: "ADMIN" });
            const category = await database.createCategory();
            await database.createProduct(user.id, category.id, { name: "Reportable Laptop" });
            await database.createPayment(user.id, { amount: 20, plan: "PRO" });
        });

        after(async () => {
            await api.close();
            await database.cleanup();
            await prisma.$disconnect();
        });

        const identity = (account = user) => ({ uid: account.firebaseUid, email: account.email });

        const expectPdf = async (path, account = user) => {
            const { response, body } = await api.request(`${path}?format=PDF`, identity(account));
            assert.equal(response.status, 200);
            assert.equal(response.headers.get("content-type"), "application/pdf");
            assert.ok(response.headers.get("content-disposition").includes(".pdf"));
            assert.equal(Buffer.from(body).subarray(0, 4).toString(), "%PDF");
        };

        const expectExcel = async (path, account = user) => {
            const { response, body } = await api.request(`${path}?format=EXCEL`, identity(account));
            assert.equal(response.status, 200);
            assert.match(response.headers.get("content-type"), /spreadsheetml/);
            assert.ok(response.headers.get("content-disposition").includes(".xlsx"));
            assert.equal(Buffer.from(body).subarray(0, 2).toString(), "PK");
        };

        it("exports a user's product report as PDF", () => expectPdf("/reports/products"));

        it("exports a user's warranty report as Excel", () => expectExcel("/reports/warranty"));

        it("exports a user's payment report as PDF", () => expectPdf("/reports/payments"));

        it("rejects report requests without a format", async () => {
            const { response, body } = await api.request("/reports/products", identity());
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
        });

        it("rejects unsupported report formats", async () => {
            const { response, body } = await api.request("/reports/products?format=CSV", identity());
            assert.equal(response.status, 400);
            assert.equal(body.code, "VALIDATION_FAILED");
        });

        it("denies administrative reports to ordinary users", async () => {
            const { response, body } = await api.request("/reports/admin/users?format=PDF", identity());
            assert.equal(response.status, 403);
            assert.equal(body.code, "FORBIDDEN");
        });

        it("exports the administrative user report", () => expectExcel("/reports/admin/users", admin));

        it("exports the administrative revenue report", () => expectPdf("/reports/admin/revenue", admin));

        it("exports the administrative category report", () => expectExcel("/reports/admin/categories", admin));
    });
}
