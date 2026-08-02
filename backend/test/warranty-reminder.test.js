const test = require("node:test");
const assert = require("node:assert/strict");
const { calendarDaysBetween } = require("../src/jobs/warranty.job");

test("warranty reminder dates use calendar days instead of elapsed hours", () => {
    const today = new Date("2026-08-02T23:45:00.000Z");
    const expiry = new Date("2026-08-03T00:05:00.000Z");
    assert.equal(calendarDaysBetween(today, expiry), 1);
});

test("short warranties are detected through the thirty-day boundary", () => {
    const today = new Date("2026-08-02T12:00:00.000Z");
    assert.equal(calendarDaysBetween(today, new Date("2026-09-01T12:00:00.000Z")), 30);
});
