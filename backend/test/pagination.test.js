const assert = require("node:assert/strict");
const test = require("node:test");

const pagination = require("../src/utils/query/pagination");

test("uses stable defaults when pagination is omitted", () => {
    assert.deepEqual(pagination(), {
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
    });
});

test("calculates the database offset from page and limit", () => {
    assert.deepEqual(pagination({ page: "3", limit: "25" }), {
        skip: 50,
        take: 25,
        page: 3,
        limit: 25,
    });
});

test("rejects zero, negative, and non-numeric pagination values", () => {
    assert.deepEqual(pagination({ page: 0, limit: -5 }), {
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
    });

    assert.deepEqual(pagination({ page: "unknown", limit: "none" }), {
        skip: 0,
        take: 10,
        page: 1,
        limit: 10,
    });
});

test("normalizes fractional values to integers", () => {
    assert.deepEqual(pagination({ page: 2.9, limit: 4.8 }), {
        skip: 4,
        take: 4,
        page: 2,
        limit: 4,
    });
});

test("caps page size to protect list endpoints", () => {
    assert.deepEqual(pagination({ page: 2, limit: 1000 }), {
        skip: 100,
        take: 100,
        page: 2,
        limit: 100,
    });
});
