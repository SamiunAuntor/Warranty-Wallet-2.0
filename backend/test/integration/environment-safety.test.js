const assert = require("node:assert/strict");
const test = require("node:test");

const { assertSafeTestDatabase } = require("./helpers/environment");

test("accepts PostgreSQL database names containing test", () => {
    const url = "postgresql://user:password@localhost:5432/warranty_wallet_test";
    assert.equal(assertSafeTestDatabase(url), url);
});

test("rejects missing and malformed test database URLs", () => {
    assert.throws(() => assertSafeTestDatabase(), /required/i);
    assert.throws(() => assertSafeTestDatabase("not-a-url"), /valid PostgreSQL URL/i);
});

test("rejects non-PostgreSQL databases", () => {
    assert.throws(
        () => assertSafeTestDatabase("mysql://user:password@localhost/warranty_wallet_test"),
        /require PostgreSQL/i,
    );
});

test("refuses database names that do not explicitly contain test", () => {
    assert.throws(
        () => assertSafeTestDatabase("postgresql://user:password@localhost:5432/warranty_wallet"),
        /refusing to use database/i,
    );
    assert.throws(
        () => assertSafeTestDatabase("postgresql://user:password@localhost:5432/production"),
        /refusing to use database/i,
    );
});
