const assert = require("node:assert/strict");
const test = require("node:test");

const toSlug = require("../src/utils/slug");

test("slugifies ordinary category and brand names", () => {
    assert.equal(toSlug("Home Appliances"), "home-appliances");
    assert.equal(toSlug("  Apple  "), "apple");
});

test("removes accents while preserving their base letters", () => {
    assert.equal(toSlug("Café Électronique"), "cafe-electronique");
    assert.equal(toSlug("Crème brûlée"), "creme-brulee");
});

test("collapses punctuation and whitespace into one separator", () => {
    assert.equal(toSlug("Phones, Tablets & Wearables"), "phones-tablets-wearables");
    assert.equal(toSlug("Sony---Audio"), "sony-audio");
});

test("removes leading and trailing separators", () => {
    assert.equal(toSlug("---Extended Warranty---"), "extended-warranty");
    assert.equal(toSlug("***"), "");
});

test("produces stable slugs for already normalized input", () => {
    const slug = "home-office-equipment";
    assert.equal(toSlug(slug), slug);
    assert.equal(toSlug(toSlug(slug)), slug);
});
