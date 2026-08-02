const test = require("node:test");
const assert = require("node:assert/strict");
const { calendarDaysBetween } = require("../src/jobs/warranty.job");
const warrantyReminderTemplate = require("../src/templates/warrantyReminder.template");

test("warranty reminder dates use calendar days instead of elapsed hours", () => {
    const today = new Date("2026-08-02T23:45:00.000Z");
    const expiry = new Date("2026-08-03T00:05:00.000Z");
    assert.equal(calendarDaysBetween(today, expiry), 1);
});

test("short warranties are detected through the thirty-day boundary", () => {
    const today = new Date("2026-08-02T12:00:00.000Z");
    assert.equal(calendarDaysBetween(today, new Date("2026-09-01T12:00:00.000Z")), 30);
});

test("warranty email contains asset details and escapes user content", () => {
    const html = warrantyReminderTemplate({ userName: "Sam <Admin>", productName: "Test Phone", brand: "Acme", category: "Electronics", expiryDate: "August 20, 2026", daysRemaining: 18, dashboardUrl: "https://example.com/dashboard/assets" });
    assert.match(html, /Warranty Expiring Soon/);
    assert.match(html, /Test Phone/);
    assert.match(html, /18 days/);
    assert.match(html, /Sam &lt;Admin&gt;/);
    assert.match(html, /https:\/\/example.com\/dashboard\/assets/);
});
