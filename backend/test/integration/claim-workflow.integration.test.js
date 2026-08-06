const assert = require("node:assert/strict");
const test = require("node:test");

const {
    configureIntegrationEnvironment,
    integrationEnabled,
} = require("./helpers/environment");

if (!integrationEnabled()) {
    test("claim workflow integration suite", { skip: "Set TEST_DATABASE_URL to run PostgreSQL integration tests." }, () => {});
} else {
    configureIntegrationEnvironment();

    const app = require("../../src/app");
    const prisma = require("../../src/config/prisma");
    const { createDatabaseHarness } = require("./helpers/database");
    const { startTestServer } = require("./helpers/server");

    const harness = createDatabaseHarness(prisma);
    let server;
    let user;
    let other;
    let product;
    let document;
    let claimId;

    test.before(async () => {
        await prisma.$queryRaw`SELECT 1`;
        user = await harness.createUser();
        other = await harness.createUser();
        const category = await harness.createCategory();
        product = await harness.createProduct(user.id, category.id);
        document = await harness.createDocument(user.id, product.id);
        server = await startTestServer(app);
    });

    test.after(async () => {
        await harness.cleanup();
        await server.close();
        await prisma.$disconnect();
    });

    const auth = () => ({ uid: user.firebaseUid });

    test("creates a claim with existing asset evidence", async () => {
        const { response, body } = await server.request("/claims", {
            method: "POST",
            ...auth(),
            body: JSON.stringify({
                productId: product.id,
                title: "Integration warranty claim",
                issueDescription: "The integration asset no longer powers on during testing.",
                submittedCondition: "No visible damage",
                evidence: [{
                    documentId: document.id,
                    evidenceType: "SUPPORTING_DOCUMENT",
                    note: "Purchase receipt",
                }],
            }),
        });

        assert.equal(response.status, 201);
        assert.equal(body.data.userId, user.id);
        assert.equal(body.data.productId, product.id);
        assert.equal(body.data.status, "SUBMITTED");
        assert.match(body.data.claimNumber, /^CLM-/);
        claimId = body.data.id;
    });

    test("reads claim details with timeline and evidence", async () => {
        const { response, body } = await server.request(`/claims/${claimId}`, auth());

        assert.equal(response.status, 200);
        assert.ok(body.data.timeline.length >= 1);
        assert.equal(body.data.documents.length, 1);
        assert.equal(body.data.documents[0].documentId, document.id);
    });

    test("adds a narrative timeline event", async () => {
        const { response } = await server.request(`/claims/${claimId}/timeline`, {
            method: "POST",
            ...auth(),
            body: JSON.stringify({
                title: "Service center contacted",
                description: "The device is scheduled for inspection.",
            }),
        });

        assert.equal(response.status, 201);

        const events = await prisma.claimTimelineEvent.findMany({ where: { claimId } });
        assert.ok(events.some((event) => event.title === "Service center contacted"));
    });

    test("updates claim status and records the transition", async () => {
        const { response, body } = await server.request(`/claims/${claimId}`, {
            method: "PATCH",
            ...auth(),
            body: JSON.stringify({ status: "IN_PROGRESS" }),
        });

        assert.equal(response.status, 200);
        assert.equal(body.data.status, "IN_PROGRESS");

        const statusEvent = await prisma.claimTimelineEvent.findFirst({
            where: { claimId, status: "IN_PROGRESS" },
        });
        assert.ok(statusEvent);
    });

    test("another user cannot access the claim", async () => {
        const { response, body } = await server.request(`/claims/${claimId}`, {
            uid: other.firebaseUid,
        });

        assert.equal(response.status, 403);
        assert.equal(body.code, "FORBIDDEN");
    });

    test("detaches claim evidence without deleting the document", async () => {
        const { response } = await server.request(`/claims/${claimId}/documents/${document.id}`, {
            method: "DELETE",
            ...auth(),
        });

        assert.equal(response.status, 200);
        assert.equal(await prisma.claimDocument.count({ where: { claimId } }), 0);
        assert.ok(await prisma.document.findUnique({ where: { id: document.id } }));
    });
}
