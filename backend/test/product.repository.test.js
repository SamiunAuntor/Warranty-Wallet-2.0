const test = require("node:test");
const assert = require("node:assert/strict");
const prisma = require("../src/config/prisma");
const repository = require("../src/modules/product/product.repository");

test("asset list uses a valid scalar document count selection", async (t) => {
    const original = prisma.product.findMany;
    let query;
    prisma.product.findMany = async (input) => { query = input; return []; };
    t.after(() => { prisma.product.findMany = original; });

    await repository.findMany({ where: { userId: "user-id" }, orderBy: { createdAt: "desc" }, skip: 0, take: 8 });

    assert.equal(query.include._count.select.documents, true);
    assert.equal(typeof query.include._count.select.documents, "boolean");
});

test("asset details load claim counts for document lock controls", async (t) => {
    const original = prisma.product.findFirst;
    let query;
    prisma.product.findFirst = async (input) => { query = input; return null; };
    t.after(() => { prisma.product.findFirst = original; });

    await repository.findById("asset-id");

    assert.deepEqual(query.include.documents.include._count.select, { claims: true });
});
