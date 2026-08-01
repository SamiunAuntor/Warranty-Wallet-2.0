const ai = require("../../config/gemini");
const env = require("../../config/env");

const ApiError = require("../../utils/ApiError");
const { hasValidFileSignature } = require("../../utils/fileValidation");
const { z } = require("zod");

const extractedDocumentSchema = z.object({
    productName: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    serialNumber: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    purchasePrice: z.number().nullable().optional(),
    sellerName: z.string().nullable().optional(),
    invoiceNumber: z.string().nullable().optional(),
    warrantyDuration: z.number().int().nonnegative().nullable().optional(),
    warrantyType: z.enum(["MANUFACTURER", "EXTENDED"]).nullable().optional(),
    confidence: z.number().min(0).max(1).nullable().optional(),
});

const extractInvoice = async (file) => {

    if (!file) {

        throw new ApiError(
            400,
            "Invoice is required."
        );

    }

    if (!hasValidFileSignature(file)) {
        throw new ApiError(400, "The file contents do not match the declared PDF or image type.");
    }

    const prompt = `
You are an invoice extraction assistant.

Extract the following fields.

Return ONLY valid JSON.

{
  "productName":"",
  "brand":"",
  "model":"",
  "serialNumber":"",
  "category":"",
  "purchaseDate":"YYYY-MM-DD",
  "purchasePrice":0,
  "sellerName":"",
  "invoiceNumber":"",
  "warrantyDuration":null,
  "warrantyType":"MANUFACTURER or EXTENDED"
}

Rules

If unknown use null. Use YYYY-MM-DD for purchaseDate. Use months for warrantyDuration.

Do not explain anything.

No markdown.

No comments.

`;

    let response;

    try {
        response = await ai.models.generateContent({

            model: env.GEMINI_MODEL,

            contents: [

                {
                    inlineData: {

                        mimeType:
                            file.mimetype,

                        data:
                            file.buffer.toString(
                                "base64"
                            ),

                    },

                },

                {
                    text: prompt,
                },

            ],

        });
    } catch (error) {
        if (error?.status === 404) {
            throw new ApiError(503, `The configured AI model (${env.GEMINI_MODEL}) is unavailable. Please try again later.`);
        }

        if (error?.status === 429) {
            throw new ApiError(429, "The AI extraction limit has been reached. Please try again later.");
        }

        throw new ApiError(502, "The AI extraction service is temporarily unavailable. Please try again.");
    }

    const text = response.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    try {

        return extractedDocumentSchema.parse(JSON.parse(text));

    } catch {

        throw new ApiError(
            500,
            "Gemini returned invalid JSON."
        );

    }

};

module.exports = {
    extractInvoice,
    extractedDocumentSchema,
};
