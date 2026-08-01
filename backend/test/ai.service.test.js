const test = require("node:test");
const assert = require("node:assert/strict");

const ai = require("../src/config/gemini");
const env = require("../src/config/env");
const aiService = require("../src/modules/ai/ai.service");

const pngFile = {
    mimetype: "image/png",
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
};

test("invoice extraction uses the configured multimodal model", async (t) => {
    const originalGenerateContent = ai.models.generateContent;
    let requestedModel;
    ai.models.generateContent = async ({ model }) => {
        requestedModel = model;
        return { text: '{"productName":"Demo laptop","purchaseDate":"2026-07-18","purchasePrice":1299}' };
    };
    t.after(() => {
        ai.models.generateContent = originalGenerateContent;
    });

    const result = await aiService.extractInvoice(pngFile);

    assert.equal(requestedModel, env.GEMINI_MODEL);
    assert.equal(result.productName, "Demo laptop");
});

test("unavailable Gemini models return a readable service error", async (t) => {
    const originalGenerateContent = ai.models.generateContent;
    ai.models.generateContent = async () => {
        throw Object.assign(new Error("raw provider response"), { status: 404 });
    };
    t.after(() => {
        ai.models.generateContent = originalGenerateContent;
    });

    await assert.rejects(
        aiService.extractInvoice(pngFile),
        (error) => error.statusCode === 503 && error.message.includes(env.GEMINI_MODEL)
    );
});
