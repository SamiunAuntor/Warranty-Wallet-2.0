const assert = require("node:assert/strict");
const test = require("node:test");

const validate = require("../src/middlewares/validate.middleware");
const { createProductSchema } = require("../src/modules/product/product.validation");

const validProduct = {
    name: "MacBook Pro",
    brand: "Apple",
    categoryId: "cm12345678901234567890123",
    purchasePrice: "2499.99",
    purchaseDate: "2026-07-31",
    hasWarranty: true,
    warrantyDuration: 12,
    warrantyType: "MANUFACTURER",
};

test("validation middleware forwards coerced product values", async () => {
    const req = { body: { ...validProduct }, query: {}, params: {} };
    let nextCalled = false;
    const res = {
        status() {
            assert.fail("A valid request must not produce a validation response.");
        },
    };

    await validate(createProductSchema)(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.ok(req.body.purchaseDate instanceof Date);
    assert.equal(req.body.purchaseDate.toISOString(), "2026-07-31T00:00:00.000Z");
    assert.equal(req.body.purchasePrice, 2499.99);
});
